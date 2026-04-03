function setLang(l){
  document.documentElement.setAttribute('data-lang',l);
  document.getElementById('btnEN').classList.toggle('active',l==='en');
  document.getElementById('btnES').classList.toggle('active',l==='es');
  document.documentElement.lang=l;
}
function initIntroHero(){
  const videos=[...document.querySelectorAll('.intro-scene')];
  if(!videos.length)return;
  videos.forEach(video=>{
    const source=video.querySelector('source[data-src]');
    if(source){
      source.src=source.dataset.src;
      video.load();
    }
    video.muted=true;
    video.playsInline=true;
  });
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex=0;
  const safePlay=video=>video.play().catch(()=>{});
  const activate=index=>{
    if(index===activeIndex)return;
    const previous=videos[activeIndex];
    const next=videos[index];
    try{next.currentTime=0;}catch{}
    next.classList.add('active');
    safePlay(next);
    window.setTimeout(()=>{
      previous.classList.remove('active');
      previous.pause();
    },900);
    activeIndex=index;
  };
  safePlay(videos[0]);
  if(reducedMotion)return;
  window.setInterval(()=>activate((activeIndex+1)%videos.length),5000);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      videos.forEach(video=>video.pause());
      return;
    }
    safePlay(videos[activeIndex]);
  });
}
function decorateBrandWordmarks(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
    acceptNode(node){
      if(!node.nodeValue.includes('BARAX')) return NodeFilter.FILTER_REJECT;
      const parent=node.parentElement;
      if(!parent||parent.closest('script,style,noscript,.brand-wordmark-inline')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const targets=[];
  while(walker.nextNode())targets.push(walker.currentNode);
  targets.forEach(node=>{
    const parent=node.parentNode;
    if(!parent) return;
    const frag=document.createDocumentFragment();
    node.nodeValue.split('BARAX').forEach((chunk,index,parts)=>{
      if(chunk) frag.appendChild(document.createTextNode(chunk));
      if(index<parts.length-1){
        const mark=document.createElement('span');
        mark.className='brand-wordmark-inline';
        mark.innerHTML='BAR<span class="brand-ax">AX</span>';
        frag.appendChild(mark);
      }
    });
    parent.replaceChild(frag,node);
  });
}
initIntroHero();
decorateBrandWordmarks();
const nav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60),{passive:true});
const ro=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible')}),{threshold:.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
if(window.matchMedia('(pointer:fine)').matches){
  const g=document.createElement('div');
  Object.assign(g.style,{position:'fixed',width:'260px',height:'260px',borderRadius:'50%',background:'radial-gradient(circle,rgba(0,212,255,.04) 0%,transparent 70%)',pointerEvents:'none',zIndex:'9999',transform:'translate(-50%,-50%)',transition:'left .18s ease,top .18s ease'});
  document.body.appendChild(g);
  document.addEventListener('mousemove',e=>{g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'});
}
// Hero Canvas
(function(){
  const c=document.getElementById('heroCanvas'),ctx=c.getContext('2d');
  const pts=[];let W,H;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;pts.length=0;for(let i=0;i<48;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.2+.2,a:Math.random()*.5+.1})}
  const blips=[{a:.7,d:.55},{a:2,d:.38},{a:3.8,d:.72},{a:5.2,d:.48},{a:4.1,d:.88}];
  function draw(t){
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#060D18';ctx.fillRect(0,0,W,H);
    for(let y=0;y<H;y+=4){ctx.fillStyle='rgba(0,0,0,.04)';ctx.fillRect(0,y,W,1)}
    const cx=W/2,cy=H*.44,mr=Math.min(W,H)*.38;
    [1,2,3,4].forEach(i=>{ctx.beginPath();ctx.arc(cx,cy,mr*i/4,0,Math.PI*2);ctx.strokeStyle=`rgba(0,212,255,${.05+.01*i})`;ctx.lineWidth=1;ctx.stroke()});
    ctx.strokeStyle='rgba(0,212,255,.07)';ctx.lineWidth=1;ctx.setLineDash([4,10]);
    ctx.beginPath();ctx.moveTo(cx-mr,cy);ctx.lineTo(cx+mr,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,cy-mr);ctx.lineTo(cx,cy+mr);ctx.stroke();ctx.setLineDash([]);
    const sa=(t*.0007)%(Math.PI*2);
    try{const sg=ctx.createConicGradient(sa-1.3,cx,cy);sg.addColorStop(0,'rgba(0,212,255,0)');sg.addColorStop(.75,'rgba(0,212,255,0)');sg.addColorStop(.9,'rgba(0,212,255,.05)');sg.addColorStop(1,'rgba(0,212,255,.18)');ctx.beginPath();ctx.arc(cx,cy,mr,0,Math.PI*2);ctx.fillStyle=sg;ctx.fill()}catch(e){}
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sa)*mr,cy+Math.sin(sa)*mr);ctx.strokeStyle='rgba(0,212,255,.45)';ctx.lineWidth=1.5;ctx.stroke();
    blips.forEach(b=>{const diff=((sa-b.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);if(diff<1.4){const f=1-diff/1.4,bx=cx+Math.cos(b.a)*mr*b.d,by=cy+Math.sin(b.a)*mr*b.d;ctx.beginPath();ctx.arc(bx,by,3,0,Math.PI*2);ctx.fillStyle=`rgba(0,212,255,${f*.9})`;ctx.fill();ctx.beginPath();ctx.arc(bx,by,7,0,Math.PI*2);ctx.strokeStyle=`rgba(0,212,255,${f*.35})`;ctx.lineWidth=1;ctx.stroke()}});
    ctx.beginPath();ctx.arc(cx,cy,2,0,Math.PI*2);ctx.fillStyle='#00D4FF';ctx.fill();
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(138,155,181,${p.a})`;ctx.fill()});
    [[55,55],[W-55,55],[W-55,H-55],[55,H-55]].forEach(([hx,hy])=>{ctx.strokeStyle='rgba(22,45,80,.4)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3,nx=hx+Math.cos(a)*20,ny=hy+Math.sin(a)*20;i===0?ctx.moveTo(nx,ny):ctx.lineTo(nx,ny)}ctx.closePath();ctx.stroke()});
    requestAnimationFrame(draw);
  }
  resize();window.addEventListener('resize',resize);requestAnimationFrame(draw);
})();
// Deliver canvas
(function(){
  const c=document.getElementById('deliverCanvas');if(!c)return;
  const ctx=c.getContext('2d');let W,H,nodes=[],t=0;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;nodes=[];for(let i=0;i<20;i++)nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*2+1});nodes[0]={x:W*.5,y:H*.5,vx:0,vy:0,r:6,c:true}}
  function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#060D18';ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(22,45,80,.18)';ctx.lineWidth=.5;for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    nodes.forEach(n=>{if(n.c)return;n.x+=n.vx;n.y+=n.vy;if(n.x<8||n.x>W-8)n.vx*=-1;if(n.y<8||n.y>H-8)n.vy*=-1});
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle=`rgba(0,212,255,${(1-d/150)*.22})`;ctx.lineWidth=.7;ctx.stroke()}}
    nodes.forEach(n=>{if(n.c){const g=Math.abs(Math.sin(t*.018)),rd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,30);rd.addColorStop(0,`rgba(0,212,255,${.2+g*.15})`);rd.addColorStop(1,'rgba(0,212,255,0)');ctx.beginPath();ctx.arc(n.x,n.y,30,0,Math.PI*2);ctx.fillStyle=rd;ctx.fill()}ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle=n.c?'#00D4FF':'rgba(0,152,184,.6)';ctx.fill()});
    t++;requestAnimationFrame(draw);
  }resize();window.addEventListener('resize',resize);draw();
})();
// Use case canvases
document.querySelectorAll('.case-cv').forEach(c=>{
  const ctx=c.getContext('2d'),type=c.dataset.type;let W,H,t=0;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight}
  function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#0F2140';ctx.fillRect(0,0,W,H);
    if(type==='border'){for(let i=0;i<6;i++){const y=H*.3+i*16;ctx.beginPath();ctx.moveTo(0,y+Math.sin(t*.01+i)*4);for(let x=0;x<W;x+=7)ctx.lineTo(x,y+Math.sin(x*.025+t*.01+i)*6);ctx.strokeStyle=`rgba(0,212,255,${.07+i*.02})`;ctx.lineWidth=1;ctx.stroke()}const dx=(t*.5)%W;ctx.beginPath();ctx.arc(dx,H*.4,4,0,Math.PI*2);ctx.fillStyle='rgba(0,212,255,.8)';ctx.fill();ctx.beginPath();ctx.arc(dx,H*.4,18+Math.sin(t*.05)*4,0,Math.PI*2);ctx.strokeStyle='rgba(0,212,255,.22)';ctx.lineWidth=1;ctx.stroke()}
    if(type==='urban'){for(let x=12;x<W;x+=36)for(let y=12;y<H;y+=36){ctx.fillStyle=`rgba(15,33,64,.6)`;ctx.fillRect(x,y,26,26);ctx.strokeStyle='rgba(22,45,80,.4)';ctx.lineWidth=.5;ctx.strokeRect(x,y,26,26)}const ax=W*.6+Math.sin(t*.02)*16,ay=H*.4;ctx.beginPath();ctx.arc(ax,ay,5,0,Math.PI*2);ctx.fillStyle='rgba(255,80,80,.9)';ctx.fill();ctx.beginPath();ctx.arc(ax,ay,12+Math.abs(Math.sin(t*.04))*12,0,Math.PI*2);ctx.strokeStyle='rgba(255,80,80,.3)';ctx.lineWidth=1;ctx.stroke()}
    if(type==='maritime'){for(let i=0;i<7;i++){const y=20+i*(H/7);ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<W;x+=5)ctx.lineTo(x,y+Math.sin(x*.03+t*.02+i*.5)*5);ctx.strokeStyle=`rgba(0,152,184,${.07+(i===3?.1:0)})`;ctx.lineWidth=1;ctx.stroke()}const vx=(t*.4)%(W+40)-20,vy=H*.5;ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(vx+14,vy-6);ctx.lineTo(vx+18,vy);ctx.lineTo(vx,vy+5);ctx.closePath();ctx.fillStyle='rgba(0,212,255,.7)';ctx.fill();ctx.beginPath();ctx.moveTo(vx-50,vy);ctx.lineTo(vx,vy);ctx.strokeStyle='rgba(0,212,255,.2)';ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([])}
    if(type==='aerial'){for(let i=0;i<5;i++){const y=H*.15+i*H*.16;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.strokeStyle='rgba(22,45,80,.2)';ctx.lineWidth=.5;ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([])}const ux=(t*.55)%(W+60)-30,uy=H*.35+Math.sin(t*.012)*10;ctx.beginPath();ctx.moveTo(ux-14,uy);ctx.lineTo(ux+14,uy);ctx.moveTo(ux,uy-6);ctx.lineTo(ux,uy+6);ctx.strokeStyle='rgba(0,212,255,.8)';ctx.lineWidth=2;ctx.stroke();const ch=56+Math.sin(t*.02)*8;ctx.beginPath();ctx.moveTo(ux,uy);ctx.lineTo(ux-ch*.5,uy+ch);ctx.lineTo(ux+ch*.5,uy+ch);ctx.closePath();ctx.fillStyle='rgba(0,212,255,.04)';ctx.fill();ctx.strokeStyle='rgba(0,212,255,.16)';ctx.lineWidth=1;ctx.stroke()}
    t++;requestAnimationFrame(draw);
  }resize();window.addEventListener('resize',resize);draw();
});
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{e.preventDefault();const el=document.querySelector(a.getAttribute('href'));if(el)el.scrollIntoView({behavior:'smooth',block:'start'})})});
