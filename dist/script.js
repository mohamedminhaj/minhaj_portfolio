document.getElementById('year').textContent=new Date().getFullYear();
const menu=document.querySelector('.menu'),nav=document.querySelector('nav');menu.onclick=()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)};nav.querySelectorAll('a').forEach(a=>a.onclick=()=>nav.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
const sections=[...document.querySelectorAll('main section')],links=[...nav.querySelectorAll('a')];const nio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{rootMargin:'-45% 0px -45%'});sections.forEach(s=>nio.observe(s));
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.card').forEach(c=>c.classList.toggle('hidden',b.dataset.filter!=='all'&&!c.dataset.cat.includes(b.dataset.filter)))});
const roles=['Computer Vision Engineer','AI Engineer','Robotics Developer'];let r=0,i=0,del=false,el=document.getElementById('role');function type(){let w=roles[r];el.textContent=w.slice(0,i);if(!del&&i<w.length){i++;setTimeout(type,70)}else if(!del){del=true;setTimeout(type,1300)}else if(i>0){i--;setTimeout(type,35)}else{del=false;r=(r+1)%roles.length;setTimeout(type,250)}}type();

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress=document.querySelector('.scroll-progress'),header=document.querySelector('header'),hero=document.querySelector('.hero');
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?scrollY/max*100:0)+'%';header.classList.toggle('scrolled',scrollY>24);if(!reduced)hero.style.setProperty('--hero-y',Math.min(scrollY*.035,18)+'px')},{passive:true});

if(matchMedia('(pointer:fine)').matches&&!reduced){
  const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;
  addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;dot.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;const hx=(e.clientX/innerWidth-.5)*-10,hy=(e.clientY/innerHeight-.5)*-7;hero.style.setProperty('--hero-x',hx+'px');hero.style.setProperty('--hero-y',hy+'px')});
  document.querySelectorAll('a,button,.card').forEach(e=>{e.addEventListener('pointerenter',()=>document.body.classList.add('cursor-hover'));e.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-hover'))});
  (function follow(){rx+=(x-rx)*.14;ry+=(y-ry)*.14;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(follow)})();
  document.querySelectorAll('.card').forEach(card=>{card.addEventListener('pointermove',e=>{const q=card.getBoundingClientRect(),px=(e.clientX-q.left)/q.width,py=(e.clientY-q.top)/q.height;card.style.setProperty('--mx',px*100+'%');card.style.setProperty('--my',py*100+'%');card.style.transform=`perspective(800px) rotateY(${(px-.5)*3}deg) rotateX(${(.5-py)*3}deg) translateY(-5px)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
}

const rain=document.getElementById('code-rain'),ctx=rain.getContext('2d');let cols,drops;
function sizeRain(){rain.width=innerWidth*devicePixelRatio;rain.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);cols=Math.ceil(innerWidth/28);drops=Array.from({length:cols},()=>Math.random()*-40)}
function drawRain(){ctx.fillStyle='rgba(3,9,11,.1)';ctx.fillRect(0,0,innerWidth,innerHeight);ctx.fillStyle='rgba(23,233,180,.18)';ctx.font='11px Space Mono';for(let n=0;n<cols;n++){const c='01AI<>/{}'[Math.floor(Math.random()*9)];ctx.fillText(c,n*28,drops[n]*22);if(drops[n]*22>innerHeight&&Math.random()>.985)drops[n]=0;drops[n]+=.12}requestAnimationFrame(drawRain)}
if(!reduced){sizeRain();addEventListener('resize',sizeRain);drawRain()}
