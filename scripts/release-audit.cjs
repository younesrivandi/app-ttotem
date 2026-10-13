const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const pkg = require('../package.json');
const expo = require('../app.json').expo;
const errors = [];
function check(condition, message) { if (!condition) errors.push(message); }
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const paths = walk(path.join(root, 'app')).filter(p => /\.tsx$/.test(p));
const required = ['login.tsx','join/[slug].tsx','result/[stageId].tsx','stages/[stageId].tsx','play/[stageId]/[challengeId].tsx'];
for (const file of required) check(fs.existsSync(path.join(root,'app',file)),`Missing route ${file}`);
check(expo.scheme === 'ttotem', 'Deep-link scheme changed');
check(expo.web?.bundler === 'metro', 'Web Metro bundler missing');
check(expo.plugins?.some(p => Array.isArray(p) && p[0] === 'expo-audio'), 'expo-audio microphone plugin missing');
check(Boolean(pkg.dependencies['expo-secure-store']), 'SecureStore dependency missing');
check(Boolean(pkg.dependencies['expo-haptics']), 'Haptics dependency missing');
check(Boolean(pkg.dependencies['expo-video']), 'Video dependency missing');
check(Boolean(pkg.dependencies['react-native-gesture-handler']), 'Gesture dependency missing');
const source = walk(path.join(root,'src')).filter(p => /\.[jt]sx?$/.test(p));
for (const file of source) {
 const relative = path.relative(root,file).split(path.sep).join('/');
 const body = fs.readFileSync(file,'utf8');
 if (/from\s+['"]next(?:\/|['"])/.test(body)) errors.push(`Next.js import in ${relative}`);
 if (/\bwindow\.localStorage\b/.test(body) && !relative.endsWith('src/features/auth/services/deviceInfo.web.ts')) errors.push(`Review window.localStorage usage in ${relative}`);
}
console.log(`Static release audit: ${paths.length} route files, ${source.length} source files`);
const release = process.argv.includes('--release');
if (release) {
 for (const name of ['TTOTEM_ANDROID_PACKAGE','TTOTEM_IOS_BUNDLE_ID','EAS_PROJECT_ID','EXPO_PUBLIC_API_BASE_URL'])
  check(Boolean(process.env[name]), `Missing environment variable ${name}`);
 const api = process.env.EXPO_PUBLIC_API_BASE_URL;
 if (api) check(/^https:\/\//.test(api), 'Production API base must use HTTPS');
 check(fs.existsSync(path.join(root,'package-lock.json')), 'Commit package-lock.json created using npm install before release');
}
if (errors.length) { console.error('FAILED:\n' + errors.map(e=>'- '+e).join('\n')); process.exitCode = 1; }
else console.log('PASS: static checks' + (release ? ' and release prerequisites' : ''));
