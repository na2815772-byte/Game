const $=id=>document.getElementById(id),clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x7fb8e0);scene.fog=new THREE.Fog(0x7fb8e0,50,190);
const camera=new THREE.PerspectiveCamera(64,innerWidth/innerHeight,.1,900);
const renderer=new THREE.WebGLRenderer({canvas:$('game'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
const hemi=new THREE.HemisphereLight(0xdff6ff,0x28354a,1.9);scene.add(hemi);
const sunL=new THREE.DirectionalLight(0xfff1d4,2);sunL.position.set(-8,16,8);scene.add(sunL);
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75},o));
const bm=(c,fog=true)=>new THREE.MeshBasicMaterial({color:c,fog});
function box(w,h,l,m,x,y,z,list){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),m);b.position.set(x,y,z);scene.add(b);if(list)list.push(b);return b}
function mbox(w,h,l,m,x,y,z){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,l),m);b.position.set(x,y,z);return b}

let TD=0,AMP=1,FQ=1,EL=.6;
function curveC(u){const t=clamp((u-600)/700,0,1),a=t*t*(3-2*t);return a*AMP*(12*Math.sin(u*FQ/110)+4*Math.sin(u*FQ/43+1))}
function curveS(u){return (curveC(u+1)-curveC(u-1))/2}
function elevC(u){const t=clamp((u-250)/500,0,1),a=t*t*(3-2*t);return a*EL*(9*Math.sin(u*FQ/95)+4*Math.sin(u*FQ/37+2))}
function elevS(u){return (elevC(u+1)-elevC(u-1))/2}
function rel(z){return curveC(TD-z)-curveC(TD-4)}
function ey(z){return elevC(TD-z)-elevC(TD-4)}
function ang(z){return -Math.atan(curveS(TD-z))}

const mGround=mat(0x6b7178);
const scroll=[],scen=[];
const mAsph=mat(0x2b3038),mShoulder=mat(0xc9bf9c),mBar=mat(0xb8b8b0),mAmber=mat(0xe8a020),mWhite=mat(0xdddddd),bWhite=bm(0xf2f2ea),bYel=bm(0xffc800),bDash=bm(0xf4f4e9);
function roadSeg(z,idx){
const g=new THREE.Group();g.rotation.order='YXZ';
g.add(mbox(420,.1,10.6,mGround,0,-.25,0));
g.add(mbox(19,.08,10.4,mShoulder,0,-.14,0));
g.add(mbox(13,.1,10.4,mAsph,0,-.12,0));
for(const s of [-1,1]){
g.add(mbox(.14,.03,10.4,bWhite,s*6.4,-.05,0));
g.add(mbox(.1,.03,10.4,bYel,s*5.9,-.05,0));
g.add(mbox(.7,.75,10.4,mBar,s*7.4,.3,0));
g.add(mbox(.72,.12,9.8,idx%2?mAmber:mWhite,s*7.4,.55,0));
g.add(mbox(.14,.03,4,bDash,s*2.15,0,0));
}
g.position.z=z;scene.add(g);scroll.push(g);
}
for(let z=-410,i=0;z<=20;z+=10,i++)roadSeg(z,i);

const winMat=(()=>{const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),e=document.createElement('canvas');e.width=64;e.height=128;const y=e.getContext('2d');x.fillStyle='#aab8c6';x.fillRect(0,0,64,128);y.fillStyle='#000';y.fillRect(0,0,64,128);for(let i=0;i<8;i++)for(let j=0;j<16;j++){x.fillStyle='#27384a';x.fillRect(i*8+1,j*8+2,6,5);if(Math.random()>.45){y.fillStyle=Math.random()>.5?'#ffd890':'#7fe8ff';y.fillRect(i*8+1,j*8+2,6,5)}}const t1=new THREE.CanvasTexture(c),t2=new THREE.CanvasTexture(e);t1.wrapS=t1.wrapT=t2.wrapS=t2.wrapT=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map:t1,emissive:0xffffff,emissiveMap:t2,emissiveIntensity:0,roughness:.35,metalness:.25})})();
function bld(x,z){const h=14+Math.random()*24,w=5+Math.random()*3,g=new THREE.BoxGeometry(w,h,w),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/6,uv.getY(i)*h/12);const b=new THREE.Mesh(g,winMat);b.position.set(x,h/2,z);scene.add(b);scen.push(b)}
const mTrunk=mat(0x8a6a48),mFrond=mat(0x2f9a4a),mFrond2=mat(0x3fb85c);
function palm(x,z){const g=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,5,7),mTrunk);t.position.y=2.5;t.rotation.z=x>0?.08:-.08;g.add(t);for(let i=0;i<9;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(.55,.05,3.2),i%2?mFrond:mFrond2);const a=i/9*6.28;f.rotation.order='YXZ';f.position.set(Math.cos(a)*1.3+(x>0?.4:-.4),5.1,Math.sin(a)*1.3);f.rotation.y=1.57-a;f.rotation.x=.35;g.add(f)}g.position.set(x,0,z);scene.add(g);scen.push(g)}
function bush(x,z){const g=new THREE.Group();for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.7+Math.random()*.4,8,6),i%2?mFrond:mFrond2);s.position.set(i*.8-.8,.5,Math.random()*.5);s.scale.y=.8;g.add(s)}g.position.set(x,0,z);scene.add(g);scen.push(g)}
function pine(x,z,sn){const g=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,2,6),mat(0x5a4028));t.position.y=1;g.add(t);for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(2.2-i*.55,2.6,8),mat(sn?(i%2?0xffffff:0xdfeaf4):0x1f6b36));c.position.y=3+i*1.5;g.add(c)}g.position.set(x,0,z);scene.add(g);scen.push(g)}
function cactus(x,z){const g=new THREE.Group(),m=mat(0x3d8a3a),a=new THREE.Mesh(new THREE.CylinderGeometry(.35,.4,4,8),m);a.position.y=2;g.add(a);for(const s of [-1,1]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,1.4,6),m);b.position.set(s*.7,2.6,0);g.add(b)}g.position.set(x,0,z);scene.add(g);scen.push(g)}
function rock(x,z,c){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(1+Math.random()*1.6),mat(c));r.position.set(x,.6,z);r.scale.y=.7;scene.add(r);scen.push(r)}
function tree(x,z,c){const g=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,3,6),mat(0x5a4028));t.position.y=1.5;g.add(t);for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(1.7-i*.3,9,7),mat(c[i%2]));s.position.set((i-1)*.7,3.6+i*.5,(i%2)*.5);g.add(s)}g.position.set(x,0,z);scene.add(g);scen.push(g)}
function mesa(x,z){const w=3+Math.random()*3,h=6+Math.random()*9,m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w*1.2),mat(Math.random()>.5?0xc0603a:0xa84a2c));m.position.set(x+(x>0?3:-3)*Math.random(),h/2,z);scene.add(m);scen.push(m)}

const mWall=mat(0xc9a36a),mThatch=mat(0x9a7a2c),mTin=mat(0x9aa4aa),mDoor=mat(0x4a3018);
function hut(x,z){const g=new THREE.Group(),w=3+Math.random()*1.6,b=new THREE.Mesh(new THREE.BoxGeometry(w,2.2,w),mWall);b.position.y=1.1;
const r=new THREE.Mesh(new THREE.ConeGeometry(w*.85,1.7,4),Math.random()>.5?mThatch:mTin);r.position.y=3.05;r.rotation.y=Math.PI/4;
g.add(b,r,mbox(.8,1.4,.06,mDoor,0,.7,w/2+.03));g.position.set(x,0,z);scene.add(g);scen.push(g)}
function paddy(x,z){const m=new THREE.Mesh(new THREE.BoxGeometry(9,.3,12),mat(Math.random()>.5?0x9fd048:0x6fb83a));m.position.set(x,.05,z);scene.add(m);scen.push(m)}
function pond(x,z){const m=new THREE.Mesh(new THREE.BoxGeometry(9,.2,7),mat(0x3f8fb5,{metalness:.3,roughness:.2}));m.position.set(x,.1,z);scene.add(m);scen.push(m)}
function pole(x,z){const g=new THREE.Group(),p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,7,6),mTrunk);p.position.y=3.5;const c=new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,.12),mTrunk);c.position.y=6.6;g.add(p,c);g.position.set(x,0,z);scene.add(g);scen.push(g)}

function buildScen(ty){scen.splice(0).forEach(o=>scene.remove(o));for(let z=-390;z<20;z+=15){const L=-(10.4+Math.random()*1.5),Rr=10.4+Math.random()*1.5;
if(ty==='city'){palm(-10.4,z);palm(10.4,z);palm(-12.6,z+7);palm(12.6,z+7);bush(-11.6,z+3.5);bush(11.6,z+3.5);bld(-(18+Math.random()*4),z-5);bld(18+Math.random()*4,z-5)}
else if(ty==='neon'){bld(-(13+Math.random()*3),z);bld(13+Math.random()*3,z)}
else if(ty==='desert'){cactus(L,z);Math.random()>.4?cactus(Rr+Math.random()*6,z+4):rock(Rr+3,z,0x9a7a4a);rock(L-4,z+7,0xb08a55)}
else if(ty==='pine'||ty==='snow'){const s=ty==='snow';pine(L,z,s);pine(Rr,z+3,s);pine(L-5,z+8,s);pine(Rr+5,z+9,s)}
else if(ty==='sakura'||ty==='autumn'){const c=ty==='sakura'?[0xff9ec8,0xffc2dc]:[0xe8761c,0xd4a017];tree(L,z,c);tree(Rr,z+3,c);tree(L-5,z+8,c);tree(Rr+5,z+9,c)}
else if(ty==='village'){Math.random()<.55?hut(L-2-Math.random()*4,z):palm(L,z);Math.random()<.55?hut(Rr+2+Math.random()*4,z+4):palm(Rr,z+4);bush(L-1,z+8);bush(Rr+1,z+10);paddy(L-11-Math.random()*3,z+2);paddy(Rr+11+Math.random()*3,z+6);if(Math.random()<.18)pond(Math.random()<.5?L-9:Rr+9,z+11);if(Math.round(z/15)%3===0){pole(L+.6,z+5);pole(Rr-.6,z+5)}}
else if(ty==='canyon'){mesa(L-2,z);mesa(Rr+2,z+5);rock(L-6,z+9,0xc0603a)}
else if(ty==='mount'){rock(L-3,z,0x70767e);rock(Rr+3,z+4,0x8a9099);pine(L-7,z+8,false);pine(Rr+7,z+10,true)}
else if(ty==='coast'){palm(L,z);palm(Rr,z+4);bush(Rr+3,z+9)}
else if(ty==='tropic'){palm(L,z);palm(Rr,z+3);palm(L-4,z+8);palm(Rr+4,z+10);bush(L-2,z+5)}
else{rock(L-2,z,0x2a1a18);rock(Rr+2,z+5,0x3a2420)}}}
function gantry(z){const g=new THREE.Group();g.rotation.order='YXZ';for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.3,6,.3),mat(0x777f88));p.position.set(s*7.8,3,0);g.add(p)}const b=new THREE.Mesh(new THREE.BoxGeometry(16,.35,.35),mat(0x777f88));b.position.y=6;g.add(b);for(const x of [-3,3]){const sg=new THREE.Mesh(new THREE.BoxGeometry(4,1.6,.15),mat(0x0a7a3e));sg.position.set(x,5,.1);g.add(sg)}g.position.z=z;scene.add(g);scroll.push(g)}gantry(-120);gantry(-300);
const hills=[];for(let i=0;i<10;i++){const h=new THREE.Mesh(new THREE.SphereGeometry(30+Math.random()*30,12,8),mat(i%2?0x6f5f45:0x3f7a46));h.scale.y=.45;h.position.set((i%2?1:-1)*(70+Math.random()*60),-8,-150-i*30);scene.add(h);hills.push(h)}

const sun=new THREE.Group();{const a=new THREE.Mesh(new THREE.SphereGeometry(16,16,12),bm(0xfff4b0,false)),b=new THREE.Mesh(new THREE.SphereGeometry(30,16,12),new THREE.MeshBasicMaterial({color:0xffe9a0,transparent:true,opacity:.28,fog:false})),c=new THREE.Mesh(new THREE.SphereGeometry(48,16,12),new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:.12,fog:false}));sun.add(a,b,c);sun.position.set(-28,88,-350);scene.add(sun)}
const moon=new THREE.Group();{const a=new THREE.Mesh(new THREE.SphereGeometry(14,16,12),bm(0xf0f4ff,false)),b=new THREE.Mesh(new THREE.SphereGeometry(26,16,12),new THREE.MeshBasicMaterial({color:0xaac4ff,transparent:true,opacity:.2,fog:false}));moon.add(a,b);moon.position.set(28,88,-330);moon.visible=false;scene.add(moon)}
const clouds=new THREE.Group();for(let i=0;i<12;i++){const c=new THREE.Group();for(let j=0;j<5;j++){const s=new THREE.Mesh(new THREE.SphereGeometry(7+Math.random()*7,10,8),bm(0xffffff,false));s.position.set(j*9-18,Math.random()*5,Math.random()*5);s.scale.y=.55;c.add(s)}c.position.set(-260+i*44,72+Math.random()*28,-300-Math.random()*40);clouds.add(c)}scene.add(clouds);
const stars=(()=>{const p=[];for(let i=0;i<1500;i++){const az=(Math.random()-.5)*2.6,el=.07+Math.random()*.9,r=520;p.push(Math.sin(az)*Math.cos(el)*r,Math.sin(el)*r,-Math.cos(az)*Math.cos(el)*r)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:2.4,sizeAttenuation:false,fog:false,transparent:true}));s.visible=false;scene.add(s);return s})();
let skyDay=0x7fb8e0;
const birds=new THREE.Group();for(let i=0;i<8;i++){const b=new THREE.Group(),m=bm(0x1a1f26,false);for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(2.6,.12,.8).translate(s*1.3,0,0),m);w.userData.s=s;b.add(w)}b.position.set(-280+i*70,25+Math.random()*20,-100-Math.random()*70);b.scale.setScalar(1.8);b.userData.sp=6+Math.random()*5;b.userData.ph=Math.random()*6;birds.add(b)}scene.add(birds);
const snow=(()=>{const n=600,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(Math.random()-.5)*70;p[i*3+1]=Math.random()*26;p[i*3+2]=-70+Math.random()*80}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.28,fog:false}));s.visible=false;s.frustumCulled=false;scene.add(s);return s})();
const head=new THREE.PointLight(0xfff0c0,0,40);
function setNight(n){const c=n?0x040b22:skyDay;scene.background.set(c);scene.fog.color.set(c);hemi.intensity=n?.7:1.9;hemi.color.set(n?0x6070a0:0xdff6ff);sunL.intensity=n?.9:2;sunL.color.set(n?0x8fa8ff:0xfff1d4);sun.visible=clouds.visible=birds.visible=!n;moon.visible=stars.visible=n;head.intensity=n?2.2*(1+.35*ml('lights')):0;head.distance=40+12*ml('lights');winMat.emissiveIntensity=n?1.3:0;if(typeof recal==='function')recal()}

const carColors=[0xe0202f,0x1f6bff,0xffc21f,0x8c65ff,0x1fd07a,0xf2f6ff];
const plateTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#f4f6fa';x.fillRect(0,0,256,64);x.fillStyle='#1b4fd8';x.fillRect(0,0,22,64);x.strokeStyle='#222';x.lineWidth=3;x.strokeRect(2,2,252,60);x.fillStyle='#111';x.font='bold 38px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('RACING GTR',140,34);return new THREE.CanvasTexture(c)})();
function makeCar(color,s=1,v=0,fin=null,x=null){
const g=new THREE.Group(),V=v%4,w=[1.8,1.95,1.75,1.9][V],pr=fin!==null,tm=bm(0x7a0f18),dk=mat(0x0c0f13,{roughness:.5}),gold=fin===2,sh=new THREE.Shape();
[[-2.1,.28],[-2.1,.75],[-1.55,.88],[-.8,1],[-.2,1.22],[.55,1.2],[1.05,.88],[2,.62],[2.15,.42],[2,.28]].forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
const geo=new THREE.ExtrudeGeometry(sh,{depth:w,bevelEnabled:true,bevelSize:.09,bevelThickness:.09,bevelSegments:4});geo.translate(0,0,-w/2);
const o={color:gold?0xffc94a:color,metalness:gold?.9:.4,roughness:.18};if(pr){o.clearcoat=1;o.clearcoatRoughness=.03}
const hy=[1,.92,1.08,.88][V],body=new THREE.Mesh(geo,new(pr?THREE.MeshPhysicalMaterial:THREE.MeshStandardMaterial)(o));body.rotation.y=Math.PI/2;body.scale.y=hy;g.add(body);
const gs=new THREE.Shape();[[-.95,.96],[-.3,1.21],[.5,1.19],[1,.9]].forEach((p,i)=>i?gs.lineTo(p[0],p[1]):gs.moveTo(p[0],p[1]));
const gg=new THREE.ExtrudeGeometry(gs,{depth:w+.06,bevelEnabled:false});gg.translate(0,0,-(w+.06)/2);const gl=new THREE.Mesh(gg,mat(0x10202e,{metalness:.9,roughness:.05}));gl.rotation.y=Math.PI/2;gl.scale.y=hy;g.add(gl);
const tire=mat(0x0d1014),rimM=mat(x?x.rim:0x2a3038,{metalness:.8}),spM=mat(0xe6edf2,{metalness:.9,roughness:.2}),calM=mat(0xe01818,{roughness:.4});
for(const sx of [-1,1])for(const z of [-1.3,1.35]){const wg=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.32,pr?20:12),tire),r=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.34,pr?16:8),rimM);t.rotation.z=r.rotation.z=Math.PI/2;wg.add(t,r);
if(pr){for(let k=0;k<5;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.04,.5,.07),spM);sp.position.x=sx*.18;sp.rotation.x=k*Math.PI/5;wg.add(sp)}
wg.add(mbox(.06,.14,.2,calM,sx*.14,.2,0))}
wg.position.set(sx*(w/2+.03),.38,z);g.add(wg)}
g.add(mbox(w+.1,.05,.55,dk,0,.2,-2.3),mbox(w-.2,.12,.5,dk,0,.25,2.3));
const hl=bm(0xe6fbff);for(const sx of [-.6,.6])g.add(mbox(.5,.07,.06,hl,sx,.5,-2.25),mbox(.5,.1,.06,tm,sx,.66,2.22));
g.add(mbox(w-.3,.05,.05,tm,0,.72,2.24));
if(pr){g.add(mbox(w+.12,.12,1.8,dk,0,.24,0));
for(const q of [-1,1])g.add(mbox(.18,.1,.22,mat(gold?0xffc94a:color,{metalness:.5,roughness:.2}),q*(w/2+.1),.98*hy,-.75),mbox(.04,.16,.6,dk,q*(w/2+.08),.55,.35));
const pl=new THREE.Mesh(new THREE.PlaneGeometry(.72,.18),new THREE.MeshBasicMaterial({map:plateTex}));pl.position.set(0,.43,2.29);g.add(pl);
const exM=mat(0xaab4bd,{metalness:1,roughness:.2});for(const sx of [-.4,.4]){const ex=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.2,12),exM);ex.rotation.x=Math.PI/2;ex.position.set(sx,.3,2.33);g.add(ex)}
g.add(mbox(w-.5,.06,.5,dk,0,.18,2.2));
const drl=bm(0xffffff);for(const sx of [-.6,.6])g.add(mbox(.5,.025,.05,drl,sx,.6,-2.26));
for(const q of [-1,1])g.add(mbox(.05,.05,3.2,dk,q*(w/2+.04),.3,0));
if(fin>0)g.add(mbox(w+.5,.02,4.2,new THREE.MeshBasicMaterial({color:x?x.ac:color,transparent:true,opacity:.5}),0,.04,0))}
if(V%2===0){g.add(mbox(w,.07,.42,dk,0,1.08,1.9));for(const sx of [-.6,.6])g.add(mbox(.06,.3,.1,dk,sx,.92,1.85))}else g.add(mbox(w-.1,.05,.35,dk,0,.88,2.0));
if(x){const ac=new THREE.MeshBasicMaterial({color:x.ac});
for(const q of [-1,1])g.add(mbox(.03,.07,3.3,ac,q*(w/2+.115),.58,0),mbox(.26,.1,.2,mat(color,{metalness:.5,roughness:.2}),q*(w/2+.2),.9*hy,-.55));
g.add(mbox(w-.1,.03,.05,ac,0,.38,-2.27));
if(V===1||V===3)g.add(mbox(.5,.14,.8,dk,0,1.27*hy,.05))}
g.userData.tm=tm;g.scale.setScalar(s);return g}

function mkWheel(g,x,z,r,w,tire,rim){const a=new THREE.Group(),t=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,14),tire),m=new THREE.Mesh(new THREE.CylinderGeometry(r*.62,r*.62,w+.02,10),rim);t.rotation.z=m.rotation.z=Math.PI/2;a.add(t,m);a.position.set(x,r,z);g.add(a)}
function makeTruck(d,pk,s=1){
const g=new THREE.Group(),bd=mat(d.c,{metalness:.35,roughness:.3}),dk=mat(0x0c0f13),gl=mat(0x10202e,{metalness:.9,roughness:.05}),tire=mat(0x0d1014),rim=mat(d.rim||0x2a3038,{metalness:.8}),tm=bm(0x7a0f18),hl=bm(0xe6fbff),
L=pk?4.4:5.4,fz=-L/2,cl=L-1.95,zc=fz+1.95+cl/2;
g.add(mbox(2,.35,L,dk,0,.5,0));
g.add(mbox(2,1.0,1.9,bd,0,1.15,fz+.95));
g.add(mbox(1.92,.65,1.3,gl,0,1.97,fz+1.15));
g.add(mbox(1.97,.1,1.4,bd,0,2.35,fz+1.15));
if(pk){g.add(mbox(2.1,.15,cl,bd,0,.85,zc),mbox(.1,.5,cl,bd,-1,1.15,zc),mbox(.1,.5,cl,bd,1,1.15,zc),mbox(2.1,.5,.1,bd,0,1.15,L/2-.05))}
else{g.add(mbox(2.2,2.0,cl,mat(0xe8edf2),0,1.85,zc),mbox(2.24,.2,cl,bm(d.ac||d.c),0,1.3,zc))}
g.add(mbox(2.1,.25,.2,dk,0,.45,fz-.05));
for(const q of [-.7,.7])g.add(mbox(.4,.2,.06,hl,q,.9,fz-.02),mbox(.4,.2,.06,tm,q,.8,L/2+.02));
for(const q of [-1,1]){mkWheel(g,q*1.0,fz+.95,.5,.4,tire,rim);mkWheel(g,q*1.0,L/2-.9,.5,.4,tire,rim);if(!pk)mkWheel(g,q*1.0,L/2-2.2,.5,.4,tire,rim)}
g.userData.tm=tm;g.scale.setScalar(s);return g}
function makeMicro(d,s=1){
const g=new THREE.Group(),bd=mat(d.c,{metalness:.4,roughness:.25}),gl=mat(0x10202e,{metalness:.9,roughness:.05}),dk=mat(0x0c0f13),tire=mat(0x0d1014),rim=mat(d.rim||0x2a3038,{metalness:.8}),tm=bm(0x7a0f18),hl=bm(0xe6fbff);
g.add(mbox(1.9,1.35,4.2,bd,0,1.0,0),mbox(1.92,.1,3.6,mat(0xf2f6ff),0,1.72,.2),mbox(1.9,.5,.5,bd,0,.55,-2.35),mbox(1.7,.7,.05,gl,0,1.3,-2.12),mbox(2,.2,.3,dk,0,.4,-2.6),mbox(2,.2,.3,dk,0,.4,2.25));
for(const q of [-1,1]){g.add(mbox(.04,.55,3.0,gl,q*.96,1.4,.3),mbox(.4,.2,.06,hl,q*.65,.62,-2.61),mbox(.3,.25,.06,tm,q*.7,1.0,2.12));mkWheel(g,q*.98,-1.4,.4,.3,tire,rim);mkWheel(g,q*.98,1.3,.4,.3,tire,rim)}
g.userData.tm=tm;g.scale.setScalar(s);return g}
function makeMissile(d,s=1){
const g=new THREE.Group(),bd=mat(d.c,{metalness:.7,roughness:.15}),wt=mat(0xe8edf2,{metalness:.6,roughness:.2}),dk=mat(0x0c0f13),tire=mat(0x0d1014),rim=mat(d.rim||0x2a3038,{metalness:.8}),tm=bm(0x7a0f18);
const b=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,3.8,18),wt);b.rotation.x=Math.PI/2;b.position.set(0,.85,.2);
const nose=new THREE.Mesh(new THREE.ConeGeometry(.62,1.8,18),bd);nose.rotation.x=-Math.PI/2;nose.position.set(0,.85,-2.6);
const ring=new THREE.Mesh(new THREE.CylinderGeometry(.64,.64,.4,18),new THREE.MeshBasicMaterial({color:d.ac||0x20e7ff}));ring.rotation.x=Math.PI/2;ring.position.set(0,.85,-.4);
const cp=new THREE.Mesh(new THREE.SphereGeometry(.45,12,8),mat(0x10202e,{metalness:.9,roughness:.05}));cp.scale.set(1,.7,1.7);cp.position.set(0,1.4,-.2);
const nz=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.5,12),new THREE.MeshBasicMaterial({color:0xff7a1a}));nz.rotation.x=Math.PI/2;nz.position.set(0,.85,2.3);
g.add(b,nose,ring,cp,nz,mbox(1.9,.08,.9,bd,0,.85,1.8),mbox(.08,.9,.9,bd,0,1.5,1.8));
for(const q of [-1,1]){g.add(mbox(.4,.3,3.0,dk,q*1.0,.5,0),mbox(.6,.1,.3,dk,q*.7,.7,-1.3),mbox(.6,.1,.3,dk,q*.7,.7,1.4),mbox(.3,.06,.1,tm,q*.8,.92,2.25));mkWheel(g,q*1.05,-1.3,.38,.3,tire,rim);mkWheel(g,q*1.05,1.4,.38,.3,tire,rim)}
g.userData.tm=tm;g.scale.setScalar(s);return g}
function vehMake(d){const k=d.kind;if(k==='truck')return makeTruck(d,false);if(k==='pickup')return makeTruck(d,true);if(k==='micro')return makeMicro(d);if(k==='missile')return makeMissile(d);return makeCar(d.c,k==='suv'?1.1:1,k==='suv'?1:k==='sedan'?3:d.v,d.fin,d)}
function tvh(){const q=Math.random(),col=carColors[Math.floor(Math.random()*carColors.length)],d={c:col,rim:0x2a3038,ac:col};if(q<.18)return makeTruck(d,false,.9);if(q<.3)return makeTruck(d,true,.9);if(q<.45)return makeMicro(d,.9);return makeCar(col,.9,Math.floor(Math.random()*4))}

const KINDS=['sport','suv','micro','truck','sport','missile','sedan','pickup'];
const KE={sport:'🏎️',suv:'🚙',micro:'🚐',truck:'🚚',missile:'🚀',sedan:'🚗',pickup:'🛻'};
const KL={sport:'GT',suv:'SUV',micro:'মাইক্রো',truck:'ট্রাক',missile:'মিসাইল',sedan:'সেডান',pickup:'পিকআপ'};
const KM={sport:1.04,suv:1,micro:.96,truck:.94,missile:1.12,sedan:1,pickup:.98};
const KS=['truck','pickup','micro','missile'];
const ENG={
sport:{a:'sawtooth',b:'square',b0:48,m:3.4,r:.505,f0:300,fm:28,q:2,v:.05,nz:0,bp:2400},
suv:{a:'sawtooth',b:'sawtooth',b0:38,m:2.8,r:.5,f0:250,fm:22,q:1.5,v:.055,nz:.01,bp:1800},
micro:{a:'square',b:'square',b0:58,m:3.0,r:.5,f0:380,fm:24,q:3,v:.045,nz:.01,bp:2800},
truck:{a:'sawtooth',b:'sawtooth',b0:26,m:1.8,r:.99,f0:180,fm:14,q:4,v:.075,nz:.02,bp:900},
missile:{a:'sawtooth',b:'triangle',b0:80,m:5.2,r:1.5,f0:700,fm:45,q:1,v:.04,nz:.09,bp:4000},
sedan:{a:'triangle',b:'sawtooth',b0:44,m:3.0,r:.5,f0:320,fm:26,q:1,v:.05,nz:0,bp:2400},
pickup:{a:'sawtooth',b:'square',b0:34,m:2.4,r:.75,f0:230,fm:20,q:2.5,v:.06,nz:.015,bp:1400}};
const HORN={truck:.6,pickup:.8,micro:1.1,missile:1.6,suv:.9,sedan:1,sport:1.2};
const hues=[0xffc21f,0x1f6bff,0xe0202f,0x8c65ff,0x1fd07a,0xf2f6ff,0xff6a1a,0x12d6d6];
const PN=['Neon','Turbo','Phantom','Apex','Vortex','Nova','Titan','Specter','Quasar','Falcon','Inferno','Striker','Blaze','Comet','Cobra','Raptor'],MN=['GT','R','X','S','RS','Z','GTR','Evo'];
const hx=c=>'#'+c.toString(16).padStart(6,'0');
const carDef=i=>({i,kind:KINDS[i%8],n:PN[i%16]+' '+KL[KINDS[i%8]]+' '+MN[Math.floor(i/16)%8]+(i>=128?' Mk'+(Math.floor(i/128)+1):''),e:KE[KINDS[i%8]],cost:i?Math.round(1000*Math.pow(1.18,i-1)/50)*50:0,sp:+((1+Math.min(i,40)*.03)*KM[KINDS[i%8]]).toFixed(2),
c:i<hues.length?hues[i]:new THREE.Color().setHSL((i*.618034)%1,.6+((i*7)%4)*.1,.4+((i*5)%4)*.05).getHex(),
ac:new THREE.Color().setHSL((i*.618034+.5)%1,.9,.6).getHex(),rim:[0x2a3038,0xe6edf2,0xffc94a,0xff4b6e,0x20e7ff][i%5],v:(i+Math.floor(i/4))%4,fin:i&&i%5===0?2:i%3===0?1:0});
let coinsSaved=rd('nr_coins',0),best=rd('nr_best',0),owned=rd('nr_owned',[0]),carId=rd('nr_car',0),ownedR=rd('nr_ownedR',[0]),roadId=rd('nr_road',0);
let mods=rd('nr_mods',{});
let cust=rd('nr_cust',{}),cown=rd('nr_cown',{});
const COLS=[['আসল রং',null,0],['রেড',0xe0202f,300],['ব্লু',0x1f6bff,300],['ইয়েলো',0xffc21f,300],['গ্রিন',0x1fd07a,400],['হোয়াইট',0xf2f6ff,400],['ব্ল্যাক',0x15181d,600],['অরেঞ্জ',0xff6a1a,500],['পিঙ্ক',0xff4fa8,600],['পার্পল',0x8c65ff,600],['সাইয়ান',0x12d6d6,700],['গোল্ড',0xffc94a,1500],['ক্রিমসন',0xb0102a,400],['নেভি',0x14307a,400],['লাইম',0xa6e22e,400],['টিল',0x0f8f8f,500],['মেরুন',0x6a1020,500],['সিলভার',0xb8c2cc,600],['গানমেটাল',0x4a525c,600],['রোজ গোল্ড',0xe0a090,900],['ভায়োলেট',0x5a2aa8,700],['স্কাই',0x58b8ff,500],['মিন্ট',0x7fe8b8,500],['ব্রোঞ্জ',0xb06a2c,900]];
const RIMS=[['আসল চাকা',null,0],['সিলভার',0xe6edf2,200],['গোল্ড',0xffc94a,400],['রেড',0xff4b6e,300],['সাইয়ান',0x20e7ff,300],['ব্ল্যাক',0x0a0c10,200],['গ্রিন',0x27e07b,300],['পার্পল',0x8c65ff,300],['অরেঞ্জ',0xff8a1a,300],['পিংক',0xff4fa8,300],['ক্রোম',0xcfd8e0,500],['ব্রোঞ্জ',0xb06a2c,400],['ব্লু',0x2f7bff,300]];
const TINT=[['আসল কাচ',null,0],['কালো',0x000000,150],['নীল',0x1050a0,200],['সবুজ',0x108060,200],['লাল',0x901020,250],['পার্পল',0x4a1a80,250],['অরেঞ্জ',0xb05a10,250],['সাইয়ান',0x108aa0,250]];
const HLC=[['আসল লাইট',null,0],['হলুদ',0xffd34e,150],['নীল',0x58a8ff,250],['সবুজ',0x58ff9a,250],['গোলাপি',0xff6ad8,300],['লাল',0xff4a4a,300],['বেগুনি',0xa070ff,300],['সাইয়ান',0x58f0ff,250],['অরেঞ্জ',0xffa030,250]];
const GLOW=[['নেই',null,0],['সাইয়ান',0x20e7ff,400],['পিংক',0xff3bd8,400],['গ্রিন',0x27e07b,400],['গোল্ড',0xffd34e,500],['রেড',0xff3b30,500],['হোয়াইট',0xffffff,500],['পার্পল',0xa070ff,500],['অরেঞ্জ',0xff8a1a,500],['ব্লু',0x2f7bff,450],['লাইম',0xb8ff3a,500]];
const KIT=[['আসল বডি',0,0],['স্প্লিটার কিট',1,800],['সাইড পড',2,1000],['স্কুপ ও স্ট্রাইপ',3,1200],['বিগ কার্বন উইং',4,1800],['ফেন্ডার ফ্লেয়ার',5,1400],['রুফ লাইট বার',6,1600],['ফুল রেস কিট',7,2600]];
const STR=[['নেই',null,0],['সাদা',0xffffff,200],['রেড',0xff3030,250],['ব্লু',0x3a8bff,250],['ইয়েলো',0xffd34e,250],['গ্রিন',0x27e07b,250],['কালো',0x050607,200],['অরেঞ্জ',0xff8a1a,250],['পিংক',0xff4fa8,300],['সাইয়ান',0x20e7ff,300],['গোল্ড',0xffc94a,500]];
const HRN=[['আসল হর্ন',1,0],['ডিপ বাস',.7,200],['হাই পিচ',1.4,200],['ডাবল টোন',1.2,300],['ট্রাক এয়ার',.5,400],['মিউজিক্যাল',1.8,500]];
const MCATS=[['col','🎨','বডি রং',COLS],['rim','🛞','চাকা',RIMS],['tint','🪟','কাচ',TINT],['hl','💡','হেডলাইট',HLC],['glow','✨','আন্ডারগ্লো',GLOW],['stripe','🏁','স্ট্রাইপ',STR],['kit','🧰','বডি কিট',KIT],['horn','📯','হর্ন',HRN]];
function cs(c){return ((cust[carId]||{})[c])||0}
function applyCust(){
  if(!player||!curDef)return;
  const old=player.getObjectByName('custvis');if(old)player.remove(old);
  const d=curDef,bodyHex=(!KS.includes(d.kind)&&d.fin===2)?0xffc94a:d.c;
  const nc=COLS[cs('col')][1],nr=RIMS[cs('rim')][1],nt=TINT[cs('tint')][1],nl=HLC[cs('hl')][1];
  player.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color)return;const m=o.material,h=m.color.getHex();
    if(nc!==null&&h===bodyHex&&!m.isMeshBasicMaterial)m.color.setHex(nc);
    else if(nr!==null&&h===d.rim&&m.metalness===.8)m.color.setHex(nr);
    else if(nt!==null&&h===0x10202e)m.color.setHex(nt);
    else if(nl!==null&&h===0xe6fbff&&m.isMeshBasicMaterial)m.color.setHex(nl)});
  head.color.setHex(nl!==null?nl:0xfff0c0);
  const g=new THREE.Group();g.name='custvis';
  const gl=cs('glow'),kt=cs('kit'),dk=mat(0x0c0f13,{roughness:.4,metalness:.5}),cf=mat(0x1a1d22,{roughness:.3,metalness:.7});
  if(gl>0)g.add(mbox(2.6,.02,5.0,new THREE.MeshBasicMaterial({color:GLOW[gl][1],transparent:true,opacity:.6}),0,.08,0));
  const K=kt===7?[1,4,5]:[kt];
  for(const k of K){
    if(k===1){g.add(mbox(2.1,.08,.5,cf,0,.22,-2.55),mbox(2.0,.1,.5,cf,0,.3,2.5))}
    else if(k===2){for(const q of [-1,1])g.add(mbox(.22,.3,2.2,cf,q*1.08,.45,0),mbox(.1,.1,.5,dk,q*1.12,.7,-1.1))}
    else if(k===3){g.add(mbox(.7,.3,.9,dk,0,1.45,-.1));for(const q of [-.25,.25])g.add(mbox(.14,.02,2.2,new THREE.MeshBasicMaterial({color:0xffffff}),q,1.04,-1.2))}
    else if(k===4){g.add(mbox(2.3,.09,.75,cf,0,1.75,2.1));for(const q of [-.8,.8])g.add(mbox(.08,.6,.14,cf,q,1.45,2.1))}
    else if(k===5){for(const q of [-1,1])for(const z of [-1.3,1.35])g.add(mbox(.26,.14,1.0,cf,q*1.03,.88,z))}
    else if(k===6){g.add(mbox(1.7,.1,.22,cf,0,1.55,-.3));for(const q of [-.6,-.2,.2,.6])g.add(mbox(.2,.1,.05,new THREE.MeshBasicMaterial({color:0xffffff}),q,1.55,-.43))}
  }
  const st=cs('stripe');if(st>0){const sm=new THREE.MeshBasicMaterial({color:STR[st][1]});for(const q of [-1,1])g.add(mbox(.03,.07,3.4,sm,q*1.06,.62,0),mbox(.03,.05,3.4,sm,q*1.06,.78,0))}
  player.add(g);
}

function rd(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

let savedLvl=clamp(rd('nr_lvl',1),1,100);const T=L=>Math.round((15000+5000*(L-1)+100*(L-1)*(L-1))/1000)*1000;

const MAXL=5;
function ml(p){return ((mods[carId]||{})[p])||0}
function maxHits(){return 3+ml('body')}
const PARTS=[
{id:'body',e:'🚘',n:'বডি / বাম্পার',d:'প্রতি লেভেলে +১ ধাক্কা সহ্য করে, আর্মার বাম্পার যোগ হয়',pool:[1,14,13]},
{id:'wheels',e:'🛞',n:'চাকা',d:'প্রতি লেভেলে স্টিয়ারিং ও গ্রিপ +৬%, গোল্ডেন রিম',pool:[8,9,21]},
{id:'frame',e:'🧱',n:'ফ্রেম / চ্যাসিস',d:'ধাক্কার পর সুরক্ষার সময় +০.৪ সেকেন্ড/লেভেল, সাইড স্কার্ট',pool:[12,15,7]},
{id:'lights',e:'💡',n:'হেডলাইট',d:'রাতে আলো ও দেখার পরিধি বাড়ে, উজ্জ্বল লাইট',pool:[0,3,2]},
{id:'engine',e:'⚙️',n:'ইঞ্জিন',d:'গতি ও ত্বরণ +৩%/লেভেল',pool:[5,10,22]},
{id:'brakes',e:'🛑',n:'ব্রেক',d:'ব্রেক শক্তি +১৫%/লেভেল, দ্রুত থামে',pool:[4,11,19]},
{id:'spoiler',e:'🪽',n:'স্পয়লার / নাইট্রো',d:'সুপার স্পিড কুলডাউন −৬ সেকেন্ড/লেভেল, বড় উইং',pool:[16,17,18]},
{id:'paint',e:'🎨',n:'রং ও আন্ডারগ্লো',d:'স্কোর বোনাস +৫%/লেভেল, নিয়ন আন্ডারগ্লো',pool:[6,20,3]}];
function need(p,k){return p.pool.map((id,j)=>[id,j===2?Math.ceil(k/2):k])}
function applyMods(){
  if(!player)return;
  const old=player.getObjectByName('modvis');if(old)player.remove(old);
  const g=new THREE.Group();g.name='modvis';
  const p=ml('paint'),s=ml('spoiler'),w=ml('wheels'),l=ml('lights'),b=ml('body'),f=ml('frame');
  const cols=[0x20e7ff,0xff3bd8,0x27e07b,0xffd34e,0xff5a2a];
  if(p>0)g.add(mbox(2.4,.02,4.8,new THREE.MeshBasicMaterial({color:cols[p-1],transparent:true,opacity:.55}),0,.05,0));
  if(s>0){const wm=mat(cols[(s-1)%5],{metalness:.6,roughness:.25});g.add(mbox(2.0,.07,.5+.12*s,wm,0,1.55,2.0));for(const q of [-.7,.7])g.add(mbox(.07,.45,.12,wm,q,1.32,2.0))}
  if(w>0){const rm=new THREE.MeshBasicMaterial({color:[0xffc94a,0x20e7ff,0xff4b6e,0x27e07b,0xffffff][w-1]});for(const sx of [-1,1])for(const z of [-1.3,1.35]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.2+.02*w,.2+.02*w,.36,12),rm);r.rotation.z=Math.PI/2;r.position.set(sx*.98,.38,z);g.add(r)}}
  if(l>0){const lm=new THREE.MeshBasicMaterial({color:0xffffff});for(const sx of [-.6,.6])g.add(mbox(.5+.06*l,.1,.06,lm,sx,.55,-2.32))}
  if(b>0){const am=mat(0x39414a,{metalness:.8,roughness:.3});g.add(mbox(2.1,.2,.3,am,0,.38,-2.42));if(b>=3)g.add(mbox(2.1,.2,.3,am,0,.38,2.42))}
  if(f>0){const fm=mat(0x39414a,{metalness:.8,roughness:.3});for(const q of [-1,1])g.add(mbox(.1,.14,3.0,fm,q*1.02,.3,0));if(f>=3)g.add(mbox(1.7,.05,.06,fm,0,1.6,.1))}
  player.add(g);
  head.intensity=(scene.background&&scene.background.getHex()===0x040b22)?2.2*(1+.35*l):head.intensity;head.distance=40+12*l;
}

const fx=(()=>{const N=180,pp=new Float32Array(N*3),pc=new Float32Array(N*3),pv=new Float32Array(N*3),pl=new Float32Array(N);
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pp,3));g.setAttribute('color',new THREE.BufferAttribute(pc,3));
const pts=new THREE.Points(g,new THREE.PointsMaterial({size:.34,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));pts.frustumCulled=false;
const M=70,lp=new Float32Array(M*6),ls=[];for(let i=0;i<M;i++)ls.push({x:(Math.random()<.5?-1:1)*(2+Math.random()*7),y:.3+Math.random()*5.5,z:-90+Math.random()*100,l:8+Math.random()*10});
const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(lp,3));
const lm=new THREE.LineBasicMaterial({color:0xcff6ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),lines=new THREE.LineSegments(lg,lm);lines.frustumCulled=false;lines.visible=false;
const fm=new THREE.MeshBasicMaterial({color:0xff8a1a,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}),flames=[];
for(const x of [-.4,.4]){const f=new THREE.Mesh(new THREE.ConeGeometry(.16,1.8,10),fm);f.rotation.x=Math.PI/2;f.position.set(x,.3,3.3);f.visible=false;flames.push(f)}
const glow=new THREE.PointLight(0xff7a1a,0,16);glow.position.set(0,.8,3);
let k=0,int=0;
function emit(){const r=Math.random();let x=r<.5?-.97:.97,y=.38,z=r<.3||(r>.5&&r<.8)?1.35:-1.3;if(Math.random()<.25){x=Math.random()<.5?-.4:.4;y=.3;z=2.4}
const i=k++%N;pp[i*3]=x;pp[i*3+1]=y;pp[i*3+2]=z;pv[i*3]=Math.sign(x)*(1+Math.random()*4)+(Math.random()-.5)*2;pv[i*3+1]=1.5+Math.random()*4;pv[i*3+2]=8+Math.random()*14;pl[i]=.35+Math.random()*.35}
function update(dt,on,cur){int=lerp(int,on?1:0,1-Math.exp(-(on?12:4)*dt));
if(on)for(let n=0;n<Math.ceil(dt*900);n++)emit();
for(let i=0;i<N;i++){if(pl[i]>0){pl[i]-=dt;pp[i*3]+=pv[i*3]*dt;pv[i*3+1]-=9*dt;pp[i*3+1]=Math.max(.05,pp[i*3+1]+pv[i*3+1]*dt);pp[i*3+2]+=pv[i*3+2]*dt;const f=clamp(pl[i]*2.6,0,1);pc[i*3]=f;pc[i*3+1]=f*(.35+pl[i]);pc[i*3+2]=f*.12}else{pc[i*3]=pc[i*3+1]=pc[i*3+2]=0}}
g.attributes.position.needsUpdate=g.attributes.color.needsUpdate=true;
lines.visible=int>.03;lm.opacity=.7*int;
if(lines.visible){const sp=(60+cur*.5)*dt;for(let i=0;i<M;i++){const s=ls[i];s.z+=sp;if(s.z-s.l>14){s.z=-90-Math.random()*20;s.x=(Math.random()<.5?-1:1)*(2+Math.random()*7);s.y=.3+Math.random()*5.5}
lp[i*6]=s.x;lp[i*6+1]=s.y;lp[i*6+2]=s.z;lp[i*6+3]=s.x;lp[i*6+4]=s.y;lp[i*6+5]=s.z-s.l}lg.attributes.position.needsUpdate=true}
fm.opacity=.85*int;flames.forEach(f=>{f.visible=int>.05;f.scale.set(.8+Math.random()*.4,.7+Math.random()*.9,.8+Math.random()*.4)});glow.intensity=int*4}
return{pts,lines,flames,glow,update}})();

let player=null,curDef=null;function buildPlayer(){if(player)scene.remove(player);{const d=carDef(carId);curDef=d;player=vehMake(d)}player.rotation.order='YXZ';player.position.set(0,0,4);player.add(head,fx.pts,fx.lines,fx.glow,...fx.flames);head.position.set(0,1.5,-4);scene.add(player);applyCust();applyMods()}buildPlayer();
const traffic=[],coins=[];

function kindSVG(d){const h=hx(d.c),a=hx(d.ac),rm=hx(d.rim),k=d.kind,sh='<ellipse cx="110" cy="90" rx="92" ry="7" fill="#0008"/>',wl=x=>`<circle cx="${x}" cy="80" r="13" fill="#0a0e14"/><circle cx="${x}" cy="80" r="7" fill="${rm}"/>`;let b='';
if(k==='truck')b=`<rect x="76" y="20" width="134" height="52" rx="3" fill="#e8edf2" stroke="#fff7"/><rect x="76" y="50" width="134" height="6" fill="${a}"/><path d="M10 72V46L26 30H70V72Z" fill="${h}" stroke="#fff7"/><path d="M28 34H64V48H18Z" fill="#14283a" stroke="#8be7ff"/><rect x="8" y="70" width="204" height="8" fill="#222"/>${wl(38)}${wl(150)}${wl(186)}`;
else if(k==='pickup')b=`<path d="M10 70V52L40 46L62 26H110L124 46H208V70Z" fill="${h}" stroke="#fff7"/><path d="M66 31H104L114 46H52Z" fill="#14283a" stroke="#8be7ff"/><rect x="128" y="50" width="78" height="5" fill="${a}"/>${wl(50)}${wl(172)}`;
else if(k==='micro')b=`<path d="M10 72V50L30 30H190Q208 30 210 48V72Z" fill="${h}" stroke="#fff7"/><path d="M34 34H60L70 50H22Z" fill="#14283a" stroke="#8be7ff"/><rect x="80" y="36" width="100" height="14" fill="#14283a" stroke="#8be7ff"/><rect x="12" y="58" width="196" height="4" fill="${a}"/>${wl(52)}${wl(166)}`;
else b=`<path d="M4 62Q34 40 84 40H176V76H84Q34 78 4 62Z" fill="#eef2f7" stroke="#fff7"/><path d="M4 62Q18 50 36 45V79Q16 74 4 62Z" fill="${h}"/><path d="M176 40L204 28V52L176 56Z" fill="${h}"/><path d="M176 76L204 90V66L176 62Z" fill="${h}"/><rect x="52" y="48" width="14" height="22" fill="${a}"/><ellipse cx="98" cy="44" rx="22" ry="8" fill="#14283a" stroke="#8be7ff"/><path d="M204 52L218 58L204 64Z" fill="#ff8a1a"/>${wl(60)}${wl(160)}`;
return `<svg viewBox="0 0 220 100">${sh}${b}</svg>`}
function carSVG(d){if(KS.includes(d.kind))return kindSVG(d);const h=hx(d.c),a=hx(d.ac),rm=hx(d.rim),sy=[1,.95,1.1,.9][d.v];
return `<svg viewBox="0 0 220 100"><defs><linearGradient id="g${d.i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient></defs>${d.fin?`<ellipse cx="110" cy="88" rx="96" ry="7" fill="${a}" opacity=".55"/>`:`<ellipse cx="110" cy="88" rx="85" ry="8" fill="#0008"/>`}${d.v%2===0?`<rect x="172" y="36" width="34" height="5" rx="2" fill="#111"/><rect x="180" y="40" width="4" height="12" fill="#111"/><rect x="196" y="40" width="4" height="12" fill="#111"/>`:``}<g transform="translate(0 80) scale(1 ${sy}) translate(0 -80)"><path d="M12 68 L22 56 L70 48 L100 26 Q112 20 135 22 L158 40 L205 56 L210 70 L200 80 L20 80Z" fill="${h}"/><path d="M12 68 L22 56 L70 48 L100 26 Q112 20 135 22 L158 40 L205 56 L210 70 L200 80 L20 80Z" fill="url(#g${d.i})" stroke="#fff7" stroke-width="1.5"/><path d="M82 46 L102 30 Q112 27 132 28 L150 44Z" fill="#14283a" stroke="#8be7ff"/><path d="M26 67 L200 67" stroke="${a}" stroke-width="3.5"/><path d="M14 62 L34 60 L34 66 L14 68Z" fill="#fff6c8"/><path d="M196 62 L208 62 L208 68 L196 68Z" fill="#ff2a3c"/></g><circle cx="60" cy="78" r="15" fill="#0a0e14"/><circle cx="60" cy="78" r="9" fill="${rm}"/><circle cx="160" cy="78" r="15" fill="#0a0e14"/><circle cx="160" cy="78" r="9" fill="${rm}"/></svg>`}

function makePolice(){const c=makeCar(0xf2f5fa,.9,1),blk=mat(0x0a0c10),rm=new THREE.MeshBasicMaterial({color:0xff2020}),bl=new THREE.MeshBasicMaterial({color:0x2a6bff});
for(const q of [-1,1])c.add(mbox(.03,.42,2.3,blk,q*1.085,.62,.15),mbox(.03,.08,3.6,bl,q*1.085,.42,0));
c.add(mbox(1.5,.07,.34,blk,0,1.13,-.15),mbox(.7,.13,.3,rm,-.38,1.2,-.15),mbox(.7,.13,.3,bl,.38,1.2,-.15));
c.userData.em='p';c.userData.lr=rm;c.userData.lb=bl;return c}
function makeAmb(){const g=new THREE.Group(),wh=mat(0xf4f6fa),rd=new THREE.MeshBasicMaterial({color:0xe02020}),tire=mat(0x0d1014);
g.add(mbox(1.95,1.9,3.5,wh,0,1.35,.55),mbox(1.95,1.15,1.5,wh,0,.95,-1.95),mbox(1.7,.55,.06,mat(0x10202e,{metalness:.8,roughness:.1}),0,1.2,-2.71),mbox(1.7,.12,.12,mat(0x20262e),0,.3,0));
for(const q of [-1,1]){g.add(mbox(.03,.2,3.5,rd,q*.98,1.0,.55),mbox(.03,.85,.24,rd,q*.99,1.65,.6),mbox(.03,.24,.85,rd,q*.99,1.65,.6));
for(const z of [-1.9,1.5]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,14),tire);w.rotation.z=Math.PI/2;w.position.set(q*.95,.42,z);g.add(w)}
g.add(mbox(.4,.2,.05,bm(0xe6fbff),q*.6,.85,-2.72),mbox(.3,.2,.05,bm(0x9a1010),q*.7,1.0,2.31))}
const pv=new THREE.Group();pv.position.set(0,2.42,-.3);pv.add(mbox(.5,.13,.16,rd,-.25,.1,0),mbox(.5,.13,.16,bm(0xffffff),.25,.1,0));g.add(mbox(.5,.1,.5,mat(0x20262e),0,2.36,-.3),pv);
const ha=new THREE.Mesh(new THREE.SphereGeometry(.65,10,8),new THREE.MeshBasicMaterial({color:0xff2a2a,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));ha.position.set(0,2.65,-.3);g.add(ha);
g.scale.setScalar(.95);g.userData={em:'a',pv,ha,tm:null};return g}
function emLights(now){for(const c of traffic){const u=c.userData;if(u.lr){const ph=Math.floor(now/130)%2;u.lr.color.setHex(ph?0xff2020:0x3a0c0c);u.lb.color.setHex(ph?0x0c1038:0x2a6bff)}
if(u.pv){u.pv.rotation.y=now/1000*9;u.ha.material.opacity=.12+.45*(.5+.5*Math.sin(now/1000*9))}}}

function trafficAI(c,dt){const u=c.userData;let tv=u.v;const dl=u.tlx-u.lx;if(dl)u.lx+=Math.sign(dl)*Math.min(Math.abs(dl),4.5*dt);
let gap=1e9,ls=0;for(const o of traffic)if(o!==c&&Math.abs(o.userData.lx-u.lx)<1.8&&o.position.z<c.position.z){const g=c.position.z-o.position.z-4.8;if(g<gap){gap=g;ls=o.userData.cv}}
if(gap<4+u.cv*.9)tv=gap<2.4?0:Math.min(tv,ls);
if($('law').checked&&sigState!=='GREEN'){const gp=c.position.z-stopLine.position.z-2.8;if(gp>-.4&&gp<u.cv*u.cv/16+8)tv=0}
u.cv=u.cv>tv?Math.max(tv,u.cv-14*dt):Math.min(tv,u.cv+6*dt)}
function honk(){sfx('horn');if(!running||dying>0)return;for(const c of traffic){const dz=player.position.z-c.position.z,u=c.userData;
if(dz>3&&dz<70&&Math.abs(u.lx-player.position.x)<2.6){const ln=[-4,0,4].filter(l=>Math.abs(l-u.lx)>1&&Math.abs(l-u.lx)<5&&!traffic.some(o=>o!==c&&Math.abs(o.userData.tlx-l)<1&&Math.abs(o.position.z-c.position.z)<9));
if(ln.length){ln.sort((a,b)=>Math.abs(b-player.position.x)-Math.abs(a-player.position.x));u.tlx=ln[0]}}}}

function die(m){if(dying>0)return;dying=2.2;dieMsg=m;tumbleT=0;supT=0;sfx('crash');sfx('tumble');shake=.9}
function dyingStep(dt){dying-=dt;tumbleT+=dt;cur=Math.exp(-1.2*dt);const mv=cur*dt;
scroll.forEach(m=>{m.position.z+=mv;if(m.position.z>20)m.position.z-=440});scen.forEach(o=>{o.position.z+=mv;if(o.position.z>20)o.position.z-=420});TD+=mv;
signal.position.z+=mv;stopLine.position.z=signal.position.z+2;
traffic.forEach(c=>{c.position.z+=(cur-c.userData.cv)*dt});coins.forEach(c=>{c.position.z+=mv});
const u=clamp(tumbleT/1.3,0,1),e=1-(1-u)*(1-u),b=tumbleT-1.3;
player.visible=true;player.rotation.x=-e*Math.PI*5;player.rotation.z=Math.sin(u*Math.PI*2)*.45;player.rotation.y+=dt*1.2;
player.position.y=Math.sin(Math.PI*u)*6+1.1*e+(b>0?Math.abs(Math.sin(b*9))*.5*Math.exp(-b*4):0);
player.position.x=clamp(player.position.x+Math.sin(u*3)*dt*3,-5,5);
place();engine(cur);if(dying<=0)end(dieMsg)}

const SR={};
function sirenInit(){if(SR.p||!A)return;for(const k of ['p','a']){const o=A.createOscillator(),f=A.createBiquadFilter(),g=A.createGain(),p=A.createStereoPanner?A.createStereoPanner():null;o.type=k==='p'?'sawtooth':'square';f.type='lowpass';f.Q.value=1.5;g.gain.value=0;o.connect(f);f.connect(g);if(p){g.connect(p);p.connect(sG)}else g.connect(sG);o.start();SR[k]={o,f,g,p}}}
function sirenUpdate(t){if(!A)return;sirenInit();const ct=A.currentTime;
for(const k of ['p','a']){const s=SR[k];let best=null,bd=1e9;if(running)for(const c of traffic)if(c.userData.em===k){const d=Math.hypot(c.position.x-player.position.x,c.position.z-player.position.z);if(d<bd){bd=d;best=c}}
if(!best){s.g.gain.setTargetAtTime(0,ct,.1);continue}
const q=clamp(1-bd/320,0,1),dx=best.position.x-player.position.x,dop=1+clamp((cur-best.userData.cv)/220,-.12,.12);
const f=(k==='p'?800+700*Math.abs(Math.sin(t/1000*5.2)):(Math.floor(t/550)%2?960:720))*dop;
s.o.frequency.setTargetAtTime(f,ct,k==='p'?.01:.02);s.g.gain.setTargetAtTime(q*q*.22+(bd<30?.05:0),ct,.08);s.f.frequency.setTargetAtTime(500+5500*q,ct,.1);if(s.p)s.p.pan.setTargetAtTime(clamp(dx/25,-1,1),ct,.1)}}

const signal=new THREE.Group();signal.rotation.order='YXZ';signal.position.set(5.4,0,-80);scene.add(signal);
{const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,4.5,8),mat(0x555f6a));p.position.y=2.25;signal.add(p);const b=new THREE.Mesh(new THREE.BoxGeometry(.75,1.75,.55),mat(0x151b24));b.position.y=4.05;signal.add(b)}
const lamps=[0xff2525,0xffc52e,0x20ff7a].map((c,i)=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),new THREE.MeshBasicMaterial({color:c}));l.position.set(0,4.55-i*.5,.3);signal.add(l);return l});
const stopLine=box(12,.03,.3,bm(0xfff1d2),0,.03,-78);stopLine.rotation.order='YXZ';
let sigState='GREEN',sigT=0,passed=false;
function setSig(s){sigState=s;const k=s==='RED'?0:s==='YELLOW'?1:2;lamps.forEach((l,i)=>l.material.color.set(i===k?[0xff2525,0xffc52e,0x20ff7a][i]:0x242a30));$('sigT').textContent=s}

/* ট্রাফিক মাঝারি রাখার জন্য কাউন্ট ও স্পাওনিং লজিক */
function spawnTraffic(cr,zz){if(traffic.length>=10)return;const z0=zz!==undefined?zz:-120-Math.random()*50-clamp(cur,0,94)*.6;const lanes=[-4,0,4].filter(l=>!traffic.some(o=>Math.abs(o.userData.lx-l)<1.5&&Math.abs(o.position.z-z0)<22));if(!lanes.length)return;const r=Math.random(),ne=!traffic.some(q=>q.userData.em),c=ne&&r<.07?makePolice():ne&&r<.14?makeAmb():tvh();c.rotation.order='YXZ';const lx=lanes[Math.floor(Math.random()*lanes.length)];c.userData.lx=lx;c.position.set(lx,0,z0);c.userData.v=(.3+Math.random()*.3)*cr;c.userData.cv=c.userData.v;c.userData.tlx=lx;scene.add(c);traffic.push(c)}

const dGeo=new THREE.LatheGeometry([[0,-1],[.78,.1],[.86,.22],[.5,.62],[0,.62]].map(p=>new THREE.Vector2(p[0],p[1])),8),
dEdge=new THREE.EdgesGeometry(dGeo),
dMat=new THREE.MeshPhysicalMaterial({color:0xd6f6ff,emissive:0x2aa8d8,emissiveIntensity:.6,metalness:.25,roughness:.02,clearcoat:1,flatShading:true}),
dLine=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.85});
function spawnCoin(){const lx=[-4,0,4][Math.floor(Math.random()*3)],z0=-70-Math.random()*70,n=1+Math.floor(Math.random()*3);for(let k=0;k<n;k++){const c=new THREE.Mesh(dGeo,dMat);c.add(new THREE.LineSegments(dEdge,dLine));c.scale.setScalar(1.05);c.userData.lx=lx;c.position.set(lx,1.5,z0-k*6);scene.add(c);coins.push(c)}}

function place(){
const c4=curveC(TD-4),R=z=>curveC(TD-z)-c4;
scroll.forEach(m=>{const z=m.position.z;m.position.x=R(z);m.position.y=ey(z);m.rotation.y=-Math.atan(curveS(TD-z));m.rotation.x=Math.atan(elevS(TD-z))});
scen.forEach(o=>{if(o.userData.bx===undefined){o.userData.bx=o.position.x;o.userData.by=o.position.y}o.position.x=o.userData.bx+R(o.position.z);o.position.y=o.userData.by+ey(o.position.z)});
const sz=signal.position.z;signal.position.x=5.4+R(sz);signal.position.y=ey(sz);signal.rotation.y=-Math.atan(curveS(TD-sz));signal.rotation.x=Math.atan(elevS(TD-sz));
const lz=stopLine.position.z;stopLine.position.x=R(lz);stopLine.position.y=.03+ey(lz);stopLine.rotation.y=-Math.atan(curveS(TD-lz));stopLine.rotation.x=Math.atan(elevS(TD-lz));
traffic.forEach(c=>{const z=c.position.z;c.position.x=c.userData.lx+R(z);c.position.y=ey(z);c.rotation.y=-Math.atan(curveS(TD-z));c.rotation.x=Math.atan(elevS(TD-z))});
coins.forEach(c=>{c.position.x=c.userData.lx+R(c.position.z);c.position.y=1.5+ey(c.position.z)});
}

let A,mG,sG,nb,dl,arpBus,nx=0,st=0,eng;
const mf=m=>440*Math.pow(2,(m-69)/12);
function ac(){if(!A){A=new(window.AudioContext||window.webkitAudioContext)();const cp=A.createDynamicsCompressor();cp.connect(A.destination);mG=A.createGain();sG=A.createGain();mG.connect(cp);sG.connect(cp);
dl=A.createDelay();dl.delayTime.value=.3;const fb=A.createGain();fb.gain.value=.32;const dg=A.createGain();dg.gain.value=.4;dl.connect(fb);fb.connect(dl);dl.connect(dg);dg.connect(mG);arpBus=A.createGain();arpBus.connect(mG);arpBus.connect(dl);
nb=A.createBuffer(1,A.sampleRate,A.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;vol();nx=A.currentTime+.1;setInterval(seq,40)}if(A.state==='suspended')A.resume();return A}
function vol(){if(!A)return;mG.gain.value=$('music').checked?$('mvol').value/100*.8:0;sG.gain.value=$('sound').checked?$('svol').value/100:0}
function note(f,t,type,d,v,dest,lp,att=.005,det=0){const o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.value=f;o.detune.value=det;let n=o;if(lp){const x=A.createBiquadFilter();x.type='lowpass';x.frequency.value=lp;o.connect(x);n=x}g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.001,t+d);n.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.05)}
function noi(t,d,fr,v,dest,type){const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=nb;f.type=type||'highpass';f.frequency.value=fr;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+d+.02)}
function seq(){if(!A||A.state!=='running')return;while(nx<A.currentTime+.25){const s=st%64,ch=s>>4,r=[45,41,48,43][ch],th=[3,4,4,4][ch],t=nx;
if(s%2===0)note(mf(r-12+(s%8===6?12:0)),t,'sawtooth',.22,.28,mG,520);
if(s%16===0)for(const k of [0,th,7])note(mf(r+12+k),t,'sawtooth',2.1,.05,mG,900,.45,k*3-3);
if(s%2===0)note(mf(r+24+[0,th,7,12,7,th,12,7][(s>>1)%8]),t,'triangle',.26,.12,arpBus,3000);
if(s%32===8)note(mf(r+31),t,'sine',.9,.1,arpBus,0,.05);
if(s%4===0){const o=A.createOscillator(),g=A.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.15);g.gain.setValueAtTime(.8,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(mG);o.start(t);o.stop(t+.22)}
if(s%8===4){noi(t,.16,1800,.28,mG);note(190,t,'triangle',.1,.2,mG)}
if(s%2===1)noi(t,.05,8000,.07,mG);nx+=.134;st++}}

const ISND=[
{w:'sine',f:[784,1175,1568],g:.07,d:.25},
{w:'square',f:[1200,1600],g:.05,d:.08,v:.12},
{w:'triangle',f:[523,659,784,1047,1319],g:.06,d:.3},
{w:'triangle',f:[880,880,1320],g:.09,d:.15},
{w:'sine',f:[2093,1760,1397],g:.05,d:.35,vib:1},
{w:'sawtooth',f:[200,300,450,700],g:.04,d:.12,lp:1500,v:.15,nz:1},
{w:'triangle',f:[523,587,659,698,784,880,988,1047],g:.045,d:.2},
{w:'square',f:[392,523,659],g:.1,d:.2,v:.12,lp:2000},
{w:'triangle',f:[440,660],g:.12,d:.1},
{w:'square',f:[660,660,880],g:.06,d:.07,v:.1},
{w:'sawtooth',f:[110,165,220,330,440],g:.08,d:.3,lp:900,v:.18,nz:1},
{w:'sine',f:[392,330,392,330],g:.1,d:.18},
{w:'triangle',f:[1047,1319,1568,2093],g:.08,d:.4},
{w:'triangle',f:[880,1175,1397],g:.08,d:.35},
{w:'triangle',f:[587,740,880],g:.08,d:.3},
{w:'square',f:[523,659,784,1047],g:.05,d:.1,v:.12},
{w:'sawtooth',f:[196,233,196],g:.12,d:.25,lp:1200},
{w:'sine',f:[1568,1319,1568,2093,1568],g:.07,d:.2},
{w:'sawtooth',f:[147,139,131,123],g:.12,d:.3,lp:800},
{w:'triangle',f:[330,392,330,494],g:.1,d:.25},
{w:'sine',f:[988,1319,988,1319],g:.04,d:.3,vib:1},
{w:'square',f:[300,400,500,300,600],g:.045,d:.06,v:.1,nz:1},
{w:'sine',f:[262,311,370,466,622],g:.11,d:.5}];

function sfx(k,n){if(!A||!$('sound').checked)return;const t=A.currentTime;
if(k==='coin'){note(988,t,'triangle',.14,.3,sG);note(1319,t+.07,'triangle',.3,.3,sG)}
else if(k==='crash'){noi(t,.6,900,.9,sG,'lowpass');const o=A.createOscillator(),g=A.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(30,t+.4);g.gain.setValueAtTime(.8,t);g.gain.exponentialRampToValueAtTime(.001,t+.45);o.connect(g);g.connect(sG);o.start(t);o.stop(t+.5)}
else if(k==='horn'){const hm=(HORN[curDef?curDef.kind:'sport']||1)*(HRN[cs('horn')][1]||1);note(340*hm,t,'sawtooth',.45,.14,sG,1400,.02);note(430*hm,t,'sawtooth',.45,.14,sG,1400,.02)}
else if(k==='fine'){note(330,t,'triangle',.2,.3,sG);note(220,t+.18,'triangle',.3,.3,sG)}
else if(k==='tumble'){for(let i=0;i<4;i++){const q=t+.1+i*.34;noi(q,.22,280,.8,sG,'lowpass');note(95-i*8,q,'sine',.25,.7,sG);note(1800-i*200,q,'square',.05,.12,sG,3000)}noi(t+1.3,.5,200,.9,sG,'lowpass');noi(t+1.35,.7,1500,.3,sG)}
else if(k==='hail'){note(650,t,'triangle',.2,.2,sG);note(880,t+.1,'triangle',.3,.2,sG)}
else if(k==='board'){note(520,t,'sine',.15,.25,sG);note(780,t+.08,'sine',.25,.25,sG)}
else if(k==='dropoff'){note(880,t,'triangle',.15,.3,sG);note(1174,t+.12,'triangle',.35,.3,sG)}
else if(k==='item'){const s=ISND[n]||ISND[1],v=s.v||.25;s.f.forEach((f,i)=>note(f,t+i*s.g,s.w,s.d,v,sG,s.lp||0,.005,s.vib?(i%2?15:-15):0));if(s.nz)noi(t,.25,3000,.12,sG)}
else if(k==='dia'){[1319,1760,2349,3136].forEach((f,i)=>note(f,t+i*.05,'sine',.4,.22,sG))}
else if(k==='power'){const o=A.createOscillator(),g=A.createGain();o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(1600,t+.4);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);o.connect(g);g.connect(sG);o.start(t);o.stop(t+.55)}
else if(k==='magnet'){note(110,t,'square',.5,.2,sG,600);note(220,t+.15,'square',.5,.2,sG,900);note(440,t+.3,'sine',.4,.2,sG)}
else if(k==='skpick'){noi(t,.3,1500,.25,sG,'bandpass');note(600,t,'triangle',.1,.25,sG);note(900,t+.1,'triangle',.2,.25,sG)}
else if(k==='level'){[523,659,784,1047,1319].forEach((f,i)=>note(f,t+i*.08,'square',.25,.15,sG,3000))}
else if(k==='fail'){note(220,t,'sawtooth',.3,.3,sG);note(150,t+.15,'sawtooth',.4,.3,sG)}}

function engine(c){if(!A)return;if(!eng){const o1=A.createOscillator(),o2=A.createOscillator(),f=A.createBiquadFilter(),g=A.createGain();o1.type='sawtooth';o2.type='square';f.type='lowpass';f.Q.value=2;o1.connect(f);o2.connect(f);f.connect(g);g.connect(sG);o1.start();o2.start();
const s=A.createBufferSource(),bp=A.createBiquadFilter(),sg=A.createGain();s.buffer=nb;s.loop=true;bp.type='bandpass';bp.frequency.value=2400;bp.Q.value=3;sg.gain.value=0;s.connect(bp);bp.connect(sg);sg.connect(sG);s.start();eng={o1,o2,f,g,sg,bp,k:-1}}
const P=ENG[curDef?curDef.kind:'sport'],vi=curDef?curDef.i:0;
if(eng.k!==vi){eng.k=vi;eng.o1.type=P.a;eng.o2.type=P.b;eng.f.Q.value=P.q;eng.bp.frequency.value=P.bp}
const t=A.currentTime,fq=(P.b0+(vi%7)*1.6)+c*P.m;eng.o1.frequency.setTargetAtTime(fq,t,.08);eng.o2.frequency.setTargetAtTime(fq*P.r,t,.08);eng.f.frequency.setTargetAtTime(P.f0+c*P.fm+(gas?250:0),t,.1);eng.g.gain.setTargetAtTime(running?P.v+(gas?.03:0):0,t,.12);eng.sg.gain.setTargetAtTime((running?P.nz*clamp(c/60,0,1):0)+(running&&brake&&c>8?.1:0),t,.05)}

let running=false,score=0,base=0,level=1,dist=0,cur=0,hits=0,shake=0,spT=0,cnT=0,runT=0,over=0,btn=0,tilt=0,gas=0,brake=0,camV=0,steer=0,fines=0,supT=0,supCD=0,dying=0,dieMsg='',tumbleT=0,invul=0;

let skT=0,rT=0,puT=0,skSp=0,chipS='',hailTold=0,sayT=0,pax=0,pT=0,boostT=0,skStock=0,mgT=0,itT=0;
const pw={slow:0,shield:0,ghost:0,freeze:0,magnet:0,x2:0};
const PU=[['🐢','ধীরগতির', 'slow'],['🛡️','বর্ম', 'shield'],['👻','ভূত', 'ghost'],['❄️','হিমায়িত', 'freeze'],['🧲','ম্যাগনেট', 'magnet'],['✖️2','ডাবল', 'x2']];
const fly=[];const rws=[];const ppl=[];

const badge=$('badge');
const popEl=document.createElement('div');popEl.style.cssText='position:fixed;z-index:6;left:50%;top:max(104px,calc(env(safe-area-inset-top) + 96px));transform:translateX(-50%);display:none;padding:7px 14px;border-radius:30px;background:#061321ee;border:1px solid #ffc23d;font-weight:800;font-size:13px;white-space:nowrap;pointer-events:none';document.body.appendChild(popEl);
function pop(m){popEl.textContent=m;popEl.style.display='block';clearTimeout(popEl.k);popEl.k=setTimeout(()=>popEl.style.display='none',2600)}
const bursts=[];
let runLoot={};
function lootUI(){$('lootBar').innerHTML=Object.keys(runLoot).map(e=>`<span class="lc">${e} ${runLoot[e]}</span>`).join('')}
function lootAdd(e,n=1){runLoot[e]=(runLoot[e]||0)+n;lootUI()}
function say(t,v){}
function gain(f){coinsSaved+=f;sv('nr_coins',coinsSaved);sync()}

const ITEMS=[['🌟','এক্সপি',2],['🪙','কমন টোকেন',1],['💜','রেয়ার জেম',8],['🟡','লাকি টোকেন',3],['🧊','আইস ক্রিস্টাল',5],['🔥','ফায়ার ক্রিস্টাল',5],['🌈','রেইনবো জেম',15],['🗝️','ট্রেজার কী',10],['🧩','পাজল পিস',2],['🔤','লেটার কালেকশন',2],['🐉','রেয়ার কালেক্টিবল',20],['🐻','টেডি বেয়ার',6],['🥇','গোল্ড মেডেল',12],['🥈','সিলভার মেডেল',8],['🥉','ব্রোঞ্জ মেডেল',5],['🎖️','অ্যাচিভমেন্ট ব্যাজ',7],['🎃','সিজনাল আইটেম',4],['🎄','ক্রিসমাস গিফট',6],['🎃','হ্যালোইন কালেক্টিবল',6],['🗺️','ট্রেজার ম্যাপ',9],['💌','মিস্ট্রি কার্ড',4],['🎲','লাকি ডাইস',3],['🔮','মিস্ট্রি অর্ব',10]];
let inv=rd('nr_inv',{});
function wealth(){let w=coinsSaved;for(const k in inv)w+=inv[k]*ITEMS[k][2];return w}
function spend(c){let r=c;const u=Math.min(coinsSaved,r);coinsSaved-=u;r-=u;if(r>0){const ks=Object.keys(inv).map(Number).sort((a,b)=>ITEMS[a][2]-ITEMS[b][2]);for(const k of ks){while(inv[k]>0&&r>0){inv[k]--;r-=ITEMS[k][2]}}}sv('nr_coins',coinsSaved);sv('nr_inv',inv);sync()}
function invUI(){const e=Object.keys(inv).filter(k=>inv[k]>0).map(k=>ITEMS[k][0]+inv[k]).join(' ');$('invBox').innerHTML='🎁 '+(e||'কোনো পুরস্কার নেই')+'<br>মোট কেনার ক্ষমতা: 💎 <b>'+wealth().toLocaleString()+'</b>'}

$('skBtn').addEventListener('pointerdown',e=>{e.preventDefault();if(running&&skStock>0&&skT<=0){skStock--;skT=5;pop('🛹 স্কেটবোর্ড চালু! ৫ সেকেন্ড');sfx('board')}});
function skUI(){const b=$('skBtn'),s=running&&skStock>0?'block':'none';if(b.style.display!==s)b.style.display=s;const t='🛹'+(skStock>1?' ×'+skStock:'');if(b.textContent!==t)b.textContent=t}

const emC={};function emTex(e){return emC[e]||(emC[e]=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font='90px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,64,70);return new THREE.CanvasTexture(c)})())}
function spawnRw(type){
  const g=new THREE.Group(),c=type==='s'?0xffc23d:type==='p'?0x20e7ff:type==='m'?0xff3b3b:type==='i'?0xffd34e:0x27e07b,k=type==='i'?Math.floor(Math.random()*ITEMS.length):0;
  let core;
  if(type==='i'){core=new THREE.Sprite(new THREE.SpriteMaterial({map:emTex(ITEMS[k][0])}));core.scale.set(2.2,2.2,1)}
  else core=new THREE.Mesh(type==='p'?new THREE.OctahedronGeometry(.9):type==='s'?new THREE.BoxGeometry(1.7,.25,.7):type==='m'?new THREE.TorusGeometry(.6,.25,8,16):new THREE.BoxGeometry(1.1,1.1,1.1),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.8,metalness:.3,roughness:.3}));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.07,8,24),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.7}));
  g.add(core,ring);
  const lx=[-4,0,4][Math.floor(Math.random()*3)];
  g.userData={lx,t:type,h:core,ring,k};
  g.position.set(lx,1.8,-110);
  scene.add(g);
  rws.push(g);
}
function grab(u){
  const b=new THREE.Mesh(new THREE.TorusGeometry(1,.08,8,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}));b.rotation.x=Math.PI/2;b.position.y=1;player.add(b);bursts.push({b,t:0});
  if(u.t==='s'){skStock++;lootAdd('🛹');pop('🛹 স্কেটবোর্ড পেয়েছ! পাশের বাটন চাপো');sfx('skpick')}
  else if(u.t==='p'){boostT=5;lootAdd('⚡');pop('⚡ পাওয়ার-আপ! ৫ সেকেন্ড গতি বাড়ছে');sfx('power')}
  else if(u.t==='m'){pw.magnet=5;lootAdd('🧲');pop('🧲 ম্যাগনেট! ৫ সেকেন্ড');sfx('magnet')}
  else if(u.t==='i'){const it=ITEMS[u.k];inv[u.k]=(inv[u.k]||0)+1;sv('nr_inv',inv);score+=20;lootAdd(it[0]);pop(it[0]+' '+it[1]+' +১');sfx('item',u.k)}
  else{score+=50;gain(10);lootAdd('💎',10);sfx('dia');pop('💎 +১০ ডায়মন্ড, +৫০ স্কোর')}
}
function spawnP(hail,side){
  const g=new THREE.Group(),sk=[0xf0c890,0xd8a878,0x9a6a48][Math.floor(Math.random()*3)],cl=[0x2b80ff,0xe0402f,0x2fb86a,0x9a4ae0,0xffb020][Math.floor(Math.random()*5)];
  const body=new THREE.Mesh(new THREE.BoxGeometry(.7,1,.4),mat(cl));body.position.y=1.5;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),mat(sk));head.position.y=2.25;
  const legs=[-1,1].map(s=>{const p=new THREE.Group();p.position.set(s*.2,1,0);const l=new THREE.Mesh(new THREE.BoxGeometry(.25,1,.28),mat(0x2a3342));l.position.y=-.5;p.add(l);g.add(p);return p});
  const arm=new THREE.Group();arm.position.set(.45,1.95,0);const am=new THREE.Mesh(new THREE.BoxGeometry(.22,.9,.22),mat(sk));am.position.y=-.4;arm.add(am);
  g.add(body,head,arm);g.scale.setScalar(1.15);
  if(hail){const m=new THREE.Mesh(new THREE.ConeGeometry(.6,1.2,4),new THREE.MeshBasicMaterial({color:0xffd34e,fog:false}));m.rotation.x=Math.PI;m.position.y=4.6;m.name='mk';g.add(m)}
  g.userData={arm,legs};
  const lx=side*(hail?6:5.4+Math.random()*.8);
  g.position.set(lx,0,-140);
  scene.add(g);
  ppl.push({g,lx,w:hail?0:(Math.random()<.5?-1:1)*(.8+Math.random()*.8),hail});
}

const aura=new THREE.Mesh(new THREE.SphereGeometry(2,12,12),new THREE.MeshBasicMaterial({color:0x3aa0ff,transparent:true,opacity:.35,wireframe:true}));
aura.visible=false;
const chips=document.createElement('div');chips.id='chips';chips.style.cssText='position:fixed;top:80px;right:8px;z-index:4;display:flex;flex-direction:column;gap:4px;pointer-events:none;';
document.body.appendChild(chips);

const pas=new THREE.Mesh(new THREE.BoxGeometry(.9,1.1,.9),mat(0xffc23d));pas.position.set(0,1,-.5);pas.visible=false;
function addPasToPlayer(){if(player&&!player.getObjectByName('pas')) {pas.name='pas';player.add(pas)}}

function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.k);toast.k=setTimeout(()=>t.style.display='none',2300)}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));if(id)$(id).classList.add('active')}
function sync(){$('homeCoins').textContent=$('garageCoins').textContent=$('coinHud').textContent=coinsSaved.toLocaleString();$('best').textContent=best.toLocaleString();$('homeCar').textContent=carDef(carId).e;$('homeLvl').textContent=savedLvl}
function hudOn(v){$('hud').style.display=$('controls').style.display=v?'flex':'none';$('badge').style.display=v?'block':'none';$('speedo').style.display=v?'grid':'none';$('tbar').style.display=v?'block':'none';$('mission').style.display=v?'block':'none';$('lootBar').style.display=v?'flex':'none'}
function superGo(){if(!running||supT>0||supCD>0)return;supT=3;toast('⚡ সুপার স্পিড! ১০০০ km/h')}
function missionBanner(up){const b=$('lvlBanner');b.innerHTML=(up?'🎉 লেভেল পূর্ণ! স্কোর ০ থেকে শুরু<br>':'')+'লেভেল <b>'+level+'</b><br>🎯 মিশন: এই লেভেলে স্কোর <b>'+T(level).toLocaleString()+'</b> পূরণ করো';b.classList.remove('show');void b.offsetWidth;b.classList.add('show')}

const RTY=[
['city','🛣','হাইওয়ে,সিটি এক্সপ্রেস,মেট্রো বাইপাস,সুপার ফ্লাইওভার',0x7fb8e0,0x6b7178,0x2b3038,0xc9bf9c,0x6f5f45,0x3f7a46,0],
['desert','🏜','মরুভূমি,সাহারা পথ,বালুঝড় রোড,মরীচিকা',0xf0c890,0xd9b36a,0x3a3430,0xe8d4a0,0xc9944a,0xb8843c,0],
['snow','❄️','তুষার,আইস ট্র্যাক,হিমালয় পথ,আর্কটিক',0xbfd8ee,0xf2f7ff,0x39434e,0xdde8f0,0xe8f0fa,0xcfdceb,0],
['pine','🌲','বন,পাইন ট্রেইল,সবুজ অরণ্য,কুয়াশা বন',0x8fd0f0,0x2d6a3a,0x2c3036,0x9aa77a,0x2f6b3a,0x245a30,0],
['neon','🌆','নিয়ন সিটি,সাইবার স্ট্রিট,নাইট ডাউনটাউন,হলোগ্রাম এভিনিউ',0x1a1040,0x15162a,0x14141f,0x6a4aa0,0x2a2050,0x1c1840,1],
['lava','🌋','আগ্নেয়,লাভা রিজ,আগুন গিরিপথ,ভলকানো রান',0xc0502a,0x3a1a14,0x1a1a1a,0x5a3a30,0x4a2a20,0x6a3020,0],
['sakura','🌸','চেরি ব্লসম,সাকুরা পথ,গোলাপি উপত্যকা,কিয়োটো ড্রাইভ',0xf5c6e0,0x8fc27a,0x34363c,0xe8d0d8,0xd89ab8,0x9ac08a,0],
['canyon','🏞','রেড ক্যানিয়ন,গ্র্যান্ড গর্জ,মেসা রোড,লাল পাথুরে পথ',0xf0b48a,0xb5553a,0x3a2e2a,0xd9a070,0xa0452c,0xc06a40,0],
['autumn','🍂','শরতের পথ,সোনালি পাতা,হারভেস্ট রোড,মেপল ট্রেইল',0xd8c8a0,0x8a6a2c,0x2c2c30,0xb09060,0xa0601c,0x7a4a18,0],
['coast','🏖','সমুদ্র উপকূল,বিচ হাইওয়ে,মেরিন ড্রাইভ,হারবার রোড',0x6ac8f0,0x1a9ac0,0x30343a,0xf0e2b0,0x4a9a6a,0x3a8a5a,0],
['mount','⛰','পাহাড়ি পথ,আল্পস পাস,শৃঙ্গ রোড,মেঘের গিরিপথ',0x9ab8d8,0x7a8088,0x2a2e34,0xaaaaaa,0x6a7078,0x8a9098,0],
['tropic','🌴','ট্রপিক আইল্যান্ড,পাম প্যারাডাইস,দ্বীপ সড়ক,লেগুন রোড',0x58d0e8,0x2e9a4a,0x383a40,0xe8d890,0x2a8a4a,0x38a85a,0]];
const roadDef=i=>{const b=RTY[i%12],r=Math.floor(i/12),nm=b[2].split(','),sh=c=>new THREE.Color(c).offsetHSL(r*.045,0,((r%3)-1)*.035).getHex();
return{n:nm[r%4]+(r>=4?' '+(Math.floor(r/4)+1):''),e:b[1],ty:b[0],k:sh(b[3]),g:sh(b[4]),a:b[5],s:b[6],h:[sh(b[7]),sh(b[8])],dk:b[9],cost:i?Math.round(1000*Math.pow(1.22,i-1)/50)*50:0,amp:i?+(.7+((i*37)%15)/10).toFixed(2):1,fq:+(1+((i*7)%10)/12).toFixed(2),el:i?+(.4+((i*53)%10)/10).toFixed(2):.6}};
const roadSVG=r=>`<svg viewBox="0 0 220 100"><rect width="220" height="55" fill="${hx(r.k)}"/><path d="M0 55Q45 22 90 55Q140 14 190 55L220 55V56H0Z" fill="${hx(r.h[0])}"/><rect y="55" width="220" height="45" fill="${hx(r.g)}"/><path d="M100 55H120Q122 78 175 100H28Q95 78 100 55Z" fill="${hx(r.a)}"/><path d="M110 56Q108 78 100 100" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="7 7"/></svg>`;
const VIL={n:'গ্রামের পথ',e:'🌾',ty:'village',k:0x9fd8f0,g:0x7dbb4a,a:0x3f3d3a,s:0xb59a6a,h:[0x5f9a40,0x4f8a3a],dk:0,amp:1.1,fq:1.1,el:.5};
function applyRoad(){const vg=$('village').checked,r=vg?VIL:roadDef(roadId);mBar.color.set(vg?0x8a7452:0xb8b8b0);mAsph.color.set(r.a);mShoulder.color.set(r.s);mGround.color.set(r.g);skyDay=r.k;AMP=r.amp;FQ=r.fq;EL=r.el;hills.forEach((h,i)=>h.material.color.set(r.h[i%2]));buildScen(r.ty);snow.visible=r.ty==='snow';setNight($('night').checked||!!r.dk);place()}

let gtab='cars',gN=6;
function garage(){sync();invUI();const bx=$('cars');bx.innerHTML='';const R=gtab==='roads',sel=R?roadId:carId,own=R?ownedR:owned;
$('tabCars').className=R?'':'primary';$('tabRoads').className=R?'primary':'';
for(let i=0;i<gN;i++){const c=R?roadDef(i):carDef(i),has=own.includes(i),d=document.createElement('div'),rr=i&&i%5===0?'r2':i&&i%3===0?'r1':'';d.className='car-card '+rr;
d.innerHTML=`${rr?`<span class="tag">${rr==='r2'?'LEGEND':'RARE'}</span>`:``}<div class="car-art">${R?roadSVG(c):carSVG(c)}</div><h3>${c.e} ${c.n}</h3><p>${R?'বাঁক ×'+c.amp.toFixed(1)+' · ঢাল ×'+c.el.toFixed(1):'গতি ×'+c.sp} · 💎 ${c.cost.toLocaleString()}</p><div class="bar"><i style="width:${R?Math.min(100,c.amp*30+c.el*25):Math.min(100,(c.sp-1)*90+20)}%"></i></div><button class="${sel===i?'primary':has?'':'gold'}">${sel===i?'✓ চালু আছে':has?'ব্যবহার করো':'কিনুন'}</button>`;
d.querySelector('button').onclick=()=>{if(!has&&wealth()<c.cost){toast('আরও '+(c.cost-wealth()).toLocaleString()+' ভ্যালু দরকার');sfx('fine');return}
if(!has){spend(c.cost);own.push(i);sv(R?'nr_ownedR':'nr_owned',own);toast('কেনা হয়েছে! 🎉')}
if(R){roadId=i;sv('nr_road',i);applyRoad()}else{carId=i;sv('nr_car',i);buildPlayer()}garage()};bx.appendChild(d)}}
$('tabCars').onclick=()=>{gtab='cars';gN=6;garage()};$('tabRoads').onclick=()=>{gtab='roads';gN=6;garage()};$('more').onclick=()=>{gN+=6;garage()};

function workshop(){
  sync();
  const d=carDef(carId);
  $('wsArt').innerHTML=carSVG(d);
  $('wsName').textContent=d.e+' '+d.n;
  const e=Object.keys(inv).filter(k=>inv[k]>0).map(k=>ITEMS[k][0]+inv[k]).join(' ');
  $('wsInv').innerHTML='🎁 তোমার পুরস্কার: '+(e||'কোনো পুরস্কার নেই — খেলার সময় সংগ্রহ করো');
  const bx=$('parts');bx.innerHTML='';
  PARTS.forEach(p=>{
    const lv=ml(p.id),maxed=lv>=MAXL,nd=maxed?[]:need(p,lv+1),can=!maxed&&nd.every(([id,q])=>(inv[id]||0)>=q),el=document.createElement('div');
    el.className='car-card'+(maxed?' r2':lv>0?' r1':'');
    el.innerHTML=`${maxed?'<span class="tag">MAX</span>':''}<h3 style="margin-top:${maxed?'22px':'5px'}">${p.e} ${p.n}</h3><p>লেভেল ${lv}/${MAXL} · ${p.d}</p><div class="bar"><i style="width:${lv/MAXL*100}%"></i></div>${maxed?'<p>✅ সর্বোচ্চ আপগ্রেড হয়ে গেছে</p>':'<div>'+nd.map(([id,q])=>{const h=inv[id]||0;return `<span class="rq ${h>=q?'ok':'no'}">${ITEMS[id][0]} ${h}/${q}</span>`}).join('')+'</div>'}<button class="${maxed?'':can?'gold':''}" ${maxed?'disabled':''}>${maxed?'MAX':can?'⬆ আপগ্রেড করো (লেভেল '+(lv+1)+')':'পুরস্কার কম'}</button>`;
    el.querySelector('button').onclick=()=>{
      if(maxed)return;
      if(!can){toast('প্রয়োজনীয় পুরস্কার যথেষ্ট নেই');sfx('fine');return}
      nd.forEach(([id,q])=>{inv[id]-=q});
      sv('nr_inv',inv);
      if(!mods[carId])mods[carId]={};
      mods[carId][p.id]=lv+1;sv('nr_mods',mods);
      applyMods();sfx('level');toast(p.e+' '+p.n+' আপগ্রেড হয়েছে! লেভেল '+(lv+1)+' 🎉');
      workshop();
    };
    bx.appendChild(el);
  });
}
let mtab='col';
function mcI(cat,i){let o=0;for(const c of MCATS){if(c[0]===cat)break;o+=c[3].length}return o+i}
function mcost(cat,i){const it=MCATS.find(c=>c[0]===cat)[3][i],p=(mcI(cat,i)*7)%23;return [p,Math.min(6,Math.max(1,Math.round(it[2]/(ITEMS[p][2]*80))))]}
function modshop(){
  sync();
  const d=carDef(carId),pd=Object.assign({},d,{c:COLS[cs('col')][1]!==null?COLS[cs('col')][1]:d.c,rim:RIMS[cs('rim')][1]!==null?RIMS[cs('rim')][1]:d.rim});
  $('msArt').innerHTML=carSVG(pd);$('msName').textContent=d.e+' '+d.n;
  const ev=Object.keys(inv).filter(k=>inv[k]>0).map(k=>ITEMS[k][0]+inv[k]).join(' ');
  $('msBal').innerHTML='🎁 তোমার পুরস্কার: '+(ev||'কোনো পুরস্কার নেই — খেলার সময় সংগ্রহ করো');
  const tb=$('msTabs');tb.innerHTML='';
  MCATS.forEach(c=>{const b=document.createElement('button');b.className=c[0]===mtab?'primary':'';b.textContent=c[1]+' '+c[2];b.onclick=()=>{mtab=c[0];modshop()};tb.appendChild(b)});
  const cat=MCATS.find(c=>c[0]===mtab),list=cat[3],bx=$('msList');bx.innerHTML='';
  if(!cown[mtab])cown[mtab]=[0];
  list.forEach((it,i)=>{
    const has=cown[mtab].includes(i),sel=cs(mtab)===i,el=document.createElement('div'),pc=it[2]?mcost(mtab,i):null,hv=pc?(inv[pc[0]]||0):0;
    el.className='car-card'+(sel?' r1':'');
    const em=mtab==='kit'?['🚘','🏁','🔩','🌀','🪽','🛞','💡','🏆'][i]:mtab==='horn'?['📯','🔉','🔔','🎺','🚛','🎶'][i]:null;
    const sw=em?`<div class="sw" style="background:#0e2438">${em}</div>`:`<div class="sw" style="background:${it[1]===null?'repeating-linear-gradient(45deg,#18334c 0 8px,#0e2438 8px 16px)':hx(it[1])}">${it[1]===null?'—':''}</div>`;
    const rq=has||!pc?'':`<div><span class="rq ${hv>=pc[1]?'ok':'no'}">${ITEMS[pc[0]][0]} ${ITEMS[pc[0]][1]} ${hv}/${pc[1]}</span></div>`;
    el.innerHTML=sw+`<h3>${it[0]}</h3>${rq}<button style="margin-top:6px" class="${sel?'primary':has?'':'gold'}">${sel?'✓ চালু আছে':has?'ব্যবহার করো':'পুরস্কার দিয়ে কিনুন'}</button>`;
    el.querySelector('button').onclick=()=>{
      if(!has){if(hv<pc[1]){toast('আরও '+(pc[1]-hv)+'টা '+ITEMS[pc[0]][0]+' '+ITEMS[pc[0]][1]+' দরকার');sfx('fine');return}inv[pc[0]]-=pc[1];sv('nr_inv',inv);cown[mtab].push(i);sv('nr_cown',cown);toast('কেনা হয়েছে! 🎉')}
      if(!cust[carId])cust[carId]={};cust[carId][mtab]=i;sv('nr_cust',cust);buildPlayer();sfx('level');modshop();
    };
    bx.appendChild(el);
  });
}
$('modBtn').onclick=$('garageMod').onclick=$('overMod').onclick=$('wsToMod').onclick=()=>{modshop();show('modshop')};
$('msToWork').onclick=()=>{workshop();show('workshop')};
$('workBtn').onclick=()=>{workshop();show('workshop')};
$('garageWork').onclick=()=>{workshop();show('workshop')};
$('overWork').onclick=()=>{workshop();show('workshop')};

async function motionPerm(){try{if(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission)await DeviceMotionEvent.requestPermission()}catch(e){toast('Motion অনুমতি পাওয়া যায়নি—বোতাম ব্যবহার করো')}}

const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let angF=0,haveAng=false,needCal=true,ang0=0,tiltTarget=0,tiltSm=0;
const wrap=d=>{while(d>180)d-=360;while(d<-180)d+=360;return d};
addEventListener('devicemotion',e=>{
const g=e.accelerationIncludingGravity;
if(!g||g.x==null||g.y==null)return;
let x=g.x,y=g.y;
if(IOS){x=-x;y=-y}
const oa=(((screen.orientation?screen.orientation.angle:(window.orientation||0))%360)+360)%360;
let sx,sy;
if(oa===90){sx=-y;sy=x}else if(oa===270){sx=y;sy=-x}else if(oa===180){sx=-x;sy=-y}else{sx=x;sy=y}
if(Math.hypot(sx,sy)<1.5)return;
window.motionSeen=true;
const gz=g.z||0,a=Math.atan2(-sx,Math.hypot(sy,gz))*57.2958;
if(!haveAng){angF=a;haveAng=true}
angF=wrap(angF+wrap(a-angF)*.15);
if(needCal){ang0=angF;needCal=false}
if(!$('tilt').checked){tiltTarget=0;return}
let d=wrap(angF-ang0);
const dead=2,full=16;
let t=Math.abs(d)<=dead?0:Math.sign(d)*(Math.abs(d)-dead)/(full-dead);
t=clamp(t,-1,1);
if($('inv').checked)t=-t;
tiltTarget=t;
});
function recal(){needCal=true;tiltTarget=0;tiltSm=0}
addEventListener('orientationchange',recal);
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',recal);

function start(){
  ac();vol();
  if($('tilt').checked){motionPerm();setTimeout(()=>{if(running&&!window.motionSeen)toast('📵 ফোনের সেন্সর পাচ্ছি না। লিংকটা সরাসরি Chrome/Safari-তে খোলো আর Motion অনুমতি দাও।')},1800)}
  dist=hits=runT=over=spT=cnT=fines=supT=supCD=0;level=savedLvl;
  score=0;base=0;for(let i=1;i<level;i++)base+=T(i);
  cur=0;sigT=0;passed=false;steer=0;tilt=0;btn=gas=brake=0;recal();setTimeout(recal,900);tiltSm=0;TD=0;signal.position.z=-80;stopLine.position.z=-78;setSig('GREEN');
  traffic.splice(0).forEach(o=>scene.remove(o));
  coins.splice(0).forEach(o=>scene.remove(o));
  rws.splice(0).forEach(o=>scene.remove(o));
  fly.splice(0).forEach(o=>scene.remove(o));
  ppl.splice(0).forEach(o=>scene.remove(o.g));hailTold=0;
  for(let i=0;i<5;i++)spawnTraffic(28,-50-i*22-Math.random()*10);
  bursts.splice(0).forEach(q=>{if(player)player.remove(q.b)});
  runLoot={};lootUI();pax=0;skT=0;rT=0;puT=0;skSp=0;boostT=0;skStock=0;mgT=0;itT=0;
  for(const k in pw)pw[k]=0;
  dying=0;player.rotation.x=player.rotation.z=0;player.position.y=0;player.position.x=0;player.rotation.y=0;player.visible=true;$('hits').textContent=0;$('maxHits').textContent=maxHits();running=true;show(null);hudOn(true);applyMods();place();missionBanner(false);
  if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})
}
function end(m,w){running=false;sfx(w?'coin':'crash');if(w){savedLvl=1;sv('nr_lvl',1)}const tot=Math.floor(base+score);best=Math.max(best,tot);sv('nr_best',best);$('reason').textContent=m;$('finalScore').textContent=tot;$('finalLevel').textContent=level;hudOn(false);show('over');sync()}
function home(){running=false;hudOn(false);show('home');sync()}
$('play').onclick=start;$('garageBtn').onclick=()=>{garage();show('garage')};$('settingsBtn').onclick=()=>show('settings');
$('pause').onclick=()=>{if(running){running=false;btn=gas=brake=0;hudOn(false);show('paused')}};
$('resume').onclick=()=>{running=true;recal();show(null);hudOn(true)};$('restart').onclick=start;$('retry').onclick=start;$('overGarage').onclick=()=>{garage();show('garage')};$('pauseSettings').onclick=()=>show('settings');

$('dismissRotate').onclick=()=>$('rotateHint').style.display='none';

$('cam').onclick=()=>{camV=(camV+1)%3;toast(['চেজ ক্যামেরা','দূরের ক্যামেরা','বাম্পার ক্যামেরা'][camV])};
$('calibrate').onclick=()=>{recal();toast('ক্যালিব্রেট হয়েছে — এখনকার অবস্থানই সোজা')};$('night').onchange=()=>{setNight($('night').checked||!!($('village').checked?VIL:roadDef(roadId)).dk);motionPerm()};
$('village').onchange=()=>{sv('nr_village',$('village').checked);applyRoad();toast($('village').checked?'🌾 গ্রামীণ পরিবেশ চালু':'🛣 স্বাভাবিক রাস্তা')};
['music','mvol','sound','svol'].forEach(i=>$(i).oninput=vol);$('tilt').onchange=()=>{if($('tilt').checked){motionPerm();recal()}else tiltTarget=0};
document.querySelectorAll('[data-home]').forEach(b=>b.onclick=home);
addEventListener('pointerdown',()=>{ac()},{once:true});
document.querySelectorAll('[data-c]').forEach(b=>{const k=b.dataset.c;
const dn=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch{}b.classList.add('on');if(k==='left')btn=-1;if(k==='right')btn=1;if(k==='gas')gas=1;if(k==='brake')brake=1;if(k==='horn')honk();if(k==='super')superGo()};
const up=e=>{e.preventDefault();b.classList.remove('on');if((k==='left'&&btn<0)||(k==='right'&&btn>0))btn=0;if(k==='gas')gas=0;if(k==='brake')brake=0};
b.addEventListener('pointerdown',dn);['pointerup','pointercancel','lostpointercapture'].forEach(v=>b.addEventListener(v,up));b.addEventListener('contextmenu',e=>e.preventDefault())});
addEventListener('blur',()=>{btn=gas=brake=0;tilt=0});
addEventListener('keydown',e=>{if(e.key==='ArrowLeft')btn=-1;if(e.key==='ArrowRight')btn=1;if(e.key==='ArrowUp')gas=1;if(e.key==='ArrowDown')brake=1;if(e.key==='h')honk()});
addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')btn=0;if(e.key==='ArrowUp')gas=0;if(e.key==='ArrowDown')brake=0});

const views=[[0,4.4,11.5],[0,7.2,16],[0,1.3,5.6]],zones=[1.3,1.05,1.3,1.1];let last=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;
clouds.children.forEach(c=>{c.position.x+=dt*(1+c.position.y%3);if(c.position.x>300)c.position.x=-300});
sun.position.x=-28+70*Math.sin(now/9000);sun.position.y=88+8*Math.sin(now/5300);moon.position.x=28+40*Math.sin(now/11000);stars.material.opacity=.7+.3*Math.sin(now/350);
birds.children.forEach(b=>{b.position.x+=dt*b.userData.sp;if(b.position.x>290)b.position.x=-290;const f=Math.sin(now/120+b.userData.ph)*.7;b.position.y+=Math.sin(now/600+b.userData.ph)*.03;b.children.forEach(w=>w.rotation.z=w.userData.s)});
if(snow.visible){const a=snow.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=dt*5;a[i]+=Math.sin(now/700+i)*dt*.6;if(running)a[i+2]+=cur*dt;if(a[i+1]<0)a[i+1]=26;if(a[i+2]>10)a[i+2]-=80}snow.geometry.attributes.position.needsUpdate=true}

if(running&&dying>0)dyingStep(dt);else if(running){
const df=$('difficulty').value,mult=df==='hard'?1.35:df==='easy'?.75:1,cruise=(23+level*.34)*curDef.sp*mult*(1+.03*ml('engine')),tg=supT>0?312.5:brake?0:gas?93.75*(1+.03*ml('engine')):(boostT>0?1.7:1)*cruise;

for(const k in pw){if(pw[k]>0)pw[k]-=dt}
if(boostT>0)boostT-=dt;
if(pw.slow>0)cur=Math.min(cur,16);

if(pw.shield>0||pw.ghost>0||skT>0)
  invul=Math.max(invul,.3);

if(!player.getObjectByName('aura')&&player){aura.name='aura';player.add(aura)}
aura.visible=pw.shield>0||pw.ghost>0||skT>0;
aura.material.color.set(
  skT>0?0xffc23d:
  pw.ghost>0?0xffffff:0x3aa0ff
);

if(skT>0){
  skT-=dt;
  for(let i=traffic.length-1;i>=0;i--){
    const c=traffic[i];
    if(
      Math.abs(c.position.z-player.position.z)<5.5&&
      Math.abs(c.userData.lx-player.position.x)<2.6
    ){
      traffic.splice(i,1);
      const sg=c.position.x>player.position.x?1:-1;
      c.userData.f={
        t:0,
        vx:sg*(11+Math.random()*6),
        vy:10+Math.random()*5,
        h:0,
        off:c.userData.lx
      };
      fly.push(c);
      sfx('crash');
      shake=.4;
      score+=25;
    }
  }
}

for(let i=fly.length-1;i>=0;i--){
  const c=fly[i],u=c.userData.f;
  u.t+=dt;
  u.off+=u.vx*dt;
  u.h+=u.vy*dt;
  u.vy-=24*dt;
  if(u.h<0&&u.vy<0){
    u.h=0;
    u.vy*=-.25;
    u.vx*=.6;
  }
  c.position.z+=(cur-6)*dt;
  c.position.x=u.off+rel(c.position.z);
  c.position.y=ey(c.position.z)+u.h+.3;
  c.rotation.x+=dt*9;
  c.rotation.z+=u.vx*dt*.5;
  if(u.t>3||c.position.z>16){
    scene.remove(c);
    fly.splice(i,1);
  }
}

for(const c of traffic){
  const u=c.userData;
  if(pw.freeze>0){
    if(u.v0===undefined)u.v0=u.v;
    u.v=0;
    u.cv=0;
  }else if(u.v0!==undefined){
    u.v=u.v0;
    delete u.v0;
  }
}

if(pw.magnet>0){
  for(const c of coins){
    if(c.position.z>-45){
      c.userData.lx+=(player.position.x-c.userData.lx)*Math.min(1,dt*4);
    }
  }
}

rT+=dt;if(rT>7+Math.random()*6){rT=0;spawnRw('r')}
itT+=dt;if(itT>3+Math.random()*3){itT=0;spawnRw('i')}
puT+=dt;if(puT>20+Math.random()*14){puT=0;spawnRw('p')}
mgT+=dt;if(mgT>40+Math.random()*25){mgT=0;spawnRw('m')}
skSp+=dt;if(skSp>55+Math.random()*40){skSp=0;spawnRw('s')}
for(let i=bursts.length-1;i>=0;i--){const q=bursts[i];q.t+=dt;q.b.scale.setScalar(1+q.t*5);q.b.material.opacity=Math.max(0,.9-q.t*2.2);if(q.t>.45){player.remove(q.b);bursts.splice(i,1)}}

for(let i=rws.length-1;i>=0;i--){
  const g=rws[i],u=g.userData;
  g.position.z+=cur*dt;
  if(pw.magnet>0&&g.position.z>-45&&(u.t==='r'||u.t==='i')){
    u.lx+=(player.position.x-u.lx)*Math.min(1,dt*4);
  }
  g.position.x=u.lx+rel(g.position.z);
  g.position.y=1.8+ey(g.position.z)+Math.sin(now/300+i)*.25;
  u.h.rotation.y+=dt*2.5;u.ring.rotation.x+=dt*2;u.ring.scale.setScalar(1+.12*Math.sin(now/200));
  if(g.position.z>14){
    scene.remove(g);
    rws.splice(i,1);
    continue;
  }
  if(
    Math.abs(g.position.z-player.position.z)<2.6+cur*dt&&
    Math.abs(u.lx-player.position.x)<2.1
  ){
    scene.remove(g);
    rws.splice(i,1);
    grab(u);
  }
}

cur+=clamp(tg-cur,-(brake?40*(1+.15*ml('brakes')):cur>100?80:6)*dt,(supT>0?200:boostT>0?30:gas?(cur<cruise?18:14):8)*dt);runT+=dt;
if(supT>0){supT-=dt;if(supT<=0){supT=0;supCD=Math.max(20,60-6*ml('spoiler'))}}else if(supCD>0)supCD=Math.max(0,supCD-dt);
{const sb=$('superBtn');sb.textContent=supT>0?'🔥':supCD>0?Math.ceil(supCD):'⚡';sb.classList.toggle('cd',supCD>0&&supT<=0);sb.classList.toggle('act',supT>0);if(supT>0)shake=Math.max(shake,.14);$('big').style.color=supT>0?'#ff7a1a':''}
player.userData.tm.color.set(brake&&cur>1?0xff1020:0x7a0f18);

const kmh=cur*3.2,lim=Math.round(cruise*3.2*zones[Math.floor(runT/20)%4]/10)*10;
$('spd').textContent=$('big').textContent=Math.round(kmh);$('lim').textContent=$('law').checked?lim:'∞';$('arc').style.strokeDashoffset=264*(1-clamp(kmh/(cur>100?1000:300),0,1));
if($('law').checked&&kmh>lim*1.04&&supT<=0&&boostT<=0&&cur<=100){over+=dt;if(over>2.5){over=0;fines++;score=Math.max(0,score-100);sfx('fine');if(fines>=3)end('৩ বার গতিসীমা অমান্য করেছ! 🚓');else toast('⚠ গতিসীমা অমান্য! জরিমানা −১ ১০০ ('+fines+'/৩)')}}else over=Math.max(0,over-dt);

score+=dt*cur*.65*(pw.x2>0?2:1)*(1+.05*ml('paint'));dist+=cur*3.2/3600*dt;

if(running&&level<100&&score>=T(level)){base+=T(level);score=0;level++;savedLvl=level;sv('nr_lvl',level);sfx('level');missionBanner(true)}
if(running&&level>=100&&score>=T(100))end('🏆 অভিনন্দন! ১০০ লেভেল সম্পূর্ণ!',1);
const t1=T(level);
$('score').textContent=Math.floor(score);$('level').textContent=level;$('dist').textContent=dist.toFixed(1);
$('mtxt').textContent='🎯 '+Math.floor(score).toLocaleString()+' / '+t1.toLocaleString();$('mbar').style.width=clamp(score/t1,0,1)*100+'%';

const stM=1+.06*ml('wheels');
if(btn!==0){
  steer=lerp(steer,btn,1-Math.exp(-18*dt));
  player.position.x=clamp(player.position.x+steer*dt*11*stM,-4.3,4.3);
}else if(window.motionSeen&&$('tilt').checked){
  tiltSm=lerp(tiltSm,tiltTarget,1-Math.exp(-5*dt));
  const tx=tiltSm*4.3;
  player.position.x=lerp(player.position.x,tx,1-Math.exp(-5*stM*dt));
  steer=clamp((tx-player.position.x)*.8,-1,1);
}else{
  steer=lerp(steer,0,1-Math.exp(-10*dt));
}
player.rotation.y=lerp(player.rotation.y,-steer*.08+ang(4)*.7,1-Math.exp(-10*dt));
player.rotation.x=lerp(player.rotation.x,Math.atan(elevS(TD-4)),1-Math.exp(-8*dt));
$('tbar').firstElementChild.style.left=(50+steer*45)+'%';

scroll.forEach(m=>{m.position.z+=cur*dt;if(m.position.z>20)m.position.z-=440});scen.forEach(o=>{o.position.z+=cur*dt;if(o.position.z>20)o.position.z-=420});
TD+=cur*dt;
sigT+=dt;const cy=sigT%15;setSig(cy<7?'GREEN':cy<9?'YELLOW':'RED');
signal.position.z+=cur*dt;stopLine.position.z=signal.position.z+2;
if(signal.position.z>18){signal.position.z=-230;passed=false}
if(!passed&&stopLine.position.z>=1.7){if(sigState==='RED'&&$('law').checked)end('লাল সিগন্যাল অমান্য করেছ! 🚦');else passed=true}

invul=Math.max(0,invul-dt);if(camV!==2)player.visible=invul>0?Math.floor(invul*10)%2===0:true;else player.visible=false;

for(let i=traffic.length-1;i>=0&&running;i--){
  const c=traffic[i];trafficAI(c,dt);c.position.z+=(cur-c.userData.cv)*dt;
  if(c.position.z>16||c.position.z<-230){scene.remove(c);traffic.splice(i,1);continue}
  if(pw.ghost<=0&&!invul&&Math.abs(c.position.z-player.position.z)<4+cur*dt&&Math.abs(c.userData.lx-player.position.x)<1.7){
    if(c.userData.em){die(c.userData.em==='p'?'পুলিশের গাড়িতে ধাক্কা লেগেছে! 🚔':'অ্যাম্বুলেন্সে ধাক্কা লেগেছে! 🚑');continue}
    if(pw.shield>0){pw.shield=0;scene.remove(c);traffic.splice(i,1);shake=.4;sfx('crash');toast('🛡️ বর্ম ভেঙে গেছে!');continue}
    scene.remove(c);traffic.splice(i,1);hits++;$('hits').textContent=hits;sfx('crash');shake=.5;invul=1.5+.4*ml('frame');cur=.4;
    if(supT>0||cur>60)die('সুপার স্পিডে ধাক্কা লেগেছে! 💥');else if(hits>=maxHits())die(maxHits()+' বার ধাক্কা লেগেছে! 💥')
  }
}

for(let i=coins.length-1;i>=0;i--){const c=coins[i];c.position.z+=cur*dt;c.rotation.y+=dt*3;if(c.position.z>14){scene.remove(c);coins.splice(i,1);continue}
if(Math.abs(c.position.z-player.position.z)<2.4+cur*dt&&Math.abs(c.userData.lx-player.position.x)<1.9){scene.remove(c);coins.splice(i,1);coinsSaved+=5*(pw.x2>0?2:1);lootAdd('💎',5*(pw.x2>0?2:1));sv('nr_coins',coinsSaved);sync();sfx('coin')}}

if($('ppl').checked){
  pT+=dt;
  if(pT>3.5&&ppl.length<8){pT=0;spawnP(!pax&&!ppl.some(p=>p.hail)&&Math.random()<.4,Math.random()<.5?-1:1)}
}else if(ppl.length||pax){ppl.forEach(p=>scene.remove(p.g));ppl.length=0;pax=0;pas.visible=false}
for(let i=ppl.length-1;i>=0;i--){
  const p=ppl[i],g=p.g,z=g.position.z,u=g.userData;
  g.position.z+=(cur+p.w)*dt;
  g.position.x=p.lx+rel(z);g.position.y=ey(z);
  g.rotation.y=-Math.atan(curveS(TD-z));
  u.arm.rotation.z=p.hail?Math.PI*.9+.35*Math.sin(now/110):.3*Math.sin(now/200);
  u.legs[0].rotation.x=p.hail?0:Math.sin(now/180)*.6;u.legs[1].rotation.x=p.hail?0:-Math.sin(now/180)*.6;
  const mk=g.getObjectByName('mk');if(mk)mk.position.y=4.6+Math.sin(now/200)*.25;
  if(p.hail){
    if(z>-135&&!hailTold){hailTold=1;pop('🙋 যাত্রী হাত তুলেছে! ব্রেক চেপে থামো');sfx('hail')}
    if(!pax&&cur<2.5&&z>-14&&z<14&&Math.abs(p.lx-player.position.x)<7.5){
      scene.remove(g);ppl.splice(i,1);
      pax={st:'board',t:0};pas.visible=true;addPasToPlayer();
      pop('🧍 যাত্রী উঠেছে');sfx('board');hailTold=0;continue;
    }
  }
  if(z>16){scene.remove(g);ppl.splice(i,1);if(p.hail){hailTold=0;pop('যাত্রী ছুটে গেছে 😕')}}
}

if(pax){
  if(pax.st==='board'){
    pax.t+=dt;
    if(pax.t>1.5){pax.st='ride';pax.tg=TD+500+Math.random()*400;say('স্টার্ট');pop('🧍 যাত্রী: "স্টার্ট!"')}
  }else if(pax.st==='ride'&&TD>=pax.tg){
    pax.st='stop';pax.lim=TD+350;say('স্টপ স্টপ');pop('🧍 যাত্রী: "স্টপ স্টপ!" গাড়ি থামাও');sfx('hail');
  }else if(pax.st==='stop'){
    if(cur<2){
      const f=25*(pw.x2>0?2:1);
      gain(f);lootAdd('💎',f);pas.visible=false;say('ধন্যবাদ');pop('🙏 যাত্রী: "ধন্যবাদ!" +'+f+' 💎');sfx('dropoff');pax=0;
    }else if(TD>pax.lim){
      pas.visible=false;pop('😠 যাত্রী রেগে নেমে গেছে');sfx('fail');pax=0;
    }
  }
}

let h='';
if(boostT>0)h+=`<div class="hb">⚡ গতি ${Math.ceil(boostT)}s</div>`;
for(const k in pw){const d=PU.find(x=>x[2]===k);if(d&&pw[k]>0){h+=`<div class="hb">${d[0]} ${d[1]} ${Math.ceil(pw[k])}s</div>`}}
if(skT>0){h+=`<div class="hb">🛹 ${Math.ceil(skT)}s</div>`}
if(h!==chipS){chipS=h;chips.innerHTML=h}

spT+=dt;cnT+=dt;if(spT>Math.max(.85,1.7-level*.008)&&cur>3){spT=0;spawnTraffic(cruise);if(Math.random()<.2)spawnTraffic(cruise)}if(cnT>1.1){cnT=0;spawnCoin()}
place();
engine(cur)}
else engine(0);

emLights(now);skUI();sirenUpdate(now);fx.update(dt,running&&supT>0,cur);$('boost').style.opacity=running&&supT>0?1:0;
const v=views[camV];shake=Math.max(0,shake-dt);const sx=shake?(Math.random()-.5)*shake*.6:0;
camera.fov=lerp(camera.fov,64+clamp((cur-20)/70,0,1)*14+clamp((cur-93)/220,0,1)*22,.06);camera.updateProjectionMatrix();
camera.position.set(lerp(camera.position.x,player.position.x*.6+v[0],.1)+sx,lerp(camera.position.y,v[1],.08),lerp(camera.position.z,v[2],.08));
camera.lookAt(player.position.x*.5+rel(-25)*.5,1.1+ey(-12)*.6,camV===2?-14:-10);renderer.render(scene,camera)}

$('village').checked=rd('nr_village',false);
camera.position.set(0,4.4,11.5);setSig('GREEN');applyRoad();place();garage();sync();requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
document.getElementById("ghostKingdom").addEventListener("change", function () {
  if (this.checked) {
    window.location.href = "Ghost-Kingdom.html";
  }
});
