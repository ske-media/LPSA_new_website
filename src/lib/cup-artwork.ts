import * as THREE from 'three';
/** Original cylindrical print layouts; supplied photographs guide shape/material only. */
export function cupArtwork(variant:number){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1024;const ctx=canvas.getContext('2d')!;
  const schemes=[['#e6ecf3','#143c82','#7cb5fb'],['#264fa9','#e7f0ff','#91c6ff'],['#d7e6f6','#0b244b','#598ddb'],['#ecece5','#172f64','#70a5ee']];
  const [background,ink,accent]=schemes[variant%schemes.length];ctx.fillStyle=background;ctx.fillRect(0,0,1024,1024);
  ctx.fillStyle=accent;
  if(variant%2===0){for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-40,700+i*45);for(let x=0;x<=1100;x+=8)ctx.lineTo(x,700+i*45+Math.sin(x/130+i*.6)*60);ctx.lineTo(1100,1050);ctx.lineTo(-40,1050);ctx.fill();}}
  else{ctx.save();ctx.translate(510,795);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.fillRect(-16,75,32,140);}ctx.restore();}
  // Repeat the print on opposite sides of the cylindrical UV layout.
  for(const x of [30,542]){
    ctx.fillStyle=ink;ctx.textBaseline='top';ctx.font='900 90px sans-serif';ctx.fillText('ENCORE.',x,170);ctx.fillText('ET ENCORE.',x,270,470);
    ctx.font='700 58px sans-serif';ctx.fillText('LA PLONGE',x,415);ctx.fillText('S’ADAPTE.',x,483);
    ctx.font='500 20px sans-serif';ctx.fillText('LES ÉVÉNEMENTS PASSENT.',x,610);ctx.fillText('LES GOBELETS RESTENT.',x,638);
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.wrapS=THREE.RepeatWrapping;return texture;
}
