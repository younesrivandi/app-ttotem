const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');

const file=relative=>fs.readFileSync(path.join(process.cwd(),relative),'utf8');
function loadStages(){
 const js=ts.transpileModule(file('src/features/stages/model/stages.ts'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
 }).outputText;
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+js+'\n})',{})(
  name=>name==='zod'?require('zod'):(()=>{throw Error('Unexpected dependency '+name);})(),
  module,module.exports);
 return module.exports;
}
const {stageSchema,isStageLocked,isJourneyStageLocked,completed}=loadStages();
const stage=(id,status,isLocked,allowResume)=>stageSchema.parse({
 stageId:id,title:'مرحله '+id,order:Number(id),type:'story',
 isLocked,progress:status||allowResume?{status,allowResume}:undefined,
});
const unlocked=stages=>stages.map((value,index)=>!isJourneyStageLocked(value,index,stages));

test('initial story stage available; completing first unlocks second but not third',()=>{
 const stages=[stage(1,'completed',false),stage(2,null,true),stage(3,null,true)];
 assert.deepEqual(unlocked(stages),[true,true,false]);
});

test('previously completed stages stay available even when server lock flags are stale',()=>{
 const stages=[stage(1,'completed',true),stage(2,'completed',true),stage(3,null,true)];
 assert.deepEqual(unlocked(stages),[true,true,true]);
 assert.equal(completed(stages[1]),true);
});

test('when every stage is completed, all remain unlocked after returning to map',()=>{
 const stages=[1,2,3,4].map(id=>stage(id,'completed',true));
 assert.deepEqual(unlocked(stages),[true,true,true,true]);
 assert.deepEqual(unlocked(stages),[true,true,true,true]);
});

test('server progress keeps previously reached stage open even without its predecessor flag',()=>{
 const stages=[stage(1,null,false),stage(2,'in_progress',true),stage(3,null,true)];
 assert.deepEqual(unlocked(stages),[true,true,false]);
 const resumed=[stage(1,null,false),stage(2,null,true,true),stage(3,null,true)];
 assert.deepEqual(unlocked(resumed),[true,true,false]);
});

test('explicitly unlocked stages stay open; untouched future stages remain closed',()=>{
 const stages=[stage(1,null,false),stage(2,null,false),stage(3,null,true)];
 assert.deepEqual(unlocked(stages),[true,true,false]);
});

test('progress is scoped by stages response, never a global Story-run map',()=>{
 const firstChild=[stage(1,'completed',false),stage(2,null,true)];
 const secondChild=[stage(1,null,false),stage(2,null,true)];
 assert.deepEqual(unlocked(firstChild),[true,true]);
 assert.deepEqual(unlocked(secondChild),[true,false]);
});

test('returning from stages and going home never resets unlocked progress',()=>{
 const map=file('src/features/stages/screens/JourneyStagesScreen.tsx');
 const details=file('src/features/stages/screens/StageChallengesScreen.tsx');
 const model=file('src/features/stages/model/stages.ts');
 assert.doesNotMatch(map,/resetStoryRun\(/);
 assert.doesNotMatch(details,/resetStoryRun\(|storyRunCompleted\(/);
 assert.doesNotMatch(model,/storyRuns|storyRunHasCompleted/);
 assert.match(map,/useFocusEffect/);
 assert.match(map,/invalidateQueries\(\{queryKey:key\}\)/);
 assert.match(details,/invalidateQueries\(\{queryKey:queryKeys\.stages\(childId,journeyId\)\}\)/);
});

test('backend type-independent stage unlock uses same persistent progress',()=>{
 const stages=[stage(1,'completed',true),stage(2,null,true)];
 assert.equal(isStageLocked(stages[1],1,stages),false);
 assert.equal(isJourneyStageLocked(stages[1],1,stages),false);
});


function loadChallenges(){
 const js=ts.transpileModule(file('src/features/stages/model/challenges.ts'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
 }).outputText;
 const module={exports:{}};
 vm.runInNewContext('(function(require,module,exports){'+js+'\n})',{})(
  name=>name==='zod'?require('zod'):(()=>{throw Error('Unexpected dependency '+name);})(),
  module,module.exports);
 return module.exports;
}
const {challengeSchema,challengeLocked}=loadChallenges();
const challenges=()=>[1,2,3,4].map(n=>challengeSchema.parse({challengeId:String(n),order:n}));

test('new stage opens only its first challenge',()=>{
 const items=challenges();
 assert.deepEqual(items.map((item,index)=>challengeLocked(item,index,items,undefined,0,false)),[false,true,true,true]);
});
test('completedCount keeps previous challenges and the next challenge open',()=>{
 const items=challenges();
 assert.deepEqual(items.map((item,index)=>challengeLocked(item,index,items,undefined,2,false)),[false,false,false,true]);
});
test('nextChallengeId restores access to earlier challenges',()=>{
 const items=challenges();
 assert.deepEqual(items.map((item,index)=>challengeLocked(item,index,items,'3',0,false)),[false,false,false,true]);
});
test('completed stage allows replay of all challenges',()=>{
 const items=challenges();
 assert.deepEqual(items.map((item,index)=>challengeLocked(item,index,items,undefined,4,true)),[false,false,false,false]);
});
test('later completed challenge keeps earlier challenges open',()=>{
 const items=challenges();items[2].isCompleted=true;
 assert.deepEqual(items.map((item,index)=>challengeLocked(item,index,items,undefined,0,false)),[false,false,false,false]);
});
