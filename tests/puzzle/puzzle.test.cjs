const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');

const root=path.join(process.cwd(),'src/features/challenges/renderers');
function transpile(file,jsx=false){
 return ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,
   ...(jsx?{jsx:ts.JsxEmit.ReactJSX}:{})},
  reportDiagnostics:true,
 }).outputText;
}
function execute(js,mocks={}){
 const loaded={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+js+'\n})',{})(
  name=>{if(!(name in mocks))throw Error('Unexpected import: '+name);return mocks[name];},
  loaded,loaded.exports);
 return loaded.exports;
}
const model=execute(transpile('puzzleModel.ts'));
const {resolvePuzzleMedia,resolvePuzzleUri,fitPuzzleBoard,normalizePuzzleDrop}=model;
const plain=value=>JSON.parse(JSON.stringify(value));

test('Puzzle URL normalization: absolute, relative, encoded, data, unsafe',()=>{
 const base='https://api.ttotem.ir/';
 assert.equal(resolvePuzzleUri('/uploads/board.png',base),'https://api.ttotem.ir/uploads/board.png');
 assert.equal(resolvePuzzleUri('//cdn.example/board.png',base),'https://cdn.example/board.png');
 assert.equal(resolvePuzzleUri('https://cdn.example/image.png?sig=1',base),'https://cdn.example/image.png?sig=1');
 assert.equal(resolvePuzzleUri('data:image/png;base64,abcd',base),'data:image/png;base64,abcd');
 assert.equal(resolvePuzzleUri('javascript:alert(1)',base),undefined);
 assert.equal(resolvePuzzleUri(null,base),undefined);
});

test('visual board and internal mask with numeric/string piece identifiers',()=>{
 const actual=resolvePuzzleMedia({data:{boardImageUrl:'/board.png',maskImageUrl:'/mask.png',
  pieces:[{id:1,imageUrl:'/red.png'},{pieceId:'two',image:{url:'/blue.png'}}]}},'https://api.test');
 assert.equal(actual.background,'https://api.test/board.png');
 assert.equal(actual.mask,'https://api.test/mask.png');
 assert.deepEqual(plain(actual.pieces),[
  {id:'1',imageUrl:'https://api.test/red.png'},
  {id:'two',imageUrl:'https://api.test/blue.png'},
 ]);
});

test('single background, mask-only is not visible, and duplicate paths',()=>{
 const base='https://api.test';
 assert.equal(resolvePuzzleMedia({data:{displayImageUrl:'/display.png'}},base).background,base+'/display.png');
 assert.equal(resolvePuzzleMedia({imageUrl:'/fallback.png'},base).background,base+'/fallback.png');
 assert.equal(resolvePuzzleMedia({data:{maskImageUrl:'/guide.png'}},base).background,undefined);
 assert.equal(resolvePuzzleMedia({data:{maskImageUrl:'/guide.png'}},base).mask,base+'/guide.png');
 const same=resolvePuzzleMedia({data:{boardImageUrl:'/same.png',maskImageUrl:'/same.png'}},base);
 assert.equal(same.background,base+'/same.png');
});

test('missing, malformed and duplicate pieces report errors without invented IDs',()=>{
 const data=resolvePuzzleMedia({data:{pieces:[
  {id:'a',imageUrl:''},{id:'b',imageUrl:'/b.png'},
  {id:'b',imageUrl:'/repeat.png'},{imageUrl:'/unknown.png'},
 ]}},'https://api.test');
 assert.equal(data.invalidPieces,3);
 assert.deepEqual(plain(data.pieces),[{id:'b',imageUrl:'https://api.test/b.png'}]);
 assert.equal(resolvePuzzleMedia({data:{}},'https://api.test').background,undefined);
});

test('board fits wide, square, portrait and narrow images without stretching',()=>{
 for(const ratio of [0.25,0.5,1,1.7,3]){
  const frame=fitPuzzleBoard(320,480,ratio);
  assert.ok(frame.width<=320+1e-7);
  assert.ok(frame.height<=480+1e-7);
  assert.ok(Math.abs(frame.width/frame.height-ratio)<1e-7);
 }
 assert.deepEqual(plain(fitPuzzleBoard(0,320,1)),{width:0,height:0});
});

test('touch drops use board coordinates and reject out-of-bounds/NaN',()=>{
 const board={x:100,y:200,width:300,height:150};
 assert.deepEqual(plain(normalizePuzzleDrop(250,275,board)),{x:0.5,y:0.5});
 assert.deepEqual(plain(normalizePuzzleDrop(100,200,board)),{x:0,y:0});
 assert.equal(normalizePuzzleDrop(401,200,board),null);
 assert.equal(normalizePuzzleDrop(150,400,board),null);
 assert.equal(normalizePuzzleDrop(NaN,250,board),null);
 assert.equal(normalizePuzzleDrop(150,250,{...board,width:0}),null);
});

const jsx=(type,props,key)=>({type,props:props||{},key});
const react={useEffect:()=>{},useMemo:fn=>fn(),useRef:v=>({current:v}),useState:v=>[v,()=>{}]};
const animated={View:'AnimatedView',ValueXY:class{setValue(){}getTranslateTransform(){return [];}}};
const native={View:'View',Pressable:'Pressable',Image:'Image',Animated:animated,
 PanResponder:{create:()=>({panHandlers:{}})},useWindowDimensions:()=>({width:360,height:800})};
function render(props){
 const component=execute(transpile('PuzzleRenderer.tsx',true),{
  react,'react-native':native,'react/jsx-runtime':{jsx,jsxs:jsx},
  '@/components/ui/AppText':{AppText:'AppText'},'./puzzleModel':model,
 }).PuzzleRenderer;
 return component({pieces:[],placements:{},disabled:false,onDrop:()=>{},...props});
}
function nodes(node){
 if(!node||typeof node!=='object')return [];
 if(Array.isArray(node))return node.flatMap(nodes);
 return [node,...nodes(node.props?.children)];
}

test('missing board produces an explicit error, not a silent white rectangle',()=>{
 const all=nodes(render({}));
 assert.equal(all.filter(n=>n.type==='Image').length,0);
 assert.ok(all.some(n=>n.type==='AppText'&&n.props.children.includes('تصویر اصلی پازل')));
});

test('visible board is the only image; an internal color mask is never rendered',()=>{
 const all=nodes(render({background:'https://cdn/board.png',mask:'https://cdn/guide.png'}));
 const images=all.filter(n=>n.type==='Image');
 assert.deepEqual(images.map(n=>n.props.source.uri),['https://cdn/board.png']);
 assert.ok(images.every(n=>n.props.resizeMode==='contain'));
 assert.ok(all.some(n=>n.type==='Pressable'&&n.props.accessibilityRole==='button'));
});

test('mask-only puzzle cannot render a color mask as the board',()=>{
 const images=nodes(render({mask:'https://cdn/guide.png'})).filter(n=>n.type==='Image');
 assert.equal(images.length,0);
});

test('invalid piece metadata is surfaced to the user',()=>{
 const all=nodes(render({background:'https://cdn/board.png',invalidPieces:2}));
 assert.ok(all.some(n=>n.type==='AppText'&&String(n.props.children).includes('قطعه پازل ناقص')));
});

test('legacy image in title or prompt can provide the missing board',()=>{
 const base='https://api.test';
 assert.equal(resolvePuzzleMedia({title:{imageUrl:'/target.png'},data:{pieces:[]}},base).background,base+'/target.png');
 assert.equal(resolvePuzzleMedia({data:{prompt:{imageUrl:'/question.png'}}},base).background,base+'/question.png');
});

test('puzzle image layers ignore touches via View and never pass pointerEvents to Image',()=>{
 const all=nodes(render({background:'https://cdn/board.png',guide:'https://cdn/guide.png'}));
 const images=all.filter(n=>n.type==='Image');
 assert.equal(images.length,1);
 assert.ok(images.every(n=>!Object.prototype.hasOwnProperty.call(n.props,'pointerEvents')));
 assert.ok(all.some(n=>n.type==='View'&&n.props.pointerEvents==='none'&&n.props.style?.position==='absolute'));
});

test('flower-table regression: colored answer mask never replaces or covers the board',()=>{
 const base='https://api.test';
 const media=resolvePuzzleMedia({kind:'Puzzle',data:{
  displayImageUrl:'/uploads/flower-table-grid.png',
  boardImageUrl:'/uploads/legacy-board.png',
  maskImageUrl:'/uploads/red-green-blue-yellow-validation-mask.png',
  pieces:[{id:'rose',imageUrl:'/rose.png'}],
 }},base);
 assert.equal(media.background,base+'/uploads/flower-table-grid.png');
 assert.equal(media.mask,base+'/uploads/red-green-blue-yellow-validation-mask.png');
 const imgs=nodes(render({background:media.background})).filter(n=>n.type==='Image');
 assert.deepEqual(imgs.map(n=>n.props.source.uri),[base+'/uploads/flower-table-grid.png']);
 assert.ok(imgs.every(n=>!n.props.source.uri.includes('mask')));
});
