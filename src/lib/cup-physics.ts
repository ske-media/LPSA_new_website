import {Body,ContactMaterial,Cylinder,Material,Plane,Vec3,World} from 'cannon-es';
export type PhysicsPose={position:[number,number,number];quaternion:[number,number,number,number]};
/** Precomputed, repeatable rigid-body timeline. Scrubbing never reruns physics. */
export function simulateCollapse(positions:readonly {x:number;y:number;z:number}[],height=1.12):PhysicsPose[][]{
  const world=new World({gravity:new Vec3(0,-9.82,0)});
  const plastic=new Material('plastic'),ground=new Material('ground');
  world.addContactMaterial(new ContactMaterial(plastic,plastic,{friction:.24,restitution:.18}));
  world.addContactMaterial(new ContactMaterial(plastic,ground,{friction:.38,restitution:.12}));
  const floor=new Body({mass:0,material:ground,shape:new Plane()});floor.quaternion.setFromEuler(-Math.PI/2,0,0);floor.position.y=-.045;world.addBody(floor);
  // Keep the collapse inside the stage, as if on a large drying table.
  for(const side of [-1,1]){const wall=new Body({mass:0,material:ground,shape:new Plane()});wall.position.x=side*3.5;wall.quaternion.setFromEuler(0,-side*Math.PI/2,0);world.addBody(wall);}
  const shape=new Cylinder(.25,.325,height,12);
  const bodies=positions.map((position,index)=>{
    const body=new Body({mass:.035,material:plastic,shape,position:new Vec3(position.x,position.y,position.z),linearDamping:.08,angularDamping:.16});
    body.quaternion.setFromEuler(0,0,Math.sin(index*4.7)*.055);
    world.addBody(body);
    if(position.y<height){body.type=Body.KINEMATIC;body.velocity.set(Math.sin(index+1)*2.8,0,2.6);body.angularVelocity.set(1.8*Math.sin(index),.5,1.5);}
    else {body.angularVelocity.set(.18*Math.sin(index),0,.15);}
    return body;
  });
  const snapshot=()=>bodies.map(body=>({position:[body.position.x,body.position.y,body.position.z] as [number,number,number],quaternion:[body.quaternion.x,body.quaternion.y,body.quaternion.z,body.quaternion.w] as [number,number,number,number]}));
  const frames=[snapshot()];for(let step=0;step<210;step++){
    if(step===32)for(const body of bodies){if(body.type===Body.KINEMATIC){body.type=Body.DYNAMIC;body.updateMassProperties();}}
    world.step(1/60);frames.push(snapshot());
  }
  return frames;
}
