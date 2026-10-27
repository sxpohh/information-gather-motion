const frame=document.getElementById('preview'),viewport=document.getElementById('viewport'),slider=document.getElementById('seek'),play=document.getElementById('play'),restart=document.getElementById('restart');
let tl,w,duration=0,t=0,running=false,last=0;
play.disabled=restart.disabled=true;
const fit=()=>frame.style.transform='scale('+viewport.clientWidth/1080+')';new ResizeObserver(fit).observe(viewport);fit();
const error=e=>document.getElementById('error').textContent=e.message;
// Fetch our LOCAL track once. This avoids Chrome aborting metadata-preload byte ranges
// mid-playback (PIPELINE_ERROR_READ); the composition/export still uses the original file.
async function prepareAudio(){
 for(const a of w.document.querySelectorAll('audio')){
  const source=a.getAttribute('src');if(!source)continue;
  a.dataset.previewOriginalSrc=source;
  const response=await fetch(new URL(source,frame.contentWindow.location.href));if(!response.ok)throw Error('音频加载失败：'+response.status);
  a.src=URL.createObjectURL(await response.blob());a.preload='auto';
  await new Promise((ok,bad)=>{a.addEventListener('canplay',ok,{once:true});a.addEventListener('error',()=>bad(Error(a.error?.message||'音频解码失败')),{once:true});a.load();});
 }
}
function seek(time,syncAudio=true){
 t=Math.max(0,Math.min(duration,time));tl?.pause().seek(t,false);slider.value=t;
 document.getElementById('time').textContent=t.toFixed(2)+' / '+duration.toFixed(2)+' 秒';
 if(syncAudio)for(const a of w?.document.querySelectorAll('audio')||[]){
  const at=t-Number(a.dataset.start||0);
  if(at<0||at>=a.duration){a.pause();continue;}
  if(Math.abs(a.currentTime-at)>.05)a.currentTime=at;
  if(running&&a.paused)a.play().catch(error);else if(!running)a.pause();
 }
}
function tick(now){
 if(running){
  const master=w?.document.querySelector('audio');
  const next=master&&master.readyState>=2&&!master.paused&&!master.seeking?master.currentTime:t+(now-last)/1000;
  seek(next,false);
  if(t>=duration){running=false;play.textContent='播放';seek(t);}
 }
 last=now;requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
play.onclick=()=>{if(!tl)return;if(t>=duration)seek(0);running=!running;play.textContent=running?'暂停':'播放';seek(t);};
restart.onclick=()=>{if(!tl)return;running=true;play.textContent='暂停';seek(0);};slider.oninput=()=>seek(Number(slider.value));
frame.addEventListener('load',()=>{
 w=frame.contentWindow;let attempts=0;
 const timer=setInterval(()=>{
  if(w.__timelines&&w.__IG){
   clearInterval(timer);tl=Object.values(w.__timelines)[0];duration=w.__IG.plan.duration;slider.max=duration;
   document.getElementById('title').textContent=w.__IG.config.brand.name+' · 信息归位';
   for(const[name,time]of Object.entries(tl.labels)){const b=document.createElement('button');b.textContent=name.replace('scene:','');b.onclick=()=>seek(time);document.getElementById('chapters').append(b);}
   prepareAudio().then(()=>{play.disabled=restart.disabled=false;seek(0);}).catch(error);
  }else if(++attempts>100){clearInterval(timer);error(Error('加载失败。请通过本地HTTP服务打开，并检查素材路径。'));}
 },100);
});
