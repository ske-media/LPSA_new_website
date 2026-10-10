import sharp from 'sharp';
import {mkdir,stat,rename} from 'node:fs/promises';
for(const size of ['desktop','mobile'])await mkdir(`public/cinematic-hq/${size}`,{recursive:true});
for(let frame=0;frame<96;frame++){
 const name=String(frame).padStart(3,'0');const source=`.local/cinematic-renders-hq/${name}.png`;
 for(;;){try{await stat(source);await sharp(source).raw().toBuffer();break;}catch{await new Promise(resolve=>setTimeout(resolve,1000));}}
 for(const [size,width] of [['desktop',2560],['mobile',1440]]){
  const target=`public/cinematic-hq/${size}/${name}.webp`;
  await sharp(source).resize({width}).webp({quality:94,effort:6,smartSubsample:true}).toFile(target+'.tmp');await rename(target+'.tmp',target);
 }
 console.log(`HQ frame ${name} encoded`);
}
