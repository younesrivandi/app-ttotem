/** Platform-independent shapes matching the existing Next.js attempt payload. */
export type Point = Readonly<{x:number;y:number}>;
export type Stroke = Readonly<{points:readonly Point[]}>;
export type Match = Readonly<{sourceIndex:number;targetIndex:number}>;
export type GameKind = 'choice'|'sorting'|'matching'|'path'|'voice'|'content'|'video'|'unsupported';
export type ChallengeSpec = Readonly<{
  kind:string;
  data?:Readonly<{allowMultiple?:boolean;options?:readonly unknown[];items?:readonly unknown[];
    collections?:readonly (readonly unknown[])[];videoUrl?:string;audioUrl?:string;requireMediaCompletion?:boolean}>;
}>;
export type EngineState = Readonly<{
  selected:readonly number[];sortOrder:readonly number[];matches:readonly Match[];
  strokes:readonly Stroke[];voiceRecording:string;recording:boolean;
  completedMedia:readonly ('video'|'audio')[];mistakes:number;startedAt:number;
  submitting:boolean;solved:boolean;
}>;
export type AttemptPayload = Readonly<{answer:unknown;timeSpentMilliseconds:number;mistakeCount:number}>;
export type ServerFeedback = Readonly<{isCorrect:boolean;nextChallengeId?:string|null}>;
export type StageChallenge = Readonly<{challengeId:string;order?:number|null;isCompleted?:boolean|null;hasProgress?:boolean|null;allowResume?:boolean|null}>;
export type NextStep = {kind:'challenge';challengeId:string}|{kind:'check-result'};
