// A small velocity field retains the direction of a brush stroke as it fades.
// It disturbs only the painted fragments; the paper and poem stay untouched.
export class PaintBrush {
  constructor(gl) {
    this.gl=gl;
    this.canvas=document.createElement('canvas');
    this.canvas.width=this.canvas.height=256;
    this.ctx=this.canvas.getContext('2d');
    this.ctx.fillStyle='rgb(128,128,0)';this.ctx.fillRect(0,0,256,256);
    this.texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,this.texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.canvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    this.points=[];this.particles=[];this.last=null;this.age=10;this.particleCooldown=0;
  }
  move(x,y,hit,width,height) {
    const old=this.last||{x,y};this.last={x,y};
    const dx=x-old.x,dy=y-old.y,speed=Math.hypot(dx,dy);
    if(!hit||speed<.4)return;
    const count=Math.min(12,Math.max(1,Math.ceil(speed/9)));
    for(let i=1;i<=count;i++)this.points.push({x:(old.x+dx*i/count)/width,y:(old.y+dy*i/count)/height,dx:Math.max(-1,Math.min(1,dx/35)),dy:Math.max(-1,Math.min(1,dy/35)),strength:Math.min(1,.2+speed/45)});
    if(this.points.length>60)this.points.splice(0,this.points.length-60);
    this.age=0;
    if(this.particles.length<12&&speed>4&&this.particleCooldown<=0) {
      this.particleCooldown=.14;
      const water=hit.kind===2;
      this.particles.push({x,y,vx:dx*.08+(Math.random()-.5)*5,vy:dy*.04-5-Math.random()*6,life:0,duration:water?.95:1.5,size:water?3:1.5+Math.random()*1.5,angle:Math.random()*6.28,water,color:['#aab694','#7d916c','#d7c5a0','#e1d7bb'][Math.floor(Math.random()*4)]});
    }
  }
  update(dt,motion) {
    const ctx=this.ctx,gl=this.gl;
    this.age+=dt;
    this.particleCooldown=Math.max(0,this.particleCooldown-dt);
    if(!motion){this.points.length=0;this.particles.length=0;}
    if(this.age<5||!motion){
      ctx.fillStyle=`rgba(128,128,0,${motion?1-Math.exp(-dt*3.4):1})`;
      ctx.fillRect(0,0,256,256);
      for(const point of this.points){
        const radius=9+point.strength*5,x=point.x*256,y=point.y*256;
        const r=Math.round(128+point.dx*120),g=Math.round(128+point.dy*120);
        const brush=ctx.createRadialGradient(x,y,0,x,y,radius);
        brush.addColorStop(0,`rgba(${r},${g},255,${point.strength*.8})`);
        brush.addColorStop(.45,`rgba(${r},${g},255,${point.strength*.45})`);
        brush.addColorStop(1,`rgba(${r},${g},255,0)`);
        ctx.fillStyle=brush;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
      }
      this.points.length=0;
      gl.bindTexture(gl.TEXTURE_2D,this.texture);
      gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,this.canvas);
    }
    if(motion)for(const p of this.particles){p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=13*dt;p.vx*=Math.exp(-dt*.7);p.angle+=dt*.8;}
    this.particles=this.particles.filter(p=>p.life<p.duration);
  }
  draw(ctx){
    ctx.save();
    for(const p of this.particles){
      const life=p.life/p.duration;
      ctx.globalAlpha=Math.sin(life*Math.PI)*.25;
      ctx.strokeStyle=p.color;ctx.fillStyle=p.color;
      if(p.water){ctx.lineWidth=.5;ctx.beginPath();ctx.ellipse(p.x,p.y,p.size+life*10,(p.size+life*10)*.3,0,0,Math.PI*2);ctx.stroke();}
      else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.beginPath();ctx.ellipse(0,0,p.size,p.size*.3,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    }
    ctx.restore();
  }
}
