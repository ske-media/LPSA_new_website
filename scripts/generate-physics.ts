import {mkdir,writeFile} from 'node:fs/promises';
import {simulateCollapse} from '../src/lib/cup-physics';
const positions=[];
for(let layer=0;layer<2;layer++)for(let row=0;row<6;row++)for(let col=0;col<6-row;col++)positions.push({x:(col-(5-row)/2)*.66,y:row*1.105+.56,z:(layer-.5)*.72});
const frames=simulateCollapse(positions);
await mkdir('public/animations',{recursive:true});
await writeFile('public/animations/cup-collapse-v1.json',JSON.stringify(frames,(_key,value)=>typeof value==='number'?Math.round(value*100000)/100000:value));
console.log(`Generated ${frames.length} rigid-body frames. No physics simulation is required in the browser.`);
