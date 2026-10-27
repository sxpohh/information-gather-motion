import {planScenes} from './plan.mjs';
const c=window.INFORMATION_GATHER_CONFIG,V=window.OM?.vars?.()||{},plan=planScenes(c),root=document.documentElement;
if(c.audio)OM.music({off:true}); // A supplied master mix must never receive a second music bed.
for(const[k,v]of Object.entries({accent:V.accent??c.theme.accent,canvas:V.canvas??c.theme.background,ink:V.ink??c.theme.ink}))root.style.setProperty('--'+k,v);
document.title=c.brand.name+' · 信息归位';
const byId=id=>document.getElementById(id),text=(id,value)=>byId(id).textContent=value;
text('intro-title',V.introTitle??c.intro.title);text('outro-title',V.outroTitle??c.outro.title);
document.querySelector('[data-var-text="brandName"]').textContent=V.brandName??c.brand.name;
text('notice',c.notice);text('brand-mark',[...(V.brandName??c.brand.name)][0]);
if(c.brand.logo){byId('brand-logo').src=c.brand.logo;byId('brand-logo').style.display='block';byId('brand-mark').style.display='none';}
const createDevice=(id,screenId)=>{
 const screen=c.screens.find(s=>s.id===screenId),el=document.createElement('div');el.id=id;el.className='device';el.dataset.omId=id;
 el.setAttribute('data-layout-allow-overflow','');el.setAttribute('data-layout-allow-occlusion','');
 const frame=document.createElement('div');frame.className='screen';const img=new Image();img.src=screen.src;img.alt=screen.alt;frame.append(img);el.append(frame);byId('stage').append(el);return {el,img,frame,screen};
};
const back=createDevice('hero-back',c.hero[0]),front=createDevice('hero-front',c.hero[1]);
const devices=plan.features.map(f=>createDevice('device-'+f.id,f.screen));
const headings=plan.features.map(f=>{const el=document.createElement('h2');el.id='heading-'+f.id;el.className='feature-heading';el.dataset.omId=el.id;el.dataset.omVar='title-'+f.id;el.textContent=V['title-'+f.id]??f.title;byId('feature-headings').append(el);return el;});
await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode()));await document.fonts.ready;
const tl=gsap.timeline({paused:true,defaults:{ease:'power3.inOut'}});
const initial=(target,props)=>{gsap.set(target,props);tl.set(target,props,0);};
const poseBack={x:70,y:948,scale:1.2,rotation:-8,rotationY:9,rotationX:0,transformPerspective:1800};
const poseFront={x:492,y:760,scale:1.35,rotation:4,rotationY:-14,rotationX:3,transformPerspective:1800};
const awayBack={...poseBack,x:-240,y:1310,rotation:-18,scale:1.04};
const awayFront={...poseFront,x:1120,y:1170,rotation:14,scale:1.15};
initial(back.el,{...awayBack,autoAlpha:1,zIndex:2});initial(front.el,{...awayFront,autoAlpha:1,zIndex:3});
initial('#intro-title',{autoAlpha:1,y:25});initial('#outro-title',{autoAlpha:0,y:25});initial('#top-mask',{autoAlpha:0});
devices.forEach((d,i)=>initial(d.el,{x:1190,y:680,scale:1.6,rotation:12,rotationY:-12,rotationX:0,transformPerspective:1800,autoAlpha:0,zIndex:5+i}));
headings.forEach(h=>initial(h,{autoAlpha:0,y:25}));
tl.addLabel('scene:intro',0).to(back.el,{...poseBack,duration:1.3},0).to(front.el,{...poseFront,duration:1.38},.06).to('#intro-title',{y:0,duration:.6,ease:'power2.out'},0);
tl.to(back.el,{x:50,y:1035,scale:1.12,rotation:-13,rotationY:16,duration:Math.min(1.1,c.intro.duration-1.5)},1.5).to(front.el,{x:430,y:690,scale:1.43,rotation:3,rotationY:-10,duration:Math.min(1.1,c.intro.duration-1.5)},1.5);
tl.to('#intro-title',{autoAlpha:0,y:-30,duration:.35},plan.intro.end-.35);
const focusGeometry=(device,rect)=>{
 const img=device.img,fit=Math.min(363/img.naturalWidth,785/img.naturalHeight),iw=img.naturalWidth*fit,ih=img.naturalHeight*fit;
 const x=(363-iw)/2+iw*rect[0],y=(785-ih)/2+ih*rect[1],w=iw*rect[2],h=ih*rect[3];
 const scale=Math.min(900/w,940/h,6);
 return {local:{x,y,w,h},pose:{x:540-scale*(7+x+w/2),y:940-scale*(7+y+h/2),scale,rotation:0,rotationX:0,rotationY:0,transformPerspective:1800},sourcePixels:{width:img.naturalWidth*rect[2],height:img.naturalHeight*rect[3]}};
};
const focusTargets=[],captionCues=[];
if(c.intro.caption)captionCues.push({start:.1,end:plan.intro.end-.2,text:c.intro.caption});
const exit=(el,at)=>tl.to(el,{x:-550,y:1030,scale:1.1,rotation:-12,rotationY:14,rotationX:0,autoAlpha:0,duration:.95},at);
for(const[f,i]of plan.features.map((f,i)=>[f,i])){
 const d=devices[i],h=headings[i];tl.addLabel('scene:'+f.id,f.start);
 if(i===0){exit(back.el,f.start);exit(front.el,f.start+.08);tl.to('#top-mask',{autoAlpha:1,duration:.5},f.start);}else exit(devices[i-1].el,f.start);
 tl.set(d.el,{autoAlpha:1},f.start).to(d.el,{x:250,y:410,scale:1.52,rotation:0,rotationY:0,rotationX:0,duration:1},f.start).to(h,{autoAlpha:1,y:0,duration:.45},f.start+.35);
 for(const[s,j]of f.steps.map((s,j)=>[s,j])){
  const geometry=focusGeometry(d,s.rect),outline=document.createElement('div');outline.id=`focus-${f.id}-${j}`;outline.dataset.omId=outline.id;outline.className='focus-outline';outline.setAttribute('data-layout-allow-occlusion','');
  Object.assign(outline.style,{left:geometry.local.x+'px',top:geometry.local.y+'px',width:geometry.local.w+'px',height:geometry.local.h+'px'});d.frame.append(outline);initial(outline,{autoAlpha:0});
  tl.to(d.el,{...geometry.pose,duration:.85},s.start).to(outline,{autoAlpha:1,duration:.18},s.land).to(outline,{autoAlpha:0,duration:.16},s.end-.16);
  focusTargets.push({id:outline.id,time:(s.land+s.end)/2,feature:f.id,rect:s.rect,...geometry});
  if(s.caption)captionCues.push({start:s.land+.05,end:s.end-.15,text:s.caption});
  if(!c.audio)OM.sfx('pop',s.land,{gain:.18});
 }
 tl.to(h,{autoAlpha:0,y:-20,duration:.25},f.end-.25);
 if(!c.audio)OM.sfx('thud',f.start+.95,{gain:.2});
}
tl.addLabel('scene:outro',plan.outro.start);exit(devices.at(-1).el,plan.outro.start);
tl.set(back.el,{...awayBack,autoAlpha:1,zIndex:2},plan.outro.start).set(front.el,{...awayFront,autoAlpha:1,zIndex:3},plan.outro.start);
tl.to(back.el,{...poseBack,duration:1.2},plan.outro.start+.1).to(front.el,{...poseFront,duration:1.3},plan.outro.start+.16).to('#top-mask',{autoAlpha:0,duration:.45},plan.outro.start).to('#outro-title',{autoAlpha:1,y:0,duration:.55},plan.outro.start+.4);
if(c.outro.caption)captionCues.push({start:plan.outro.start+.6,end:plan.duration,text:c.outro.caption});
if(!c.audio)OM.sfx('thud',plan.outro.start+1.45,{gain:.22});
const cues=c.captions??captionCues;
if(V.captionsOn!==false)for(const[cue,i]of cues.map((cue,i)=>[cue,i])){
 const el=document.createElement('div');el.className='caption';el.id='caption-'+i;el.dataset.omId=el.id;el.textContent=cue.text;byId('captions').append(el);initial(el,{autoAlpha:0});
 // Time functions only: no callbacks or state changes, so reverse seeking is safe.
 tl.set(el,{autoAlpha:1},cue.start).set(el,{autoAlpha:0},cue.end);
}
tl.to({},{duration:.001},plan.duration-.001);
window.__IG={config:c,plan,focusTargets,captions:cues,captionsOn:V.captionsOn!==false,warnings:focusTargets.filter(f=>f.sourcePixels.width<500).map(f=>`原图重点宽度仅${Math.round(f.sourcePixels.width)}px：${f.id}，尽量补高分辨率原图，不重绘。`)};
window.__timelines??={};window.__timelines[c.id]=tl;
