const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const renderers=path.join(process.cwd(),'src/features/challenges/renderers');
function transpile(filename){
 return ts.transpileModule(fs.readFileSync(path.join(renderers,filename),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX},
 }).outputText;
}
function execute(js,mocks,globals={}){
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports,setTimeout,clearTimeout){'+js+'\n})',{})(
  name=>{if(!(name in mocks))throw new Error('unexpected module '+name);return mocks[name];},
  module,module.exports,globals.setTimeout??setTimeout,globals.clearTimeout??clearTimeout);
 return module.exports;
}
function fakeClock(){
 let now=0,id=0;
 const timers=new Map();
 return {
  setTimeout(callback,delay){const key=++id;timers.set(key,{at:now+delay,callback});return key;},
  clearTimeout(key){timers.delete(key);},
  advance(ms){
   const end=now+ms;
   while(true){
    const pending=[...timers.entries()].filter(([,t])=>t.at<=end)
     .sort((a,b)=>a[1].at-b[1].at)[0];
    if(!pending)break;
    now=pending[1].at;timers.delete(pending[0]);pending[1].callback();
   }
   now=end;
  },
  get pending(){return timers.size;},
 };
}
function makeScheduler(clock){
 const module=execute(transpile('pathIdleScheduler.ts'),{},clock);
 return module;
}
test('Path auto-submit occurs only after the full 1800ms quiet period',()=>{
 const clock=fakeClock(),{createPathIdleScheduler,PATH_IDLE_DELAY_MS}=makeScheduler(clock);
 assert.equal(PATH_IDLE_DELAY_MS,1800);
 let submitted=0;
 const scheduler=createPathIdleScheduler(()=>submitted++);
 scheduler.schedule();
 clock.advance(1799);assert.equal(submitted,0);
 clock.advance(1);assert.equal(submitted,1);
 clock.advance(5000);assert.equal(submitted,1);
});
test('starting another distant stroke cancels the old request and resets the wait',()=>{
 const clock=fakeClock(),{createPathIdleScheduler}=makeScheduler(clock);
 const submissions=[];
 let strokes=0;
 const scheduler=createPathIdleScheduler(()=>submissions.push(strokes));
 strokes++;scheduler.schedule();
 clock.advance(1300);
 scheduler.cancel(); // Next finger touches the drawing area.
 clock.advance(1500);assert.deepEqual(submissions,[]);
 strokes++;scheduler.schedule();
 clock.advance(1799);assert.deepEqual(submissions,[]);
 clock.advance(1);assert.deepEqual(submissions,[2]);
});
test('releasing several strokes quickly coalesces into one latest submission',()=>{
 const clock=fakeClock(),{createPathIdleScheduler}=makeScheduler(clock);
 let current=0;
 const results=[];
 const scheduler=createPathIdleScheduler(()=>results.push(current));
 current=1;scheduler.schedule();clock.advance(500);
 current=2;scheduler.schedule();clock.advance(900);
 current=3;scheduler.schedule();clock.advance(1799);
 assert.deepEqual(results,[]);
 clock.advance(1);assert.deepEqual(results,[3]);
});
test('unmount/cancel prevents late requests',()=>{
 const clock=fakeClock(),{createPathIdleScheduler}=makeScheduler(clock);
 let sent=0;
 const scheduler=createPathIdleScheduler(()=>sent++);
 scheduler.schedule();clock.advance(1000);scheduler.cancel();
 clock.advance(6000);
 assert.equal(sent,0);
 assert.equal(clock.pending,0);
});
const jsx=(type,props)=>({type,props:props??{}});
const flatten=node=>{
 if(Array.isArray(node))return node.flatMap(flatten);
 if(!node||typeof node!=='object')return [];
 return [node,...flatten(node.props?.children)];
};
function renderer({strokes=[],showReset=false,onReset=()=>{},onStrokeEnd=()=>{},onDrawingChange=()=>{}}={}){
 let pan;
 const mocks={
  react:{useMemo:fn=>fn(),useRef:value=>({current:value}),useState:value=>[value,()=>{}]},
  'react/jsx-runtime':{jsx,jsxs:jsx},
  'react-native':{Image:'Image',View:'View',Pressable:'Pressable',PanResponder:{
   create:handlers=>{pan=handlers;return {panHandlers:handlers};},
  }},
  'react-native-svg':{__esModule:true,default:'Svg',Polyline:'Polyline',Path:'Path'},
  '@/theme/ThemeProvider':{useAppTheme:()=>({colors:{border:'#ddd',surface:'#fff',primary:'#4488ff'}})},
 };
 const component=execute(transpile('PathRenderer.tsx'),mocks).PathRenderer;
 const tree=component({strokes,showReset,onReset,onStrokeEnd,onDrawingChange,onChange:()=>{}});
 return {nodes:flatten(tree),pan};
}
test('no permanent clear button; a refresh icon appears only after error',()=>{
 const regular=renderer();
 assert.equal(regular.nodes.some(node=>node.type==='Pressable'),false);
 const recover=renderer({showReset:true});
 const button=recover.nodes.find(node=>node.type==='Pressable');
 assert.ok(button);
 assert.equal(button.props.accessibilityLabel,'رسم دوباره مسیر');
 assert.equal(recover.nodes.some(node=>node.type==='Path'),true);
});
test('lift and re-touch preserve two independent strokes and report drawing state',()=>{
 let strokes=[],drawn=[];
 for(let i=0;i<2;i++){
  const {nodes,pan}=renderer({strokes,onStrokeEnd:next=>{strokes=next;},onDrawingChange:v=>drawn.push(v)});
  const canvas=nodes.find(node=>node.type==='View'&&typeof node.props.onLayout==='function');
  assert.ok(canvas);canvas.props.onLayout({nativeEvent:{layout:{width:300,height:280}}});
  pan.onPanResponderGrant({nativeEvent:{locationX:20,locationY:40}});
  pan.onPanResponderMove({}, {dx:40+i*10,dy:40});
  pan.onPanResponderRelease();
 }
 assert.equal(strokes.length,2);
 assert.equal(strokes.every(stroke=>stroke.points.length>=2),true);
 assert.deepEqual(drawn,[true,false,true,false]);
});
