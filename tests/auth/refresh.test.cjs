// Integration regression tests for the real HTTP module with mocked transport and session.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}
function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}
function setup(handler) {
  let sessions = {
    parent: { accessToken: 'old-parent', refreshToken: 'refresh-parent' },
    child: { accessToken: 'old-child', refreshToken: 'refresh-child' },
    childId: 'child-1',
  };
  const versions = { parent: 0, child: 0 };
  const session = {
    bootstrapSession: async () => {},
    currentSession: () => sessions,
    currentRevision: role => versions[role],
    clearRoleSession: async role => {
      versions[role]++;
      if (role === 'parent') sessions = {};
      else { delete sessions.child; delete sessions.childId; }
    },
    updateRefreshedPair: async (role, pair, expected) => {
      if (versions[role] !== expected || !sessions[role]) return false;
      sessions[role] = { ...sessions[role], ...pair };
      return true;
    },
  };
  const file = path.join(__dirname, '../../src/services/api/http.ts');
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  const mocked = name => {
    if (name === '@/services/auth/session') return session;
    if (name === './config') return { API_BASE_URL: 'https://api.test', DEFAULT_TIMEOUT_MS: 2000 };
    if (name === './errors') {
      class ApiError extends Error { constructor(message, status, code) { super(message); this.status = status; this.code = code; } }
      class NetworkError extends Error {}
      return { ApiError, NetworkError };
    }
    return require(name);
  };
  vm.runInNewContext('(function(require,module,exports,fetch,Response,AbortController,setTimeout,clearTimeout) {' + js + '\n})',
    { })(mocked, module, module.exports, handler, Response, AbortController, setTimeout, clearTimeout);
  return { http: module.exports.httpRequest, session, getSession: () => sessions };
}

test('three simultaneous 401 responses share one refresh and replay with the new child token', async () => {
  const gate = deferred();
  let refreshCalls = 0;
  const seen = [];
  const { http } = setup(async (url, init) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCalls++;
      await gate.promise;
      return json({ accessToken: 'new-child', refreshToken: 'next-refresh' });
    }
    seen.push(init.headers.Authorization);
    if (init.headers.Authorization === 'Bearer old-child') return json({ message: 'expired' }, 401);
    return json({ ok: true });
  });
  const requests = [1, 2, 3].map(n => http('/api/v1/child/' + n));
  await new Promise(resolve => setImmediate(resolve));
  gate.resolve();
  const result = await Promise.all(requests);
  assert.equal(refreshCalls, 1);
  assert.deepEqual(result, [{ ok: true }, { ok: true }, { ok: true }]);
  assert.equal(seen.filter(v => v === 'Bearer new-child').length, 3);
});

test('new requests wait while parent refresh is in progress', async () => {
  const gate = deferred();
  let refreshCalls = 0;
  const calls = [];
  const { http } = setup(async (url, init) => {
    if (url.endsWith('/auth/refresh')) { refreshCalls++; await gate.promise; return json({ accessToken: 'new-parent' }); }
    calls.push(init.headers.Authorization);
    return init.headers.Authorization === 'Bearer old-parent' ? json({}, 401) : json({ ok: true });
  });
  const first = http('/api/v1/children', { auth: 'parent' });
  await new Promise(resolve => setImmediate(resolve));
  const second = http('/api/v1/children/2', { auth: 'parent' });
  await new Promise(resolve => setImmediate(resolve));
  gate.resolve();
  await Promise.all([first, second]);
  assert.equal(refreshCalls, 1);
  assert.equal(calls.filter(v => v === 'Bearer old-parent').length, 1);
});

test('invalid refresh logs out only child and does not replay', async () => {
  let attempts = 0;
  const { http, getSession } = setup(async url => {
    if (url.endsWith('/auth/refresh')) return json({}, 401);
    attempts++;
    return json({}, 401);
  });
  await assert.rejects(http('/api/v1/child/journeys'));
  assert.equal(attempts, 1);
  assert.equal(getSession().child, undefined);
  assert.ok(getSession().parent);
});

test('a second 401 never triggers a second refresh', async () => {
  let refreshCalls = 0;
  const { http } = setup(async url => {
    if (url.endsWith('/auth/refresh')) { refreshCalls++; return json({ accessToken: 'new-child' }); }
    return json({}, 401);
  });
  await assert.rejects(http('/api/v1/child/journeys'));
  assert.equal(refreshCalls, 1);
});
