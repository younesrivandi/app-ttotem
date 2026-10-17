/** Pure, cross-platform helpers for legacy Puzzle payloads and board coordinates. */
export type PuzzlePieceMedia = Readonly<{id:string;imageUrl:string}>;
export type PuzzleMedia = Readonly<{
 background?:string;
 /** Non-visual answer-region mask. Never display over the puzzle board. */
 mask?:string;
 pieces:readonly PuzzlePieceMedia[];
 invalidPieces:number;
}>;
type RecordValue=Record<string,unknown>;
const record=(value:unknown):RecordValue=>value!==null&&typeof value==='object'&&!Array.isArray(value)?value as RecordValue:{};
const pick=(value:RecordValue,keys:readonly string[]):unknown=>{
 for(const key of keys){const v=value[key];if(v!==undefined&&v!==null&&v!=='')return v;}
 return undefined;
};
const uriString=(v:unknown):string|undefined=>{
 if(typeof v==='string')return v.trim()||undefined;
 const r=record(v);
 const nested=pick(r,['imageUrl','url','uri','src','path']);
 return typeof nested==='string'?nested.trim()||undefined:undefined;
};
/** Do not guess CDN hosts: resolve API-relative URLs against configured backend. */
export function resolvePuzzleUri(input:unknown,apiBaseUrl:string):string|undefined{
 const raw=uriString(input);
 if(!raw)return undefined;
 if(/^(data:image\/|blob:|file:|content:)/i.test(raw))return raw;
 if(/^https?:\/\//i.test(raw))return raw;
 if(raw.startsWith('//'))return 'https:'+raw;
 if(/^[a-z][\w+.-]*:/i.test(raw))return undefined;
 const base=apiBaseUrl.trim().replace(/\/+$/,'');
 if(!/^https?:\/\//i.test(base))return undefined;
 return base+'/'+raw.replace(/^\/+/, '');
}
export function resolvePuzzleMedia(challenge:unknown,baseUrl:string):PuzzleMedia{
 const detail=record(challenge);
 const data=record(detail.data);
 // Visible artwork and answer-validation mask are distinct resources.
 // Prefer the display image; a colored mask is NEVER the displayed board.
 const background=resolvePuzzleUri(pick(data,['displayImageUrl','imageUrl','backgroundImageUrl','boardImageUrl','guideImageUrl','targetImageUrl','templateImageUrl','titleImageUrl'])
  ??pick(detail,['displayImageUrl','imageUrl','boardImageUrl','titleImageUrl'])
  ??pick(record(data.title),['imageUrl'])
  ??pick(record(data.prompt),['imageUrl'])
  ??pick(record(detail.title),['imageUrl'])
  ??pick(record(detail.prompt),['imageUrl']),baseUrl);
 const mask=resolvePuzzleUri(pick(data,['maskImageUrl'])
  ??pick(detail,['maskImageUrl']),baseUrl);
 const list=pick(data,['pieces','puzzlePieces']);
 const rawPieces=Array.isArray(list)?list:[];
 const seen=new Set<string>();
 const pieces:PuzzlePieceMedia[]=[];
 let invalidPieces=0;
 for(const item of rawPieces){
  const value=record(item);
  const idValue=pick(value,['id','pieceId']);
  const id=(typeof idValue==='string'||typeof idValue==='number')?String(idValue):'';
  const imageUrl=resolvePuzzleUri(pick(value,['imageUrl','image','url','src']),baseUrl);
  if(!id||!imageUrl||seen.has(id)){invalidPieces++;continue;}
  seen.add(id);
  pieces.push({id,imageUrl});
 }
 return {background,mask,pieces,invalidPieces};
}
export type BoardSize=Readonly<{width:number;height:number}>;
export type BoardRect=Readonly<{x:number;y:number;width:number;height:number}>;
export type BoardPoint=Readonly<{x:number;y:number}>;
const positive=(n:number)=>Number.isFinite(n)&&n>0;
/** Fit the full board, including narrow/tall images, within screen limits. */
export function fitPuzzleBoard(availableWidth:number,maxHeight:number,aspectRatio:number):BoardSize{
 if(!positive(availableWidth)||!positive(maxHeight))return {width:0,height:0};
 const ratio=positive(aspectRatio)?aspectRatio:1;
 const height=Math.min(availableWidth/ratio,maxHeight);
 return {width:height*ratio,height};
}
/** A missed drop must not be clamped to a valid edge coordinate. */
export function normalizePuzzleDrop(x:number,y:number,board:BoardRect):BoardPoint|null{
 if(![x,y,board.x,board.y,board.width,board.height].every(Number.isFinite)
  ||!positive(board.width)||!positive(board.height))return null;
 const localX=(x-board.x)/board.width;
 const localY=(y-board.y)/board.height;
 if(localX<0||localX>1||localY<0||localY>1)return null;
 return {x:localX,y:localY};
}
