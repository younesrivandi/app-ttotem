import type {AttemptPayload,ChallengeSpec,EngineState,GameKind,Match,NextStep,Point,ServerFeedback,StageChallenge,Stroke} from './types';
export const MAX_PATH_POINTS=4000;
const inRange=(n:number,length:number)=>Number.isInteger(n)&&n>=0&&n<length;
const capped=(n:number,max:number)=>Math.max(0,Math.min(max,Number.isFinite(n)?n:0));
/** Video takes precedence in the legacy page even if its kind says choice. */
export function classifyChallenge(spec:ChallengeSpec):GameKind{
 const kind=String(spec.kind??'').toLowerCase();
 if(spec.data?.videoUrl)return 'video';
 if(kind.includes('puzzle'))return 'puzzle';
 if(kind.includes('choice'))return 'choice';
 if(kind.includes('sort'))return 'sorting';
 if(kind.includes('voice'))return 'voice';
 if(kind.includes('peer')||kind==='matching')return 'matching';
 if(kind.includes('path'))return 'path';
 if(kind.includes('content'))return 'content';
 return 'unsupported';
}
/** Fisher–Yates; for 2+ items never show solved identity order initially. */
export function shuffledIndexes(length:number,random:()=>number=Math.random):number[]{
 if(!Number.isSafeInteger(length)||length<0||length>10000)throw new RangeError('Invalid item count');
 const indexes=Array.from({length},(_,i)=>i);
 for(let i=indexes.length-1;i>0;i--){const sample=random();const j=Math.floor(Math.min(0.999999999999,Math.max(0,Number.isFinite(sample)?sample:0))*(i+1));[indexes[i],indexes[j]]=[indexes[j]!,indexes[i]!];}
 if(indexes.length>1&&indexes.every((v,i)=>v===i))[indexes[0],indexes[1]]=[indexes[1]!,indexes[0]!];
 return indexes;
}
export function initialGameState(spec:ChallengeSpec,now=Date.now(),random:()=>number=Math.random):EngineState{
 return {selected:[],sortOrder:shuffledIndexes(spec.data?.items?.length??0,random),matches:[],strokes:[],voiceRecording:'',recording:false,completedMedia:[],mistakes:0,startedAt:now,submitting:false,solved:false};
}
export function toggleChoice(state:EngineState,index:number,count:number,multiple:boolean):EngineState{
 if(state.solved||state.submitting||!inRange(index,count))return state;
 const selected=multiple?(state.selected.includes(index)?state.selected.filter(n=>n!==index):[...state.selected,index]):[index];
 return {...state,selected};
}
export function moveSorting(state:EngineState,from:number,to:number):EngineState{
 if(state.solved||state.submitting||!inRange(from,state.sortOrder.length)||!inRange(to,state.sortOrder.length)||from===to)return state;
 const next=[...state.sortOrder];const [item]=next.splice(from,1);if(item===undefined)return state;next.splice(to,0,item);return {...state,sortOrder:next};
}
export function connectMatch(state:EngineState,sourceIndex:number,targetIndex:number,sourceCount:number,targetCount:number):EngineState{
 if(state.solved||state.submitting||!inRange(sourceIndex,sourceCount)||!inRange(targetIndex,targetCount))return state;
 const matches:Match[]=[...state.matches.filter(m=>m.sourceIndex!==sourceIndex&&m.targetIndex!==targetIndex),{sourceIndex,targetIndex}].sort((a,b)=>a.sourceIndex-b.sourceIndex);
 return {...state,matches};
}
export function setStrokes(state:EngineState,strokes:readonly Stroke[]):EngineState{
 if(state.solved||state.submitting)return state;
 let remaining=MAX_PATH_POINTS;
 const normalized=strokes.map(stroke=>{
  const points:Point[]=stroke.points.filter(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)).slice(0,remaining).map(point=>({x:point.x,y:point.y}));remaining-=points.length;return {points};
 }).filter(s=>s.points.length>0);
 return {...state,strokes:normalized};
}
export function canSubmit(spec:ChallengeSpec,state:EngineState):boolean{
 if(state.submitting||state.solved)return false;
 switch(classifyChallenge(spec)){
 case 'video':return state.completedMedia.includes('video');
 case 'choice':return state.selected.length>0;
 case 'sorting':return state.sortOrder.length>1;
 case 'voice':return !!state.voiceRecording&&!state.recording;
 case 'matching':return (spec.data?.collections?.[0]?.length??0)>0&&state.matches.length===spec.data?.collections?.[0]?.length;
 case 'path':return state.strokes.some(s=>s.points.length>=2);
 case 'content':return !spec.data?.requireMediaCompletion||((!spec.data?.videoUrl||state.completedMedia.includes('video'))&&(!spec.data?.audioUrl||state.completedMedia.includes('audio')));
 default:return false;
 }
}
/** Answer correctness and score belong to backend, never guessed in the client. */
export function buildAttempt(spec:ChallengeSpec,state:EngineState,now:number):AttemptPayload|null{
 if(!canSubmit(spec,state))return null;
 let answer:unknown;
 switch(classifyChallenge(spec)){
 case 'video':case 'content':answer=true;break;
 case 'choice':answer=[...state.selected].sort((a,b)=>a-b);break;
 case 'sorting':answer=[...state.sortOrder];break;
 case 'matching':answer=state.matches.map(m=>({...m}));break;
 case 'voice':answer=state.voiceRecording;break;
 case 'path':answer=state.strokes.filter(s=>s.points.length>=2).map(s=>({points:s.points.map(p=>({...p}))}));break;
 default:return null;
 }
 return {answer,timeSpentMilliseconds:capped(now-state.startedAt,3600000),mistakeCount:capped(state.mistakes,100)};
}
export function applyFeedback(state:EngineState,feedback:ServerFeedback):EngineState{
 return {...state,submitting:false,solved:feedback.isCorrect===true,mistakes:feedback.isCorrect?state.mistakes:state.mistakes+1};
}
export function isDone(challenge:StageChallenge,currentId:string):boolean{
 return challenge.challengeId===currentId||challenge.isCompleted===true||(challenge.hasProgress===true&&challenge.allowResume===false);
}
/** Mirrors legacy next-step fallback. Never infer a finished stage from a partial list. */
export function resolveNextStep(currentId:string,currentOrder:number,items:readonly StageChallenge[],feedbackNext?:string|null,summaryNext?:string|null):NextStep{
 const sorted=[...items].sort((a,b)=>(a.order??0)-(b.order??0));
 const following=(item:StageChallenge)=>!isDone(item,currentId)&&(item.order??0)>currentOrder;
 const feedbackCandidate=sorted.find(item=>item.challengeId===feedbackNext);
 if(feedbackNext&&feedbackNext!==currentId&&(!feedbackCandidate||following(feedbackCandidate)))return {kind:'challenge',challengeId:feedbackNext};
 const summaryCandidate=sorted.find(item=>item.challengeId===summaryNext);
 if(summaryCandidate&&following(summaryCandidate))return {kind:'challenge',challengeId:summaryCandidate.challengeId};
 const next=sorted.find(following);
 return next?{kind:'challenge',challengeId:next.challengeId}:{kind:'check-result'};
}
