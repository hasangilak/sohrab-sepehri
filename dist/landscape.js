import { PaintBrush } from './brush.js';

// The garden floor curves continuously into the distant valley. Both paintings
// blend on this single surface; trees and architecture stand on its ground.
const vertex=`
precision highp float;
attribute vec2 aPosition;
uniform vec3 uPosition,uCamera;
uniform vec2 uSize,uLook,uViewport;
uniform float uTime,uMotion,uTilt,uYaw,uWind,uKind;
varying vec2 vUv;
varying float vDepth;
varying vec3 vWorld;
void main(){
  vUv=aPosition*.5+.5;
  vec3 p=vec3(aPosition*uSize*.5,0.);
  p.x+=sin(uTime*.55+vUv.y*5.+uPosition.x)*pow(vUv.y,2.)*uWind*uMotion;
  p=vec3(p.x,p.y*cos(uTilt)-p.z*sin(uTilt),p.y*sin(uTilt)+p.z*cos(uTilt));
  p=vec3(p.x*cos(uYaw)+p.z*sin(uYaw),p.y,-p.x*sin(uYaw)+p.z*cos(uYaw));
  p+=uPosition;
  if(uKind>1.5&&uKind<2.5){
    // A quarter-circle joins the floor to the ridge with a continuous tangent.
    float t=vUv.y;
    p.x=20.+(vUv.x-.5)*60.;
    if(t<.55){p.y=0.;p.z=8.-t/.55*14.1;}
    else if(t<.65){
      float a=(t-.55)/.10*1.5707963;
      p.y=2.2*(1.-cos(a));p.z=-6.1-2.2*sin(a);
    }else{p.y=2.2+(t-.65)/.35*12.6;p.z=-8.3;}
    p.y+=.10*sin(p.x*.13)*cos(p.z*.22)*(1.-smoothstep(.50,.65,t));
  }else if(uKind>2.5&&uKind<3.5)p.y+=.10*sin(p.x*.13)*cos(p.z*.22);
  vWorld=p;
  p-=uCamera;
  p=vec3(p.x*cos(uLook.x)-p.z*sin(uLook.x),p.y,p.x*sin(uLook.x)+p.z*cos(uLook.x));
  p=vec3(p.x,p.y*cos(uLook.y)-p.z*sin(uLook.y),p.y*sin(uLook.y)+p.z*cos(uLook.y));
  float near=.1,far=150.,tangent=.3443276;
  gl_Position=vec4(p.x/(tangent*uViewport.x/uViewport.y),p.y/tangent,-(far+near)/(far-near)*p.z-2.*far*near/(far-near),-p.z);
  vDepth=-p.z;
}`;

const fragment=`
precision highp float;
uniform sampler2D uTexture,uBrush,uHorizon;
uniform float uTime,uOpacity,uReveal,uNight,uMotion,uKind,uDetail;
uniform vec2 uViewport;
varying vec2 vUv;
varying float vDepth;
varying vec3 vWorld;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
void main(){
  if(uKind>2.5&&uKind<3.5){
    float a=exp(-dot((vUv-.5)*vec2(1.,1.2),(vUv-.5)*vec2(1.,1.2))*18.)*.26*uOpacity;
    gl_FragColor=vec4(.16,.23,.17,a);return;
  }
  vec2 uv=vUv,screen=gl_FragCoord.xy/uViewport;
  vec3 flow=texture2D(uBrush,screen).rgb;
  float stroke=flow.b*uMotion,n=noise(vUv*40.);
  uv-=vec2(flow.r-.5,.5-flow.g)*stroke*.009;
  uv+=vec2(sin(n*24.+uTime*.8),cos(n*21.+uTime*.7))*stroke*.0005;
  vec4 ink=texture2D(uTexture,uv);
  if(uKind>1.5&&uKind<2.5){
    vec2 groundUv=vec2((vWorld.x-18.)/48.+.5,(8.-vWorld.z)/16.);
    // Stop short of the old cutout's pale perimeter. The meadow takes over
    // before that outline, across a broad, irregular band of brush marks.
    groundUv.y=min(groundUv.y,.86);
    vec2 drift=uv-vUv;
    groundUv+=drift;
    float water=smoothstep(.36,.55,groundUv.x)*(1.-smoothstep(.44,.55,vUv.y));
    groundUv.x+=sin(groundUv.y*80.-uTime*.6)*.0006*water*uMotion;
    groundUv.y+=cos(groundUv.x*74.+uTime*.5)*.0008*water*uMotion;
    // Map paint along the bend rather than projecting it vertically, which
    // would stretch the same row of pixels into a curtain at the bank.
    float fieldHeight=vUv.y<.55?(-6.1-vWorld.z)*.64:
      (vUv.y<.65?(vUv.y-.55)/.10*2.2:vWorld.y);
    vec2 horizonUv=vec2((vWorld.x-20.)/60.+.5,(fieldHeight-4.8)/20.+.5)+drift;
    vec4 ground=texture2D(uTexture,groundUv),ridge=texture2D(uHorizon,horizonUv);
    ground.a*=step(0.,groundUv.x)*step(groundUv.x,1.);
    float grain=noise(vWorld.xz*2.3)*.010+noise(vWorld.xz*.8)*.014-.012;
    float join=smoothstep(.39,.55,vUv.y+grain*.5);
    // The near meadow shares the bank's richer greens. Atmospheric fading
    // increases continuously with height, rather than switching per image.
    ridge.rgb*=mix(vec3(.91,.95,.90),vec3(1.),smoothstep(0.,6.,fieldHeight));
    float alpha=mix(ground.a,ridge.a,join);
    ink=vec4((ground.rgb*ground.a*(1.-join)+ridge.rgb*ridge.a*join)/max(alpha,.0001),alpha);
  }
  float edge=smoothstep(0.,.025,vUv.x)*smoothstep(0.,.025,1.-vUv.x)*smoothstep(0.,.018,vUv.y);
  ink.a*=edge*smoothstep(n*.2-.08,n*.2+.15,uReveal);
  ink.a*=1.-stroke*.025;
  // Atmospheric perspective comes from world distance, never from a panel edge.
  vec3 paper=mix(vec3(.961,.953,.922),vec3(.125,.173,.18),uNight);
  float fog=smoothstep(24.,70.,vDepth)*.3;
  if(uKind>1.5&&uKind<2.5)fog=max(fog,smoothstep(1.,10.,vWorld.y)*.27);
  ink.rgb=mix(ink.rgb,paper,fog);
  ink.rgb=mix(ink.rgb,ink.rgb*vec3(.67,.77,.82)+vec3(.018,.025,.03),uNight*.6);
  if(uDetail>1.5&&uDetail<2.5){
    vec2 delta=(vUv-vec2(.34,.63))*vec2(1.3,1.);
    float lamp=exp(-dot(delta,delta)*300.);
    ink.rgb+=vec3(.21,.11,.025)*lamp*(.94+.06*sin(uTime*3.8))*uNight;
  }
  ink.rgb*=.99+stroke*.006;
  ink.a*=uOpacity;
  if(ink.a<.018)discard;
  gl_FragColor=ink;
}`;

const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);
const smooth=(a,b,v)=>ease(clamp((v-a)/(b-a)));
const groundHeight=(x,z)=>.10*Math.sin(x*.13)*Math.cos(z*.22);
// Hold the reading scale. Only the final passage opens out by five percent.
function journeyZoom(p){return 20.4+smooth(10,12,p);}
function settle(current,target,velocity,dt,duration,maxSpeed){
  const omega=2/duration,change=clamp(current-target,-maxSpeed*duration,maxSpeed*duration);
  const goal=current-change,decay=Math.exp(-omega*dt),step=(velocity+omega*change)*dt;
  return{value:goal+(change+step)*decay,velocity:(velocity-omega*step)*decay};
}
function routePoint(route,p,key){
  const last=route.length-1,i=Math.min(last-1,Math.floor(clamp(p,0,last))),t=clamp(p-i);
  const slope=j=>{
    if(j===0||j===last)return 0;
    const a=route[j][key]-route[j-1][key],b=route[j+1][key]-route[j][key];
    return a*b<=0?0:2*a*b/(a+b);
  };
  return (2*t*t*t-3*t*t+1)*route[i][key]+(t*t*t-2*t*t+t)*slope(i)
    +(-2*t*t*t+3*t*t)*route[i+1][key]+(t*t*t-t*t)*slope(i+1);
}
function toLocal(v,object){
  const cy=Math.cos(object.yaw),sy=Math.sin(object.yaw),ct=Math.cos(object.tilt),st=Math.sin(object.tilt);
  const x=v.x*cy-v.z*sy,z=v.x*sy+v.z*cy;
  return{x,y:v.y*ct+z*st,z:-v.y*st+z*ct};
}

export class PaintedLandscape {
  constructor(canvas,chapters){
    this.canvas=canvas;this.chapters=chapters;
    this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
    this.ready=false;this.active=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.motion=!this.reduced;this.open=false;this.openAmount=0;
    this.pointer={x:0,y:0};this.mouse={x:0,y:0};this.hit=null;
    this.camera={x:-3,y:9,z:18};this.look={yaw:0,pitch:.26};
    this.distance=20.4;this.zoomVelocity=0;this.journey=0;this.night=0;this.time=0;this.lastTime=0;
    this.objects=[];this.bounds=[];
    // The path travels along the bank AND into it, looking up into tall
    // branches and down onto horizontal water before rising to the horizon.
    this.route=[
      {x:0,y:4.4,z:1,pitch:.28,yaw:-.025},
      {x:.6,y:6.0,z:.5,pitch:.25,yaw:0},
      {x:4.5,y:3.2,z:-1,pitch:.27,yaw:.035},
      {x:9,y:2.5,z:-3,pitch:.30,yaw:.045},
      {x:13.5,y:1.1,z:0,pitch:.37,yaw:0},
      {x:18.5,y:1.8,z:3,pitch:.35,yaw:-.045},
      {x:22.8,y:1.4,z:1.3,pitch:.38,yaw:-.035},
      {x:26.7,y:.15,z:.5,pitch:.46,yaw:0},
      {x:30,y:3.5,z:-4,pitch:.31,yaw:.035},
      {x:32,y:1.1,z:-1.4,pitch:.40,yaw:.025},
      {x:36.1,y:.1,z:-1,pitch:.46,yaw:0},
      {x:36.5,y:.8,z:-3,pitch:.39,yaw:-.025},
      {x:32,y:5,z:-5,pitch:.28,yaw:-.035}
    ];
    this.anchor={...this.route[0]};
    this.rig={...this.anchor};this.rigVelocity={x:0,y:0,z:0,pitch:0,yaw:0};
    this.explore={x:18,y:2,z:0,distance:43,pitch:.44,yaw:0};this.drag=null;
    if(!this.gl)return;
    try{
      this.setup();this.brush=new PaintBrush(this.gl);this.resize();this.load();
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.active=false;document.body.classList.remove('webgl-ready');});
      canvas.addEventListener('webglcontextrestored',()=>location.reload());
      addEventListener('resize',()=>this.resize(),{passive:true});
      document.fonts.ready.then(()=>this.measure());
      requestAnimationFrame(t=>this.frame(t));
    }catch(error){console.warn('Landscape renderer unavailable; using static painting.',error.message);}
  }
  setup(){
    const gl=this.gl;
    const compile=(type,source)=>{
      const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    this.program=p;gl.useProgram(p);this.u={};
    for(const name of ['Position','Camera','Size','Look','Viewport','Time','Motion','Tilt','Yaw','Wind','Kind','Texture','Horizon','Brush','Opacity','Reveal','Night','Detail'])this.u[name]=gl.getUniformLocation(p,'u'+name);
    const vertices=[],indices=[],columns=128,rows=120;
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++)vertices.push(x/columns*2-1,y/rows*2-1);
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+columns+1;indices.push(a,a+1,b,a+1,b+1,b);}
    this.count=indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    const a=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
  }
  async load(){
    const names=['ground-river','orchard-rise','porch-garden','heron-bank','willow-rise','valley-horizon'];
    this.textures={};
    try{
      await Promise.all(names.map(async name=>{
        const image=new Image();image.src=`assets/paintings/${name}.webp`;await image.decode();
        const gl=this.gl,texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        const sample=document.createElement('canvas');sample.width=sample.height=128;
        const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,128,128);
        this.textures[name]={texture,ratio:image.width/image.height,alpha:ctx.getImageData(0,0,128,128).data};
      }));
    }catch(error){console.warn('Landscape artwork could not load.',error.message);return;}
    const add=(asset,x,y,z,h,options={})=>{
      const o={asset,x,y,z,h,w:h*this.textures[asset].ratio,tilt:0,yaw:0,kind:1,detail:0,wind:0,opacity:1,...options};
      this.objects.push(o);return o;
    };
    // One bent environment, with ground and ridge textures blended on it.
    add('ground-river',18,0,0,16,{w:48,tilt:-Math.PI/2,kind:2});
    const rooted=(asset,x,z,h,options={})=>{
      const base=groundHeight(x,z)-h*.025;
      const o=add(asset,x,base+h*.5,z,h,options);
      add('ground-river',x+.25,.025,z+.12,h*.20,{w:o.w*.93,tilt:-Math.PI/2,kind:3,opacity:.7});
      return o;
    };
    rooted('orchard-rise',0,1,10.5,{wind:.025,detail:1});
    this.porch=rooted('porch-garden',9,-3,5.7,{yaw:-.025,detail:2});
    rooted('heron-bank',18.5,4.1,3.8,{wind:.012,detail:3});
    rooted('willow-rise',30,-5.3,10.6,{wind:.03,detail:4});
    this.ready=true;this.entered=performance.now();document.body.classList.add('webgl-ready');
  }
  measure(){this.bounds=this.chapters.map(el=>({top:el.offsetTop,height:el.offsetHeight}));}
  resize(){
    if(!this.gl)return;
    this.width=innerWidth;this.height=innerHeight;this.mobile=innerWidth<650;
    const dpr=Math.min(devicePixelRatio,this.mobile?1.5:1.6);
    this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);
    this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.measure();
  }
  setMotion(enabled){this.motion=enabled;}
  setNight(amount){this.night=amount;}
  setPointer(x,y,paint=true){
    this.pointer={x:x/innerWidth*2-1,y:1-y/innerHeight*2};
    this.hit=this.motion&&paint?this.hitTest(x,y):null;
    if(this.motion)this.brush?.move(x,y,this.hit?{kind:this.hit.object.kind===2&&this.hit.u>.36&&this.hit.v<.5?2:1}:null,innerWidth,innerHeight);
    this.canvas.dataset.hover=this.hit?.object.asset||'';
  }
  clearPointer(){this.pointer={x:0,y:0};this.hit=null;if(this.brush)this.brush.last=null;this.canvas.dataset.hover='';}
  hitEnvironment(direction,object){
    const eye=this.camera,candidates=[];
    const point=t=>({x:eye.x+direction.x*t,y:eye.y+direction.y*t,z:eye.z+direction.z*t});
    if(Math.abs(direction.y)>.00001){
      let t=-eye.y/direction.y;
      for(let i=0;i<3;i++){const p=point(t);t=(groundHeight(p.x,p.z)-eye.y)/direction.y;}
      const p=point(t);
      if(t>0&&p.z>=-6.1&&p.z<=8)candidates.push({p,t,v:(8-p.z)/14.1*.55});
    }
    // Intersection with the rounded bank, followed by the vertical ridge.
    const oy=eye.y-2.2,oz=eye.z+6.1;
    const a=direction.y**2+direction.z**2,b=2*(oy*direction.y+oz*direction.z),c=oy*oy+oz*oz-2.2**2;
    const discriminant=b*b-4*a*c;
    if(a>.00001&&discriminant>=0)for(const sign of [-1,1]){
      const t=(-b+sign*Math.sqrt(discriminant))/(2*a),p=point(t);
      if(t>0&&p.y>=0&&p.y<=2.2&&p.z<=-6.1&&p.z>=-8.3){
        const angle=Math.atan2(-p.z-6.1,2.2-p.y);
        candidates.push({p,t,v:.55+angle/(Math.PI/2)*.10});
      }
    }
    if(Math.abs(direction.z)>.00001){
      const t=(-8.3-eye.z)/direction.z,p=point(t);
      if(t>0&&p.y>=2.2&&p.y<=14.8)candidates.push({p,t,v:.65+(p.y-2.2)/12.6*.35});
    }
    const alphaAt=(asset,u,v)=>{
      if(u<0||u>1||v<0||v>1)return 0;
      return this.textures[asset].alpha[(Math.min(127,Math.floor((1-v)*128))*128+Math.min(127,Math.floor(u*128)))*4+3];
    };
    for(const {p,t,v} of candidates.sort((a,b)=>a.t-b.t)){
      const u=.5+(p.x-20)/60;
      if(u<0||u>1)continue;
      const floor=alphaAt('ground-river',(p.x-18)/48+.5,Math.min(.86,(8-p.z)/16));
      const field=v<.55?(-6.1-p.z)*.64:(v<.65?(v-.55)/.10*2.2:p.y);
      const ridge=alphaAt('valley-horizon',(p.x-20)/60+.5,(field-4.8)/20+.5);
      if(lerp(floor,ridge,smooth(.39,.55,v))>70)return{object,u,v,distance:t};
    }
    return null;
  }
  hitTest(x,y){
    const cx=Math.cos(this.look.yaw),sx=Math.sin(this.look.yaw),cp=Math.cos(this.look.pitch),sp=Math.sin(this.look.pitch);
    const dx=(x/innerWidth*2-1)*.3443276*innerWidth/innerHeight,dy=(1-y/innerHeight*2)*.3443276;
    const ry=dy*cp-sp,rz=-dy*sp-cp;
    const direction={x:dx*cx+rz*sx,y:ry,z:-dx*sx+rz*cx};
    let nearest=null;
    for(const object of this.objects){
      if(object.kind===3)continue;
      if(object.kind===2){
        const hit=this.hitEnvironment(direction,object);
        if(hit&&(!nearest||hit.distance<nearest.distance))nearest=hit;
        continue;
      }
      const origin=toLocal({x:this.camera.x-object.x,y:this.camera.y-object.y,z:this.camera.z-object.z},object),ray=toLocal(direction,object);
      if(Math.abs(ray.z)<.00001)continue;
      const t=-origin.z/ray.z;if(t<=0||nearest&&t>=nearest.distance)continue;
      const u=.5+(origin.x+t*ray.x)/object.w,v=.5+(origin.y+t*ray.y)/object.h;
      if(u<0||u>1||v<0||v>1)continue;
      const alpha=this.textures[object.asset].alpha;
      if(alpha[(Math.min(127,Math.floor((1-v)*128))*128+Math.min(127,Math.floor(u*128)))*4+3]>70)nearest={object,u,v,distance:t};
    }
    return nearest;
  }
  project(x,y,z){
    const dx=x-this.camera.x,dy=y-this.camera.y,dz=z-this.camera.z;
    const rx=dx*Math.cos(this.look.yaw)-dz*Math.sin(this.look.yaw),rz=dx*Math.sin(this.look.yaw)+dz*Math.cos(this.look.yaw);
    const ry=dy*Math.cos(this.look.pitch)-rz*Math.sin(this.look.pitch),depth=-(dy*Math.sin(this.look.pitch)+rz*Math.cos(this.look.pitch));
    const scale=innerHeight/(depth*.6886552);
    return{x:innerWidth*.5+rx*scale,y:innerHeight*.5-ry*scale,scale,depth};
  }
  drawEffects(ctx){
    this.brush?.draw(ctx);if(!this.ready||!this.motion)return;
    const o=this.porch,p=this.project(o.x-o.w*.19,o.y-o.h*.15,o.z+.02);
    if(p.depth<2||p.x<-100||p.x>innerWidth+100)return;
    ctx.save();ctx.strokeStyle=this.night>.5?'#e3d7be':'#a5b0a0';ctx.lineWidth=.7;
    for(let i=0;i<3;i++){
      const age=(this.time*.18+i*.33)%1;ctx.globalAlpha=Math.sin(age*Math.PI)*.17;ctx.beginPath();
      for(let j=0;j<12;j++){
        const x=p.x+Math.sin(j*.3+this.time*.5+i)*p.scale*.025,y=p.y-(age*.32+j*.016)*p.scale;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }ctx.stroke();
    }ctx.restore();
  }
  setOpen(value){
    this.open=value;
    if(value){
      this.explore=this.mobile?{...this.anchor,distance:this.distance+4}:{x:18,y:2,z:0,distance:43,pitch:.44,yaw:0};
      this.exploreHome={...this.explore};
    }this.drag=null;
  }
  zoom(delta){if(this.open)this.explore.distance=clamp(this.explore.distance+delta,10,55);}
  beginDrag(x,y){if(this.open)this.drag={x,y};}
  dragTo(x,y){
    if(!this.drag)return;
    const scale=this.explore.distance*.6886552/innerHeight;
    this.explore.x=clamp(this.explore.x-(x-this.drag.x)*scale,-3,40);
    this.explore.z=clamp(this.explore.z-(y-this.drag.y)*scale/Math.max(.4,Math.sin(this.explore.pitch)),-9,7);
    this.drag={x,y};
  }
  endDrag(){this.drag=null;}
  resetView(){this.explore={...this.exploreHome};}
  restoreScrollPosition(){
    this.journey=this.progress();
    for(const key of ['x','y','z','pitch','yaw']){this.rig[key]=routePoint(this.route,this.journey,key);this.rigVelocity[key]=0;}
    this.anchor={...this.rig};this.distance=journeyZoom(this.journey)+(this.mobile?5.5:0);this.zoomVelocity=0;
  }
  progress(){
    for(let i=this.bounds.length-1;i>=0;i--){const b=this.bounds[i];if(scrollY>=b.top)return Math.min(12,i+clamp((scrollY-b.top)/b.height));}
    return 0;
  }
  frame(now){
    requestAnimationFrame(t=>this.frame(t));if(!this.ready||!this.active||document.hidden)return;
    const dt=Math.min((now-(this.lastTime||now))/1000,.06);this.lastTime=now;
    if(this.motion)this.time+=dt;this.brush.update(dt,this.motion);
    const damp=rate=>this.reduced?1:1-Math.exp(-dt*rate);
    this.journey=lerp(this.journey,this.progress(),damp(1.35));
    const a={};for(const key of ['x','y','z','pitch','yaw'])a[key]=routePoint(this.route,this.journey,key);
    this.anchor=a;
    this.openAmount=lerp(this.openAmount,this.open?1:0,damp(1.5));const o=this.openAmount;
    const focal={};for(const key of ['x','y','z','pitch','yaw'])focal[key]=lerp(a[key],this.explore[key],o);
    const targetDistance=lerp(journeyZoom(this.journey)+(this.mobile?5.5:0),this.explore.distance,o);
    if(this.reduced){this.distance=targetDistance;this.zoomVelocity=0;}
    else{
      const overviewTravel=this.open||o>.001||Math.abs(this.distance-targetDistance)>2;
      const zoom=settle(this.distance,targetDistance,this.zoomVelocity,dt,2.8,overviewTravel?3.4:.65);
      this.distance=zoom.value;this.zoomVelocity=zoom.velocity;
    }
    // Ease a single camera rig, then derive its position. Smoothing the eye
    // and the look angle separately made turns feel like an accidental zoom.
    for(const key of ['x','y','z','pitch','yaw']){
      if(this.reduced){this.rig[key]=focal[key];this.rigVelocity[key]=0;continue;}
      const speed={x:3.2,y:1.8,z:1.6,pitch:.065,yaw:.025}[key];
      const eased=settle(this.rig[key],focal[key],this.rigVelocity[key],dt,1.9,speed);
      this.rig[key]=eased.value;this.rigVelocity[key]=eased.velocity;
    }
    this.look.pitch=this.rig.pitch;this.look.yaw=this.rig.yaw;
    this.mouse.x=lerp(this.mouse.x,this.motion?this.pointer.x:0,damp(3));this.mouse.y=lerp(this.mouse.y,this.motion?this.pointer.y:0,damp(3));
    const cy=Math.cos(this.look.yaw),sy=Math.sin(this.look.yaw),cp=Math.cos(this.look.pitch),sp=Math.sin(this.look.pitch);
    const horizontal=lerp(this.mobile?.035:.17,0,o)*.6886552*(this.width/this.height)*this.distance;
    const vertical=lerp(this.mobile?.27:.045,this.mobile?.26:.12,o)*.6886552*this.distance;
    const target={
      x:this.rig.x+sy*cp*this.distance-horizontal*cy-vertical*sy*sp+this.mouse.x*.07,
      y:this.rig.y+sp*this.distance+vertical*cp+this.mouse.y*.025,
      z:this.rig.z+cy*cp*this.distance+horizontal*sy-vertical*cy*sp
    };
    this.camera=target;
    const gl=this.gl,u=this.u;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);
    gl.uniform3f(u.Camera,this.camera.x,this.camera.y,this.camera.z);gl.uniform2f(u.Look,this.look.yaw,this.look.pitch);
    gl.uniform2f(u.Viewport,this.canvas.width,this.canvas.height);gl.uniform1f(u.Time,this.time);gl.uniform1f(u.Night,this.night);
    gl.uniform1f(u.Motion,this.motion?1:0);gl.uniform1f(u.Reveal,this.reduced?1:clamp((now-this.entered)/2300));
    gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.textures['valley-horizon'].texture);gl.uniform1i(u.Horizon,2);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,this.brush.texture);gl.uniform1i(u.Brush,1);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(u.Texture,0);
    // Render continuous ground first. Depth testing joins it to the roots.
    const surfaces=this.objects.filter(o=>o.kind===2||o.kind===3),uprights=this.objects.filter(o=>o.kind!==2&&o.kind!==3).sort((a,b)=>a.z-b.z);
    for(const object of [...surfaces,...uprights]){
      gl.depthMask(object.kind!==3);
      gl.bindTexture(gl.TEXTURE_2D,this.textures[object.asset].texture);
      gl.uniform3f(u.Position,object.x,object.y,object.z);gl.uniform2f(u.Size,object.w,object.h);
      gl.uniform1f(u.Tilt,object.tilt);gl.uniform1f(u.Yaw,object.yaw);gl.uniform1f(u.Wind,object.wind);
      gl.uniform1f(u.Kind,object.kind);gl.uniform1f(u.Detail,object.detail);gl.uniform1f(u.Opacity,object.opacity);
      gl.drawElements(gl.TRIANGLES,this.count,gl.UNSIGNED_SHORT,0);
    }
    gl.depthMask(true);
    this.canvas.dataset.camera=`${this.camera.x.toFixed(2)},${this.camera.y.toFixed(2)},${this.camera.z.toFixed(2)}`;
    this.canvas.dataset.view=`pitch:${this.look.pitch.toFixed(3)},distance:${this.distance.toFixed(2)}`;
    this.canvas.dataset.night=this.night.toFixed(3);
    this.canvas.dataset.rendered='true';this.canvas.dataset.brushParticles=String(this.brush.particles.length);
  }
}
