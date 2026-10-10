import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
for(const size of ['desktop','mobile']) await mkdir(`public/cinematic-hq/${size}`,{recursive:true});
for(let i=0;i<96;i++) {const name=String(i).padStart(3,'0'); for(const [size,width] of [['desktop',2560],['mobile',1440]]) await sharp(`.local/cinematic-renders-hq/${name}.png`).resize({width}).webp({quality:94,effort:6,smartSubsample:true}).toFile(`public/cinematic-hq/${size}/${name}.webp`);}
