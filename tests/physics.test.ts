import {test} from 'node:test';import assert from 'node:assert/strict';import {simulateCollapse} from '../src/lib/cup-physics';
test('cup pyramid actually collapses, and every scrub frame is finite',()=>{
  const positions=[];for(let layer=0;layer<2;layer++)for(let row=0;row<6;row++)for(let col=0;col<6-row;col++)positions.push({x:(col-(5-row)/2)*.66,y:row*1.105+.56,z:(layer-.5)*.72});
  const frames=simulateCollapse(positions);assert.equal(frames.length,211);assert.ok(frames.at(-1)![20].position[1]<2,'the top cup must fall from its six-unit height');
  for(const frame of frames)for(const pose of frame)assert.ok([...pose.position,...pose.quaternion].every(Number.isFinite));
});
