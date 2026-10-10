import * as THREE from 'three';
import type {PhysicsPose} from './cup-physics';
import {cupArtwork} from './cup-artwork';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

/** The document's native scroll is the only timeline; nothing scroll-jacks. */
export async function mountCupScene(root:HTMLElement){
  const response=await fetch('/animations/cup-collapse-v1.json');
  if(!response.ok)throw new Error('Animation timeline unavailable');
  const collapse:PhysicsPose[][]=await response.json();
  if(collapse.length!==211||collapse[0].length!==42)throw new Error('Invalid animation timeline');
  const host=root.querySelector<HTMLElement>('#cup-canvas')!;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{root.dataset.scene='fallback';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);const environment=new RoomEnvironment();const environmentMap=pmrem.fromScene(environment,.04);scene.environment=environmentMap.texture;environment.dispose();pmrem.dispose();
  const camera=new THREE.PerspectiveCamera(36,1,.1,60);
  camera.position.set(7,5.8,13);camera.lookAt(0,2.7,0);
  scene.add(new THREE.HemisphereLight(0xc1e2e8,0x123648,1.6));
  const key=new THREE.DirectionalLight(0xe1efff,4);key.position.set(-3,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.025;scene.add(key);
  const rimLight=new THREE.DirectionalLight(0x76c7e2,3);rimLight.position.set(6,3,-3);scene.add(rimLight);

  const assembly=new THREE.Group();scene.add(assembly);
  assembly.scale.setScalar(.85);
  // A thin, hollow moulded wall with a real base and rolled drinking lip.
  const profile=[[0,-.56],[.242,-.56],[.251,-.545],[.313,.513],[.327,.536],[.327,.56],[.314,.56],[.303,.518],[.236,-.519],[0,-.519]].map(([x,y])=>new THREE.Vector2(x,y));
  const wall=new THREE.LatheGeometry(profile,48);wall.rotateX(Math.PI);
  const printWall=new THREE.CylinderGeometry(.329,.266,1.04,48,1,true);printWall.rotateX(Math.PI);
  const rim=new THREE.TorusGeometry(.321,.009,8,48);
  const textures=Array.from({length:4},(_,i)=>cupArtwork(i));
  const materials=textures.map(map=>new THREE.MeshPhysicalMaterial({map,color:0xffffff,roughness:.42,metalness:0,clearcoat:.2,clearcoatRoughness:.35,side:THREE.FrontSide,envMapIntensity:.6,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  const plasticMaterial=new THREE.MeshPhysicalMaterial({color:0xe6e9e9,roughness:.27,metalness:0,clearcoat:.28,clearcoatRoughness:.3,side:THREE.DoubleSide,envMapIntensity:.8});
  const rimMaterial=new THREE.MeshStandardMaterial({color:0xf3f2e9,roughness:.35});
  const dropletsGeometry=new THREE.SphereGeometry(.024,6,6);
  const wetMaterial=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.1,transparent:true,opacity:.72});
  type Item={group:THREE.Group;start:THREE.Vector3;end:THREE.Vector3;wet:THREE.Group;index:number;tilt:number};
  const items:Item[]=[];
  let index=0;
  // Two closely spaced planes make the drying pile visibly three-dimensional.
  for(let layer=0;layer<2;layer++)for(let row=0;row<6;row++)for(let col=0;col<6-row;col++){
    const group=new THREE.Group(),material=materials[(index+row)%materials.length];
    const cupWall=new THREE.Mesh(wall,plasticMaterial);cupWall.castShadow=true;cupWall.receiveShadow=true;group.add(cupWall);
    const print=new THREE.Mesh(printWall,material);print.rotation.y=index*.89;print.castShadow=true;group.add(print);
    const lip=new THREE.Mesh(rim,rimMaterial);lip.rotation.x=Math.PI/2;lip.position.y=-.549;group.add(lip);
    const wet=new THREE.Group();for(let d=0;d<3;d++){const drop=new THREE.Mesh(dropletsGeometry,wetMaterial);const angle=.4+d*1.6;drop.position.set(Math.sin(angle)*.288,.16-d*.13,Math.cos(angle)*.288);drop.scale.y=1.5;wet.add(drop);}group.add(wet);
    const start=new THREE.Vector3((col-(5-row)/2)*.66,row*1.105+.56,(layer-.5)*.72);
    // Destination: three compact, clearly organized trays of upright cups.
    const tray=Math.floor(index/14),inside=index%14;
    const end=new THREE.Vector3((inside%7-3)*.66,(tray*1.28)+.62,(Math.floor(inside/7)-.5)*.72);
    const tilt=(Math.sin(index*4.7))*.055;
    group.position.copy(start);group.rotation.z=tilt;assembly.add(group);items.push({group,start,end,wet,index,tilt});index++;
  }
  const trayMaterial=new THREE.MeshStandardMaterial({color:0x294fc8,roughness:.5});
  const trays=new THREE.Group();assembly.add(trays);
  for(let row=0;row<3;row++){
    const tray=new THREE.Group();tray.position.y=row*1.28;
    const floor=new THREE.Mesh(new THREE.BoxGeometry(4.8,.09,1.55),trayMaterial);tray.add(floor);
    for(const z of [-.79,.79]){const edge=new THREE.Mesh(new THREE.BoxGeometry(4.9,.21,.06),trayMaterial);edge.position.set(0,.09,z);tray.add(edge);}
    for(const x of [-2.45,2.45]){const edge=new THREE.Mesh(new THREE.BoxGeometry(.06,.21,1.55),trayMaterial);edge.position.set(x,.09,0);tray.add(edge);}
    trays.add(tray);
  }
  trays.visible=false;
  const quaternionA=new THREE.Quaternion(),quaternionB=new THREE.Quaternion(),endQuaternion=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI,0,0));
  const floorMaterial=new THREE.ShadowMaterial({opacity:.28});const floorGeometry=new THREE.PlaneGeometry(18,18);const floor=new THREE.Mesh(floorGeometry,floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-.055;floor.receiveShadow=true;scene.add(floor);
  // Soft contact shadow without an expensive shadow map.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(64,64,2,64,64,62);gradient.addColorStop(0,'rgba(22,37,106,.3)');gradient.addColorStop(1,'rgba(22,37,106,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});const shadow=new THREE.Mesh(new THREE.PlaneGeometry(7,4),shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=-.06;scene.add(shadow);
  const label=root.querySelector<HTMLElement>('#scene-label')!,counter=root.querySelector<HTMLElement>('#scene-counter')!;
  let target=0,current=-1,frame=0,visible=true,disposed=false;
  const clamp=(n:number)=>Math.max(0,Math.min(1,n));const ease=(n:number)=>n*n*(3-2*n);
  function pose(progress:number){
    const fall=clamp((progress-.14)/.46);
    const transition=ease(clamp((progress-.7)/.27));
    assembly.rotation.y=-.16+Math.sin(progress*Math.PI)*.4;
    const framePosition=fall*(collapse.length-1),frameIndex=Math.min(Math.floor(framePosition),collapse.length-2),mix=framePosition-frameIndex;
    for(const item of items){
      const a=collapse[frameIndex][item.index],b=collapse[frameIndex+1][item.index];
      const t=ease(clamp((transition-item.index*.001)/.958));
      item.group.position.set(THREE.MathUtils.lerp(a.position[0],b.position[0],mix),THREE.MathUtils.lerp(a.position[1],b.position[1],mix),THREE.MathUtils.lerp(a.position[2],b.position[2],mix));
      item.group.position.lerp(item.end,t);
      item.group.position.y+=Math.sin(t*Math.PI)*(.85+(item.index%4)*.09);
      quaternionA.fromArray(a.quaternion);quaternionB.fromArray(b.quaternion);item.group.quaternion.slerpQuaternions(quaternionA,quaternionB,mix);item.group.quaternion.slerp(endQuaternion,t);
      item.wet.visible=transition<.5;
    }
    trays.visible=transition>.8;trays.scale.setScalar(.95+.05*transition);
    const dip=Math.sin(fall*Math.PI);
    const mobile=innerWidth<700;
    assembly.position.x=mobile?0:2.4;
    shadow.position.x=assembly.position.x;
    camera.position.set(7-progress*1.6,5.8+dip*1.8-progress*1.1,13+dip*1.2);
    camera.lookAt(mobile?0:0.8,2.7-fall*1.6+transition*.8,0);
    root.style.setProperty('--story-progress',String(progress));
    root.dataset.progress=progress.toFixed(3);
    const phase=progress<.14?0:progress<.7?1:2;
    label.textContent=['L’ÉQUILIBRE PRÉCAIRE','QUAND TOUT S’EFFONDRE','LE RELAIS EST PRIS'][phase];counter.textContent=`0${phase+1} / 03`;
    renderer.render(scene,camera);
  }
  function render(){frame=0;if(disposed||!visible)return;current=current<0?target:current+(target-current)*.16;if(Math.abs(current-target)<.001)current=target;pose(current);if(current!==target)frame=requestAnimationFrame(render);}
  function schedule(){if(!frame&&visible&&!disposed)frame=requestAnimationFrame(render);}
  function update(){const rect=root.getBoundingClientRect();target=clamp(-rect.top/Math.max(1,root.offsetHeight-innerHeight));schedule();}
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();update();}
  const observer=new ResizeObserver(resize);observer.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)update();},{rootMargin:'100px'});intersection.observe(root);
  const onVisibility=()=>{visible=!document.hidden && root.getBoundingClientRect().bottom>0 && root.getBoundingClientRect().top<innerHeight;if(visible)update();};
  window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',onVisibility);
  renderer.domElement.addEventListener('webglcontextlost',()=>{root.dataset.scene='fallback';disposed=true;cancelAnimationFrame(frame);});
  function cleanup(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();window.removeEventListener('scroll',update);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVisibility);[wall,printWall,rim,dropletsGeometry,floorGeometry].forEach(g=>g.dispose());[...materials,plasticMaterial,rimMaterial,wetMaterial,trayMaterial,shadowMaterial,floorMaterial].forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environmentMap.dispose();shadowTexture.dispose();renderer.dispose();}
  window.addEventListener('pagehide',cleanup,{once:true});
  resize();root.dataset.scene='ready';
}
