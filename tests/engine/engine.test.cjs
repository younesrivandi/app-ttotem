const {test}=require('node:test');const assert=require('node:assert/strict');
const {classifyChallenge,initialGameState,shuffledIndexes,toggleChoice,moveSorting,connectMatch,setStrokes,canSubmit,buildAttempt,applyFeedback,resolveNextStep}=require('../../.stage11-test-build/gameEngine.js');
const choice={kind:'Choice',data:{options:['a','b','c'],allowMultiple:true}};
test('recognition and precedence',()=>{assert.equal(classifyChallenge({kind:'choice',data:{videoUrl:'a'}}),'video');assert.equal(classifyChallenge({kind:'peer'}),'matching');assert.equal(classifyChallenge({kind:'Puzzle'}),'puzzle');assert.equal(classifyChallenge({kind:'unknown'}),'unsupported');});
test('sorting never starts solved',()=>{assert.deepEqual(shuffledIndexes(3,()=>0.99),[1,0,2]);const s=initialGameState({kind:'sort',data:{items:[1,2,3]}},1,()=>0.99);assert.notDeepEqual(s.sortOrder,[0,1,2]);assert.deepEqual(moveSorting(s,0,2).sortOrder,[0,2,1]);});
test('choice single and multiple',()=>{let s=initialGameState(choice,100);s=toggleChoice(s,2,3,true);s=toggleChoice(s,0,3,true);assert.deepEqual(buildAttempt(choice,s,350).answer,[0,2]);assert.deepEqual(toggleChoice(s,1,3,false).selected,[1]);assert.equal(toggleChoice(s,99,3,true),s);});
test('matching unique source and destination',()=>{let s=initialGameState({kind:'matching'},100);s=connectMatch(s,0,0,2,2);s=connectMatch(s,1,0,2,2);assert.deepEqual(s.matches,[{sourceIndex:1,targetIndex:0}]);assert.equal(canSubmit({kind:'matching',data:{collections:[[1,2],[3,4]]}},s),false);});
test('path limited and valid',()=>{const spec={kind:'path'};let s=initialGameState(spec,100);s=setStrokes(s,[{points:[{x:0,y:0},{x:3,y:5}]}]);assert.equal(canSubmit(spec,s),true);assert.deepEqual(buildAttempt(spec,s,140).answer,[{points:[{x:0,y:0},{x:3,y:5}]}]);});
test('voice and media gates',()=>{const voice={kind:'voice'};let s=initialGameState(voice,100);assert.equal(canSubmit(voice,s),false);s={...s,voiceRecording:'blob:abc'};assert.equal(canSubmit(voice,s),true);assert.equal(canSubmit({kind:'content',data:{requireMediaCompletion:true,audioUrl:'a'}},s),false);assert.equal(canSubmit({kind:'content'},s),true);});
test('backend feedback and time clamp',()=>{let s=toggleChoice(initialGameState(choice,100),0,3,true);assert.equal(buildAttempt(choice,s,9000000).timeSpentMilliseconds,3600000);s=applyFeedback(s,{isCorrect:false});assert.equal(s.mistakes,1);s=applyFeedback(s,{isCorrect:true});assert.equal(s.solved,true);assert.equal(canSubmit(choice,s),false);});
test('next challenge respects completion',()=>{const items=[{challengeId:'a',order:1},{challengeId:'b',order:2,isCompleted:true},{challengeId:'c',order:3}];assert.deepEqual(resolveNextStep('a',1,items,'b','c'),{kind:'challenge',challengeId:'c'});assert.deepEqual(resolveNextStep('c',3,items),{kind:'check-result'});});

test('peer-to-peer only sends a complete, normalized answer to the server',()=>{
 const spec={kind:'PeerToPeer',data:{collections:[['right-1','right-2'],['left-1','left-2']]}};
 let state=initialGameState(spec,100);
 state=connectMatch(state,1,0,2,2);
 assert.equal(canSubmit(spec,state),false);
 state=connectMatch(state,0,1,2,2);
 assert.equal(canSubmit(spec,state),true);
 assert.deepEqual(buildAttempt(spec,state,300).answer,[
  {sourceIndex:0,targetIndex:1},{sourceIndex:1,targetIndex:0},
 ]);
 // An incorrect response never advances the game or marks it solved.
 state=applyFeedback(state,{isCorrect:false});
 assert.equal(state.solved,false);
 assert.equal(state.mistakes,1);
 state=connectMatch(state,0,0,2,2);
 assert.equal(canSubmit(spec,state),false);
 state=connectMatch(state,1,1,2,2);
 assert.equal(canSubmit(spec,state),true);
 assert.deepEqual(buildAttempt(spec,state,400).answer,[
  {sourceIndex:0,targetIndex:0},{sourceIndex:1,targetIndex:1},
 ]);
});

test('path retains disconnected strokes in a single server attempt',()=>{
 const spec={kind:'Path',data:{}};
 let state=initialGameState(spec,100);
 const first={points:[{x:0.1,y:0.2},{x:0.25,y:0.3}]};
 const second={points:[{x:0.65,y:0.75},{x:0.85,y:0.95}]};
 state=setStrokes(state,[first]);
 assert.equal(state.strokes.length,1);
 state=setStrokes(state,[...state.strokes,second]);
 assert.equal(state.strokes.length,2);
 assert.deepEqual(buildAttempt(spec,state,500).answer,[first,second]);
 const rejected=applyFeedback(state,{isCorrect:false});
 const cleared=setStrokes(rejected,[]);
 assert.equal(cleared.strokes.length,0);
 assert.equal(cleared.mistakes,1);
 assert.equal(canSubmit(spec,cleared),false);
});
