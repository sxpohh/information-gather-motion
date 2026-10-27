// Shared by the generator and browser: timing has a single source of truth.
export function planScenes(c) {
 const round=n=>Math.round(n*1000)/1000;
 let cursor=c.intro.duration;
 const features=c.features.map(f=>{
  const start=cursor,steps=[];cursor+=1.1;
  for(const s of f.steps){const at=cursor;cursor+=.85+s.hold;steps.push({...s,start:round(at),land:round(at+.85),end:round(cursor)});}
  const end=cursor;return {...f,start:round(start),end:round(end),steps};
 });
 // Pad only the final hold (less than one frame); narration/scene starts stay put.
 const outro={...c.outro,start:round(cursor),end:Math.ceil((round(cursor+c.outro.duration)-1e-9)*30)/30};
 return {intro:{...c.intro,start:0,end:c.intro.duration},features,outro,duration:outro.end};
}
