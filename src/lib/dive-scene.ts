// "La plongée": the brand ribbon in brushed metal, under water. Scroll drives the dive.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import paths from './logo-paths.json';

const BG_VERT=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
// Water column: light from the surface, god rays, caustic shimmer; darker as we dive.
const BG_FRAG=`precision highp float;varying vec2 vUv;uniform float uTime,uDepth,uAspect;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=vUv;float d=clamp(uDepth,0.,1.);
  vec3 surface=mix(vec3(.10,.42,.52),vec3(.03,.16,.22),d);
  vec3 abyss=mix(vec3(.012,.05,.075),vec3(.006,.022,.034),d);
  float h=smoothstep(.0,1.15,uv.y+.12*(1.-d));
  vec3 col=mix(abyss,surface,h*h);
  // light source drifts up-right like the board
  vec2 src=vec2(.72+.04*sin(uTime*.1),1.25);
  vec2 dir=uv-src;dir.x*=uAspect;
  float ang=atan(dir.x,-dir.y);
  float rays=0.;
  rays+=pow(max(0.,sin(ang*17.+uTime*.35)),9.)*.55;
  rays+=pow(max(0.,sin(ang*29.-uTime*.27+1.7)),14.)*.45;
  rays+=noise(vec2(ang*24.,uTime*.15))*.25;
  float fall=smoothstep(1.25,.05,length(dir))*(1.-d*.85);
  col+=vec3(.55,.85,.92)*rays*fall*.32;
  // caustics near the surface
  vec2 cp=uv*vec2(uAspect,1.)*6.+vec2(uTime*.05,uTime*.08);
  float c=pow(abs(sin(cp.x+noise(cp*1.3)*3.)*sin(cp.y+noise(cp*1.7+3.)*3.)),6.);
  col+=vec3(.6,.9,1.)*c*smoothstep(.55,1.,uv.y)*(1.-d)*.18;
  // vignette + grain
  vec2 q=uv-.5;col*=1.-dot(q,q)*1.1;
  col+=(hash(uv*vec2(1920.,1080.)+uTime)-.5)*.018;
  gl_FragColor=vec4(col,1.);
}`;
const P_VERT=`attribute float aSize;attribute float aSpeed;uniform float uTime,uH,uPx;varying float vA;
void main(){vec3 p=position;p.y=mod(p.y+uTime*aSpeed+uH*.5,uH)-uH*.5;p.x+=sin(uTime*.3+p.y)*.08;
vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uPx*(9./-mv.z);vA=smoothstep(28.,4.,-mv.z);}`;
const P_FRAG=`precision mediump float;varying float vA;void main(){vec2 c=gl_PointCoord-.5;float r=length(c);float a=smoothstep(.5,.0,r);float ring=smoothstep(.5,.38,r)-smoothstep(.36,.2,r);gl_FragColor=vec4(vec3(.75,.93,1.),(a*.35+ring*.5)*vA*.75);}`;

// Smooth ribbon surface: each logo path is 6 cubic curves, 3 along one edge (tip to tip) and 3 back along the other.
function cubic(p0:number[],p1:number[],p2:number[],p3:number[],t:number){const u=1-t;return [0,1].map(k=>u*u*u*p0[k]+3*u*u*t*p1[k]+3*u*t*t*p2[k]+t*t*t*p3[k]);}
function edges(d:string){
  const n=(d.match(/-?\d+(\.\d+)?/g)||[]).map(Number),start=[n[0],n[1]],segs:number[][][]=[];let cur=start;
  for(let i=2;i+5<n.length;i+=6){const c=[cur,[n[i],n[i+1]],[n[i+2],n[i+3]],[n[i+4],n[i+5]]];segs.push(c);cur=c[3];}
  const sample=(list:number[][][],per:number)=>{const out:number[][]=[];list.forEach((c,j)=>{for(let k=0;k<per;k++)out.push(cubic(c[0],c[1],c[2],c[3],k/per));if(j===list.length-1)out.push(c[3]);});return out;};
  const per=60;return [sample(segs.slice(0,3),per),sample(segs.slice(3,6),per).reverse()];
}
function ribbon(d:string,color:number,twist:number){
  const [e1,e2]=edges(d),cols=e1.length,rows=14,pos:number[]=[],idx:number[]=[];
  for(let i=0;i<cols;i++)for(let j=0;j<=rows;j++){
    const t=j/rows,x=e1[i][0]+(e2[i][0]-e1[i][0])*t,y=e1[i][1]+(e2[i][1]-e1[i][1])*t;
    const X=(x-517)/170,Y=-(y-240)/170,u=i/(cols-1);
    // fold the flat strip: a wave along its length plus a gentle twist across it
    const Z=Math.sin(X*1.15+.6)*.42+Math.cos(Y*1.7)*.12+(t-.5)*Math.sin(u*Math.PI)*twist;
    pos.push(X,Y,Z);
  }
  for(let i=0;i<cols-1;i++)for(let j=0;j<rows;j++){const a=i*(rows+1)+j,b=a+rows+1;idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.MeshPhysicalMaterial({color,metalness:1,roughness:.2,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.4,side:THREE.DoubleSide,iridescence:.15,iridescenceIOR:1.3});
  return new THREE.Mesh(g,m);
}

export function mountDive(root:HTMLElement){
  const canvas=root.querySelector<HTMLCanvasElement>('.dive-canvas');if(!canvas)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}catch{root.dataset.scene='static';return;}
  const mobile=matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,9);
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;

  // background quad rendered first
  const bgUniforms={uTime:{value:0},uDepth:{value:0},uAspect:{value:1}};
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({vertexShader:BG_VERT,fragmentShader:BG_FRAG,uniforms:bgUniforms,depthWrite:false,depthTest:false}));
  bg.frustumCulled=false;bg.renderOrder=-1;scene.add(bg);

  const logo=new THREE.Group();
  const a=ribbon(paths.ribbonA,0xe8f2f6,.55),b=ribbon(paths.ribbonB,0xc8dee7,-.45);b.position.z=.3;
  logo.add(a,b);scene.add(logo);

  scene.add(new THREE.HemisphereLight(0x9fe6f0,0x02121b,.9));
  const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(3,6,5);scene.add(key);
  const rim=new THREE.PointLight(0x72c6d4,40,30);rim.position.set(-4,-2,-3);scene.add(rim);
  const glow=new THREE.PointLight(0xa6e8f1,25,20);glow.position.set(2,3,3);scene.add(glow);

  // marine snow & bubbles
  const n=mobile?380:900,H=26,pos=new Float32Array(n*3),size=new Float32Array(n),speed=new Float32Array(n);
  for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*22;pos[i*3+1]=(Math.random()-.5)*H;pos[i*3+2]=(Math.random()-.5)*16-2;size[i]=Math.random()<.1?3+Math.random()*4:.6+Math.random()*1.6;speed[i]=.05+Math.random()*.25;}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('aSize',new THREE.BufferAttribute(size,1));pg.setAttribute('aSpeed',new THREE.BufferAttribute(speed,1));
  const pu={uTime:{value:0},uH:{value:H},uPx:{value:renderer.getPixelRatio()*(mobile?1.4:1)}};
  const points=new THREE.Points(pg,new THREE.ShaderMaterial({vertexShader:P_VERT,fragmentShader:P_FRAG,uniforms:pu,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  scene.add(points);

  let w=0,h=0,progress=0,eased=0,visible=true,raf=0,mx=0,my=0,tmx=0,tmy=0,running=false;const t0=performance.now();
  function resize(){w=canvas!.clientWidth;h=canvas!.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();bgUniforms.uAspect.value=w/h;}
  function measure(){const r=root.getBoundingClientRect();progress=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight)));root.style.setProperty('--p',progress.toFixed(4));root.dataset.progress=progress.toFixed(3);}
  const smooth=(e0:number,e1:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-e0)/(e1-e0)));return t*t*(3-2*t);};
  function frame(){
    raf=0;if(!visible||document.hidden){running=false;return;}
    const t=(performance.now()-t0)/1000;eased+=(progress-eased)*.08;mx+=(tmx-mx)*.05;my+=(tmy-my)*.05;
    const wide=w/h>1.1,p=eased;
    // act 1: hero (logo on the right) → act 2: the logo turns and comes to us → we pass through it
    const side=wide?2.15:0,lift=wide?.1:2.02;
    logo.position.x=side*(1-smooth(.05,.45,p));
    logo.position.y=lift*(1-smooth(.05,.45,p))+Math.sin(t*.8)*.06-smooth(.55,1,p)*.6;
    logo.position.z=smooth(.35,.97,p)*11;
    const s=(wide?.9:.46)*(1+smooth(.1,.5,p)*(wide?.2:.5));logo.scale.setScalar(s);
    logo.rotation.y=Math.sin(t*.35)*.22-.35+p*2.4+mx*.25;
    logo.rotation.x=-.12+Math.sin(t*.27)*.06+p*.55-my*.15;
    logo.rotation.z=Math.sin(t*.2)*.03-p*.25;
    camera.position.y=-p*3.2+my*.25;camera.position.x=mx*.35;camera.lookAt(0,-p*3.6,0);
    points.position.y=p*5;
    bgUniforms.uTime.value=t;bgUniforms.uDepth.value=p;pu.uTime.value=t;
    rim.intensity=40+Math.sin(t*1.3)*8;
    renderer.render(scene,camera);
    if(root.dataset.scene!=='ready')root.dataset.scene='ready';
    raf=requestAnimationFrame(frame);
  }
  const start=()=>{if(!running&&visible&&!document.hidden){running=true;raf=requestAnimationFrame(frame);}};
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)start();},{rootMargin:'100px'});io.observe(root);
  addEventListener('scroll',measure,{passive:true});
  addEventListener('resize',()=>{resize();measure();});
  document.addEventListener('visibilitychange',start);
  if(matchMedia('(pointer: fine)').matches)addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5;},{passive:true});
  resize();measure();eased=progress;start();
  return ()=>{cancelAnimationFrame(raf);io.disconnect();renderer.dispose();};
}
