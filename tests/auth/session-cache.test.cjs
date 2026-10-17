// Regression tests for token rotation versus a real session-identity change.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');

function setup(){
 const state={parentRevision:0,childRevision:0,childId:'child-1',
  parentToken:'parent-old',childToken:'child-old'};
 let listener=()=>{};
 let instance;
 class FakeQueryClient{
  constructor(config){this.config=config;this.clears=0;instance=this;}
  clear(){this.clears++;}
 }
 class ApiError extends Error{
  constructor(status){super('HTTP error');this.status=status;}
 }
 class NetworkError extends Error{}
 const mock={
  '@tanstack/react-query':{QueryClient:FakeQueryClient,QueryClientProvider:()=>null},
  'react':{
   useState:initializer=>[initializer()],
   useEffect:callback=>{callback();},
  },
  'react/jsx-runtime':{jsx:(_type,props)=>props.children},
  '@/services/auth/session':{
   bootstrapSession:async()=>{},
   currentRevision:role=>role==='parent'?state.parentRevision:state.childRevision,
   currentSession:()=>({childId:state.childId}),
   subscribeSession:next=>{listener=next;return ()=>{listener=()=>{};};},
  },
  '@/services/api/errors':{ApiError,NetworkError},
 };
 const source=fs.readFileSync(path.join(process.cwd(),'src/bootstrap/providers/DataProvider.tsx'),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{
  module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,
 }}).outputText;
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+js+'\n})',{})(name=>{
  if(!(name in mock))throw new Error('Unexpected module '+name);
  return mock[name];
 },module,module.exports);
 module.exports.DataProvider({children:null});
 return {state,client:instance,notify:()=>listener(),ApiError,NetworkError};
}

test('parent and child refresh never clear pending query data',()=>{
 const {state,client,notify}=setup();
 state.childToken='child-rotated';
 notify();
 state.parentToken='parent-rotated';
 notify();
 assert.equal(client.clears,0);
});

test('logout and child switch clear the cache once per identity change',()=>{
 const {state,client,notify}=setup();
 state.childId='child-2';
 state.childRevision++;
 notify();
 assert.equal(client.clears,1);
 notify();
 assert.equal(client.clears,1);
 state.parentRevision++;
 state.childRevision++;
 state.childId='';
 notify();
 assert.equal(client.clears,2);
});

test('bootstrap child selection invalidates only when the identity changes',()=>{
 const {state,client,notify}=setup();
 notify();
 assert.equal(client.clears,0);
 state.childId='child-from-disk';
 notify();
 assert.equal(client.clears,1);
});

test('query retries network/server failures once, but never repeats a 401',()=>{
 const {client,ApiError,NetworkError}=setup();
 const retry=client.config.defaultOptions.queries.retry;
 assert.equal(retry(0,new ApiError(401)),false);
 assert.equal(retry(0,new ApiError(403)),false);
 assert.equal(retry(0,new ApiError(400)),false);
 assert.equal(retry(0,new ApiError(503)),true);
 assert.equal(retry(1,new ApiError(503)),false);
 assert.equal(retry(0,new NetworkError()),true);
 assert.equal(retry(1,new NetworkError()),false);
 assert.equal(retry(0,new Error('invalid schema')),false);
});
