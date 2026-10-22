import { passages } from './poem.js';
import { PaintedLandscape } from './landscape.js';

// The dynamically created passages restore their own fragment position.
if (location.hash) history.scrollRestoration = 'manual';

const $ = (s) => document.querySelector(s);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let language = 'en';
let activeIndex = 0;
let motionEnabled = !reducedMotion.matches;
let soundEnabled = false;
let lastFocused = null;
let world;

function paintLines(element, text) {
  element.replaceChildren();
  const lines=text.split('\n');
  lines.forEach((line, i) => {
    const span=document.createElement('span');
    span.className='poem-line';
    span.textContent=line;
    element.append(span);
    if(i<lines.length-1)element.append(document.createTextNode('\n'));
  });
}

const passageContainer = $('#passages');
const readerContainer = $('#reader-poem');
passages.forEach((passage, i) => {
  const section = document.createElement('section');
  section.className = 'chapter passage';
  section.id = `passage-${i + 1}`;
  section.dataset.scene = passage.scene;
  section.dataset.index = i + 1;
  section.setAttribute('aria-labelledby', `passage-title-${i + 1}`);
  const inner = document.createElement('div');
  inner.className = 'chapter-inner';
  const label = document.createElement('div');
  label.className = 'passage-label';
  const number = document.createElement('span');
  number.className = 'number';
  number.textContent = String(i + 1).padStart(2, '0');
  const title = document.createElement('h2');
  title.id = `passage-title-${i + 1}`;
  title.className = 'eyebrow';
  title.dataset.en = passage.title;
  title.dataset.fa = passage.faTitle;
  title.textContent = passage.title;
  label.append(number, title);
  const text = document.createElement('p');
  text.className = 'poetry';
  text.dataset.passage = i;
  paintLines(text, passage.en);
  const mark = document.createElement('hr');
  mark.className = 'end-mark';
  inner.append(label, text, mark);
  section.append(inner);
  passageContainer.append(section);
  const stanza = document.createElement('section');
  stanza.className = 'reader-stanza';
  const stanzaNumber = number.cloneNode(true);
  stanzaNumber.className = 'stanza-number';
  stanzaNumber.setAttribute('aria-hidden', 'true');
  stanza.append(stanzaNumber, text.cloneNode(true));
  readerContainer.append(stanza);
});

const chapters = [...document.querySelectorAll('.chapter')];
world = new PaintedLandscape($('#watercolor-world'), chapters);
const paints = [...document.querySelectorAll('.painting')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
}, { threshold: 0.2 });
chapters.forEach(chapter => observer.observe(chapter));

function chapterName() {
  if (activeIndex === 0) return language === 'en' ? 'The beginning' : 'آغاز';
  if (activeIndex === 12) return language === 'en' ? 'A little closer' : 'کمی نزدیک‌تر';
  return passages[activeIndex - 1][language === 'en' ? 'title' : 'faTitle'];
}

let scrollQueued = false;
function updateScroll() {
  scrollQueued = false;
  const midpoint = innerHeight * 0.5;
  let closest = chapters[0], distance = Infinity;
  chapters.forEach(chapter => {
    const rect = chapter.getBoundingClientRect();
    const d = Math.abs(rect.top + rect.height / 2 - midpoint);
    if (d < distance) { distance = d; closest = chapter; }
  });
  const index = Number(closest.dataset.index);
  if (activeIndex !== index || !document.body.dataset.scene) {
    activeIndex = index;
    const scene = closest.dataset.scene;
    document.body.dataset.scene = scene;
    document.body.classList.toggle('night', scene === 'night');
    const fallback=paints[0]?.querySelector('img');
    if(fallback)fallback.src="assets/paintings/unified-world.webp";
    $('#chapter-number').textContent = String(index).padStart(2, '0');
    $('#chapter-name').textContent = chapterName();
    $('#next-section').href = index === 12 ? '#top' : (index === 11 ? '#ending' : `#passage-${index + 1}`);
  }
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  $('#progress-fill').style.width = `${Math.min(100, Math.max(0, scrollY / maxScroll * 100))}%`;
}
$('.ending').id = 'ending';
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
addEventListener('resize', updateScroll, { passive: true });
updateScroll();
// Restore a fragment after loading and font layout have both settled.
const pageLoaded = document.readyState === 'complete' ? Promise.resolve() :
  new Promise(resolve => addEventListener('load', resolve, {once:true}));
Promise.all([pageLoaded,document.fonts.ready]).then(()=>requestAnimationFrame(()=>{
  world?.measure();
  const id=decodeURIComponent(location.hash.slice(1));
  if(id)document.getElementById(id)?.scrollIntoView({behavior:'instant'});
  world?.restoreScrollPosition();
  updateScroll();
}));

function setLanguage(next) {
  language = next;
  document.documentElement.lang = next;
  document.body.classList.toggle('fa-mode', next === 'fa');
  document.querySelectorAll('[data-en][data-fa]').forEach(el => {
    el.innerHTML = el.dataset[next];
    el.lang = next;
    el.dir = next === 'fa' ? 'rtl' : 'ltr';
  });
  document.querySelectorAll('[data-passage]').forEach(el => {
    paintLines(el, passages[Number(el.dataset.passage)][next]);
    el.lang = next;
    el.dir = next === 'fa' ? 'rtl' : 'ltr';
  });
  $('.lang-en').classList.toggle('active', next === 'en');
  $('.lang-fa').classList.toggle('active', next === 'fa');
  $('#language').setAttribute('aria-label', next === 'en' ? 'Read in Persian' : 'Read in English');
  $('#reader-language').innerHTML = next === 'en' ? 'Read in Persian <span lang="fa">فارسی</span>' : 'Read in English <span lang="en">EN</span>';
  $('#chapter-name').textContent = chapterName();
  updateSoundLabel();
  requestAnimationFrame(() => world?.measure());
}
$('#language').addEventListener('click', () => setLanguage(language === 'en' ? 'fa' : 'en'));
$('#reader-language').addEventListener('click', () => setLanguage(language === 'en' ? 'fa' : 'en'));

function openDialog(id) {
  if(document.body.classList.contains('landscape-expanded'))setLandscapeOpen(false);
  lastFocused = document.activeElement;
  const dialog = document.getElementById(id);
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  dialog.scrollTop = 0;
}
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    lastFocused?.focus({ preventScroll: true });
  });
});

// A very quiet original soundscape: filtered water-like noise and two soft tones.
// No recordings, voice impersonation, autoplay, or external audio requests.
let audioContext, master;
function createSoundscape() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error('Audio unavailable');
  audioContext = new AudioContext();
  master = audioContext.createGain();
  master.gain.value = 0;
  master.connect(audioContext.destination);
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 8, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i++) {
    brown = (brown + (Math.random() * 2 - 1) * 0.02) / 1.02;
    data[i] = brown * 3;
  }
  // Blend the loop seam to avoid clicks.
  const fade = Math.min(8000, Math.floor(data.length / 8));
  for (let i = 0; i < fade; i++) {
    const t = i / fade;
    data[data.length - fade + i] = data[data.length - fade + i] * (1 - t) + data[i] * t;
  }
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer; noise.loop = true;
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 650;
  noise.connect(filter); filter.connect(master); noise.start();
  [146.83, 220].forEach((frequency, i) => {
    const tone = audioContext.createOscillator();
    const gain = audioContext.createGain();
    tone.frequency.value = frequency; gain.gain.value = i ? 0.008 : 0.012;
    tone.connect(gain); gain.connect(master); tone.start();
  });
}
function updateSoundLabel() {
  $('#sound-label').textContent = language === 'fa' ? (soundEnabled ? 'صدا روشن' : 'صدا خاموش') : (soundEnabled ? 'Sound on' : 'Sound off');
  $('#sound').setAttribute('aria-pressed', String(soundEnabled));
  $('#sound').setAttribute('aria-label', soundEnabled ? 'Mute ambient sound' : 'Play ambient sound');
  document.body.classList.toggle('sound-on', soundEnabled);
}
$('#sound').addEventListener('click', async () => {
  try {
    if (!audioContext) createSoundscape();
    await audioContext.resume();
    soundEnabled = !soundEnabled;
    master.gain.setTargetAtTime(soundEnabled ? 0.16 : 0, audioContext.currentTime, 0.5);
    updateSoundLabel();
  } catch {
    soundEnabled = false;
    updateSoundLabel();
    $('#sound-label').textContent = 'Sound unavailable';
  }
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext) return;
  if (document.hidden) audioContext.suspend().catch(() => {});
  else if (soundEnabled) audioContext.resume().catch(() => {});
});

function updateMotion() {
  world?.setMotion(motionEnabled);
  document.body.classList.toggle('motion-paused', !motionEnabled);
  $('#motion').setAttribute('aria-pressed', String(motionEnabled));
  const label = motionEnabled ? 'Pause landscape motion' : 'Resume landscape motion';
  $('#motion').setAttribute('aria-label', label);
  $('#motion').title = label;
  $('#motion svg').innerHTML = motionEnabled ? '<path d="M7 5v10M13 5v10"/>' : '<path d="m7 4 8 6-8 6Z"/>';
  if (!motionEnabled) {
    document.documentElement.style.setProperty('--mx', '0px');
    document.documentElement.style.setProperty('--my', '0px');
  }
}
$('#motion').addEventListener('click', () => { motionEnabled = !motionEnabled; updateMotion(); });
reducedMotion.addEventListener('change', event => { motionEnabled = !event.matches; updateMotion(); });
updateMotion();

// Small pointer parallax keeps the painted landscape feeling open and alive.
addEventListener('pointermove', event => {
  world?.setPointer(event.clientX,event.clientY,!world?.drag&&!event.target.closest('a,button,dialog'));
  if (!motionEnabled || event.pointerType !== 'mouse') return;
  document.documentElement.style.setProperty('--mx', `${(event.clientX / innerWidth - 0.5) * -13}px`);
  document.documentElement.style.setProperty('--my', `${(event.clientY / innerHeight - 0.5) * -7}px`);
}, { passive: true });

let landscapeOpen = false;
function setLandscapeOpen(open) {
  landscapeOpen=open;
  world?.setOpen(open);
  document.body.classList.toggle('landscape-expanded',open);
  document.body.style.overflow=open?'hidden':'';
  $('.landscape-view').setAttribute('aria-hidden',String(!open));
  document.querySelectorAll('.landscape-view button').forEach(button=>button.tabIndex=open?0:-1);
  $('#journey').inert=open;
  $('.experience-footer').inert=open;
  $('#open-landscape').tabIndex=open?-1:0;
  $('#open-landscape').setAttribute('aria-hidden',String(open));
  if(open)$('#close-landscape').focus({preventScroll:true});
  else $('#open-landscape').focus({preventScroll:true});
}
$('#open-landscape').addEventListener('click',()=>setLandscapeOpen(true));
$('#close-landscape').addEventListener('click',()=>setLandscapeOpen(false));
$('#zoom-in').addEventListener('click',()=>world?.zoom(-.7));
$('#zoom-out').addEventListener('click',()=>world?.zoom(.7));
$('#zoom-reset').addEventListener('click',()=>world?.resetView());
const exploreView=$('.landscape-view');
exploreView.addEventListener('wheel',event=>{
  if(!landscapeOpen)return;
  event.preventDefault();
  const amount=event.deltaY*(event.deltaMode===1?.035:.003);
  world?.zoom(Math.max(-.65,Math.min(.65,amount)),event.clientX,event.clientY);
},{passive:false});
exploreView.addEventListener('pointerdown',event=>{
  if(!landscapeOpen||event.target.closest('button')||event.button!==0)return;
  exploreView.setPointerCapture(event.pointerId);
  world?.beginDrag(event.clientX,event.clientY);
  exploreView.classList.add('dragging');
});
exploreView.addEventListener('pointermove',event=>world?.dragTo(event.clientX,event.clientY));
const endExploreDrag=()=>{world?.endDrag();exploreView.classList.remove('dragging');};
exploreView.addEventListener('pointerup',endExploreDrag);
exploreView.addEventListener('pointercancel',endExploreDrag);
addEventListener('keydown',event=>{
  if(!landscapeOpen||event.target.closest('dialog'))return;
  if(event.key==='+'||event.key==='='){event.preventDefault();world?.zoom(-.7);}
  if(event.key==='-'){event.preventDefault();world?.zoom(.7);}
  if(event.key==='0'){event.preventDefault();world?.resetView();}
});
document.querySelectorAll('a[href="#top"]').forEach(link=>link.addEventListener('click',()=>{if(landscapeOpen)setLandscapeOpen(false);}));
addEventListener('keydown',event=>{if(event.key==='Escape'&&landscapeOpen)setLandscapeOpen(false);});

// A soft, lagging cursor echoes a brush moving across wet paper.
const brush=$('.paint-cursor');
let pointerX=-200,pointerY=-200,brushX=-200,brushY=-200;
addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return;
  pointerX=event.clientX;pointerY=event.clientY;
  brush.classList.add('visible');
  brush.classList.toggle('over-action',!!event.target.closest('a,button'));
},{passive:true});
document.addEventListener('pointerleave',()=>{brush.classList.remove('visible');world?.clearPointer();});
addEventListener('blur',()=>{brush.classList.remove('visible');world?.clearPointer();});

// One slow palette transition drives both CSS colors and painted lighting.
// Updating the colors themselves also interpolates gradients, whose theme
// variables used to switch abruptly when the active chapter changed.
const sceneColors={
  paper:[[245,243,235],[32,44,46]],
  ink:[[52,56,45],[236,233,220]],
  muted:[[113,118,104],[184,194,183]],
  line:[[185,188,173],[103,115,109]],
  sky:[[250,248,244],[52,66,68]]
};
let paletteProgress=0,paletteVelocity=0,paletteLast=0;
function updatePalette(time){
  const dt=Math.min((time-(paletteLast||time))/1000,.08);paletteLast=time;
  const target=document.body.dataset.scene==='night'?1:0;
  if(reducedMotion.matches){paletteProgress=target;paletteVelocity=0;}
  else{
    const omega=1,change=paletteProgress-target,decay=Math.exp(-omega*dt);
    const step=(paletteVelocity+omega*change)*dt;
    paletteVelocity=(paletteVelocity-omega*step)*decay;
    paletteProgress=target+(change+step)*decay;
    if(Math.abs(paletteProgress-target)<.0001&&Math.abs(paletteVelocity)<.0001){paletteProgress=target;paletteVelocity=0;}
  }
  for(const [name,[day,night]] of Object.entries(sceneColors)){
    const rgb=day.map((value,i)=>Math.round(value+(night[i]-value)*paletteProgress));
    document.body.style.setProperty('--'+name,`rgb(${rgb.join(' ')})`);
  }
  document.body.classList.add('palette-ready');
  world?.setNight(paletteProgress);
}
let focusLast=0;
function focusPoem(time){
  requestAnimationFrame(focusPoem);
  if(document.hidden||time-focusLast<32)return;
  focusLast=time;
  updatePalette(time);
  if(motionEnabled){
    brushX+=(pointerX-brushX)*.14;brushY+=(pointerY-brushY)*.14;
    brush.style.transform=`translate3d(${brushX}px,${brushY}px,0)`;
  }
  document.querySelectorAll('.passage.in-view .poem-line').forEach(line=>{
    if(!motionEnabled||reducedMotion.matches){line.style.filter='none';line.style.opacity='1';line.style.transform='none';return;}
    const r=line.getBoundingClientRect(),y=(r.top+r.height*.5)/innerHeight;
    const above=Math.max(0,(.25-y)/.25),below=Math.max(0,(y-.72)/.28);
    const edge=Math.min(1,Math.max(above,below));
    line.style.filter=`blur(${(edge*7).toFixed(2)}px)`;
    line.style.opacity=String(1-edge*.88);
    line.style.transform=`translate3d(${(edge*2).toFixed(1)}px,0,0)`;
  });
}
requestAnimationFrame(focusPoem);

const canvas = $('#particles');
const ctx = canvas.getContext('2d');
let width = innerWidth, height = innerHeight;
const motes = Array.from({ length: 22 }, (_, i) => ({
  x: ((i * 197 + 53) % 997) / 997,
  y: ((i * 239 + 79) % 991) / 991,
  radius: 0.5 + (i % 4) * 0.3,
  speed: 0.15 + (i % 5) * 0.04,
}));
function resizeCanvas() {
  width = innerWidth; height = innerHeight;
  const scale = Math.min(devicePixelRatio, 1.5);
  canvas.width = width * scale; canvas.height = height * scale;
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  ctx?.setTransform(scale, 0, 0, scale, 0, 0);
}
resizeCanvas();
addEventListener('resize', resizeCanvas, { passive: true });
let lastFrame = 0;
function draw(time) {
  requestAnimationFrame(draw);
  if (!ctx || !motionEnabled || document.hidden || time - lastFrame < 32) return;
  lastFrame = time;
  ctx.clearRect(0, 0, width, height);
  world?.drawEffects(ctx);
  ctx.fillStyle = document.body.classList.contains('night') ? '#e9e0b8' : '#737e5a';
  motes.forEach(mote => {
    const x = (mote.x * width + Math.sin(time * 0.0002 + mote.y * 10) * 12);
    const y = (mote.y * height - time * 0.004 * mote.speed) % height;
    ctx.globalAlpha = 0.12 + Math.sin(time * 0.0005 + mote.x * 20) * 0.09;
    ctx.beginPath(); ctx.arc(x, y < 0 ? height + y : y, mote.radius, 0, Math.PI * 2); ctx.fill();
  });
  ctx.strokeStyle=document.body.classList.contains('night')?'#d3d8c9':'#4d5947';
  ctx.lineWidth=.7;ctx.globalAlpha=.28;
  for(let i=0;i<3;i++){
    const bx=((time*.018+i*24)%(width+280))-140;
    const by=height*.19+Math.sin(time*.00035+i*.7)*18+i*12;
    const wing=Math.sin(time*.004+i*2)*3.5;
    ctx.beginPath();ctx.moveTo(bx-4,by-wing);ctx.quadraticCurveTo(bx-2,by-2,bx,by);ctx.quadraticCurveTo(bx+2,by-2,bx+4,by-wing);ctx.stroke();
  }
}
if (ctx) requestAnimationFrame(draw);
updateSoundLabel();
