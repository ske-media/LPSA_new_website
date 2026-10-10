export function mountCinematic(root: HTMLElement) {
 const canvas=root.querySelector<HTMLCanvasElement>('#cinematic-canvas')!;
 const ctx=canvas.getContext('2d');
 if(!ctx || matchMedia('(prefers-reduced-motion: reduce)').matches){root.dataset.scene='reduced';return;}
 const mobile=matchMedia('(max-width:700px)').matches;
 const cacheLimit=mobile?10:8;
 const cache=new Map<number,ImageBitmap>(); const pending=new Set<number>();
 let wanted=0,raf=0,disposed=false;
 const draw=(frame:number)=>{const bitmap=cache.get(frame);if(!bitmap||!ctx)return;canvas.width=bitmap.width;canvas.height=bitmap.height;ctx.drawImage(bitmap,0,0);canvas.style.opacity='1';root.dataset.scene='ready';root.dataset.frame=String(frame);};
 async function fetchFrame(frame:number){
  if(frame<0||frame>95||cache.has(frame)||pending.has(frame)||pending.size>=3||disposed)return;
  pending.add(frame);
  try{const response=await fetch(`/cinematic-hq/${mobile?'mobile':'desktop'}/${String(frame).padStart(3,'0')}.webp`);if(!response.ok)throw Error('frame');const bitmap=await createImageBitmap(await response.blob());if(disposed){bitmap.close();return;}cache.set(frame,bitmap);if(frame===wanted)draw(frame);
   if(cache.size>cacheLimit){const keys=[...cache.keys()].sort((a,b)=>Math.abs(b-wanted)-Math.abs(a-wanted));for(const key of keys.slice(0,cache.size-cacheLimit)){cache.get(key)?.close();cache.delete(key);}}
  }catch{if(frame===0)root.dataset.scene='fallback';}finally{pending.delete(frame);if(!disposed&&wanted!==frame&&!cache.has(wanted))void fetchFrame(wanted);}
 }
 function update(){raf=0;const bounds=root.getBoundingClientRect();const progress=Math.max(0,Math.min(1,-bounds.top/Math.max(1,bounds.height-innerHeight)));root.dataset.progress=String(progress);wanted=Math.round(progress*95);draw(wanted);void fetchFrame(wanted);for(const offset of [-1,1,-2,2])void fetchFrame(wanted+offset);
 const labels=['LA PYRAMIDE DU LENDEMAIN','LE PASSAGE DE RELAIS','LE RELAIS EST PRIS'];const chapter=Math.min(2,Math.floor(progress*3));const label=root.querySelector('#scene-label');if(label)label.textContent=labels[chapter];const counter=root.querySelector('#scene-counter');if(counter)counter.textContent=`0${chapter+1} / 03`;const bar=root.querySelector<HTMLElement>('.scene-progress span');if(bar)bar.style.width=`${progress*100}%`;
 }
 const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);update();
 document.addEventListener('astro:before-swap',()=>{disposed=true;window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);cancelAnimationFrame(raf);cache.forEach(bitmap=>bitmap.close());},{once:true});
}
