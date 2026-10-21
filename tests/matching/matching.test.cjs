const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');

const jsx=(type,props,key)=>({type,props:props||{},key});
const react={
 useEffect:()=>{},useMemo:fn=>fn(),useRef:initial=>({current:initial}),
 useState:initial=>[initial,()=>{}],
};
const fill={position:'absolute',top:0,bottom:0,left:0,right:0};
const rn={
 Image:'Image',View:'View',Pressable:'Pressable',StyleSheet:{absoluteFill:fill,absoluteFillObject:fill},
 PanResponder:{create:handlers=>({panHandlers:handlers})},
};
const colors={primary:'#7755bb',border:'#dedede',surface:'#fff'};
const mocks={
 react,
 'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},
 'react-native':rn,
 'react-native-svg':{__esModule:true,default:'Svg',Circle:'Circle',Line:'Line'},
 './shared':{
  ItemLabel:'ItemLabel',AudioOption:'AudioOption',
  objectItem:value=>typeof value==='object'&&value!==null?value:{text:String(value)},
 },
 '@/components/ui/AppText':{AppText:'AppText'},
 '@/theme/ThemeProvider':{useAppTheme:()=>({colors})},
};
const source=fs.readFileSync(path.join(process.cwd(),'src/features/challenges/renderers/MatchingRenderer.tsx'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{
 module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,
}}).outputText;
const mod={exports:{}};
vm.runInNewContext('(function(require,module,exports){'+code+'\n})',{})(
 name=>{if(!(name in mocks))throw Error('unexpected module '+name);return mocks[name];},
 mod,mod.exports,
);
function flatten(node){
 if(Array.isArray(node))return node.flatMap(flatten);
 if(!node||typeof node!=='object')return [];
 if(typeof node.type==='function')return flatten(node.type(node.props));
 return [node,...flatten(node.props?.children)];
}
function render(sources,targets=[],matches=[]){
 return flatten(mod.exports.MatchingRenderer({sources,targets,matches,onConnect:()=>{},disabled:false}));
}

test('both left and right photo tiles use edge-to-edge cover inside square boxes',()=>{
 const nodes=render([{imageUrl:'https://images.test/right.png'}],[{imageUrl:'https://images.test/left.png'}]);
 const images=nodes.filter(node=>node.type==='Image');
 assert.equal(images.length,2);
 assert.ok(images.every(img=>img.props.resizeMode==='cover'));
 assert.ok(images.every(img=>img.props.style===fill));
 const tiles=nodes.filter(node=>node.type==='Pressable'&&node.props.accessibilityLabel?.includes('برای اتصال'));
 assert.equal(tiles.length,2);
 assert.ok(tiles.every(tile=>tile.props.style.padding===0));
 assert.ok(nodes.filter(node=>node.type==='View'&&node.props.style?.aspectRatio===1).length>=2);
});

test('text on a photo is centered at the bottom as an overlay, not a separate row',()=>{
 const nodes=render([{imageUrl:'https://images.test/flower.png',text:'گل آفتابگردان'}]);
 const image=nodes.find(node=>node.type==='Image');
 assert.ok(image);
 const label=nodes.find(node=>node.type==='AppText'&&node.props.children==='گل آفتابگردان');
 assert.ok(label);
 assert.equal(label.props.style.textAlign,'center');
 const overlay=nodes.find(node=>node.type==='View'&&node.props.style?.bottom===0&&
  node.props.style?.backgroundColor?.startsWith('rgba('));
 assert.ok(overlay);
 assert.equal(overlay.props.style.alignItems,'center');
 assert.equal(nodes.some(node=>node.type==='ItemLabel'),false);
});

test('photo-only tile keeps the full image and no empty caption block',()=>{
 const nodes=render([{imageUrl:'https://images.test/solo.png'}]);
 assert.equal(nodes.filter(node=>node.type==='Image').length,1);
 assert.equal(nodes.filter(node=>node.type==='AppText').length,0);
 assert.equal(nodes.filter(node=>node.type==='ItemLabel').length,0);
});

test('text-only options retain centered ItemLabel and photo audio remains accessible',()=>{
 const text=render([{text:'سیب'}]);
 const label=text.find(node=>node.type==='ItemLabel');
 assert.ok(label);
 assert.equal(label.props.centered,true);
 assert.equal(text.filter(node=>node.type==='Image').length,0);
 const photo=render([{imageUrl:'https://images.test/a.png',audioUrl:'https://audio.test/a.mp3'}]);
 assert.equal(photo.filter(node=>node.type==='AudioOption').length,1);
});

test('selection border and press handlers remain active',()=>{
 const nodes=render([{imageUrl:'https://images.test/one.png'}],[],[{sourceIndex:0,targetIndex:0}]);
 const tile=nodes.find(node=>node.type==='Pressable'&&node.props.accessibilityLabel?.includes('برای اتصال'));
 assert.ok(tile);
 assert.equal(tile.props.style.borderColor,'#52A878');
 assert.equal(tile.props.style.borderWidth,2);
 assert.equal(typeof tile.props.onPress,'function');
});
