/* Interaction is progressive: reading and navigation do not depend on motion. */
let effectsController;
let revealObserver;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function prismMarkup(themes) {
  const ends = [[610,132],[650,245],[650,358],[610,470]];
  return `<figure class="hero-art interactive-prism">
    <div class="prism-stage">
      <svg class="prism-svg" viewBox="0 0 720 550" role="img" aria-label="An interactive prism separating light into the four perspectives on AI">
        <defs>
          <radialGradient id="prism-halo"><stop stop-color="#9b9ba9" stop-opacity=".15"/><stop offset="1" stop-color="#101012" stop-opacity="0"/></radialGradient>
          <linearGradient id="prism-glass" x2="1" y2="1"><stop stop-color="#ededf5" stop-opacity=".18"/><stop offset=".55" stop-color="#a3a3b4" stop-opacity=".025"/><stop offset="1" stop-color="#ededf5" stop-opacity=".13"/></linearGradient>
          <pattern id="prism-grid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" fill="none" stroke="#9d9dab" stroke-opacity=".08"/></pattern>
        </defs>
        <rect x="25" y="25" width="650" height="495" fill="url(#prism-grid)"/>
        <ellipse cx="332" cy="265" rx="320" ry="260" fill="url(#prism-halo)"/>
        <g class="prism-orbits" fill="none" stroke="#b5b5c3" stroke-opacity=".12"><circle cx="315" cy="273" r="205"/><circle cx="315" cy="273" r="157" stroke-dasharray="2 8"/><path d="M315 43v440M80 273h485"/></g>
        <path class="incoming-light" d="M0 286 277 267" stroke="#e4e4ed" stroke-width="1.5" fill="none"/>
        <g class="prism-core"><path d="M316 84 463 403 169 414Z" fill="url(#prism-glass)" stroke="#c2c2d0" stroke-opacity=".6"/><path d="M316 84 314 390 463 403M314 390 169 414" fill="none" stroke="#c2c2d0" stroke-opacity=".3"/></g>
        ${Object.entries(themes).map(([key,a],i)=>`<g class="prism-ray" data-ray="${key}" style="--ray:${a.color}" data-end-x="${ends[i][0]}" data-end-y="${ends[i][1]}"><path class="ray-glow" d="M277 267 365 ${225+i*39} ${ends[i][0]} ${ends[i][1]}"/><path class="ray-line" d="M277 267 365 ${225+i*39} ${ends[i][0]} ${ends[i][1]}"/><circle cx="${ends[i][0]}" cy="${ends[i][1]}" r="4"/><text x="${ends[i][0]-16}" y="${ends[i][1]-16}" text-anchor="end">${a.number} / ${a.label.toUpperCase()}</text></g>`).join('')}
        <text x="60" y="516" fill="#81818f" font-family="Arial,sans-serif" font-size="8" letter-spacing="2">FIG. 01 / A CHANGE IN PERSPECTIVE</text>
      </svg>
    </div>
    <div class="prism-controls"><div class="prism-adjust"><label for="prism-angle">Bend the light</label><input id="prism-angle" type="range" min="-16" max="16" value="0" aria-label="Change the angle of the prism’s light"><button type="button" class="prism-reset">Reset</button></div>
      <div class="prism-themes" role="group" aria-label="Explore a perspective">${Object.entries(themes).map(([key,a])=>`<button type="button" data-prism-theme="${key}" aria-pressed="false" style="--accent:${a.color}"><span></span>${a.label}</button>`).join('')}</div></div>
      <figcaption class="prism-caption" aria-live="polite"><span>One technology. Four ways of seeing it.</span><span class="prism-hint">Select a perspective above</span></figcaption>
  </figure>`;
}

function cleanupEffects() {
  effectsController?.abort();
  revealObserver?.disconnect();
}

function initializeEffects() {
  cleanupEffects();
  effectsController = new AbortController();
  const {signal} = effectsController;
  const prism = document.querySelector('.interactive-prism');
  if(prism) {
    const slider = prism.querySelector('#prism-angle');
    const svg = prism.querySelector('.prism-svg');
    const caption = prism.querySelector('.prism-caption');
    const buttons = [...prism.querySelectorAll('[data-prism-theme]')];
    const rays = [...prism.querySelectorAll('.prism-ray')];
    let selected = '';
    function select(key) {
      selected = selected===key ? '' : key;
      buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.prismTheme===selected)));
      rays.forEach(ray=>{
        ray.classList.toggle('is-muted',Boolean(selected) && ray.dataset.ray!==selected);
        ray.classList.toggle('is-selected',ray.dataset.ray===selected);
      });
      caption.innerHTML = selected ? `<span>${areas[selected].question}</span><a href="/${selected}" style="color:${areas[selected].color}">Explore ${areas[selected].label.toLowerCase()} ${icon('right')}</a>` : '<span>One technology. Four ways of seeing it.</span><span class="prism-hint">Select a perspective above</span>';
    }
    function bend() {
      const angle = Number(slider.value);
      prism.querySelector('.incoming-light').setAttribute('d',`M0 ${286+angle*3} 277 267`);
      prism.querySelector('.prism-core').setAttribute('transform',`rotate(${angle*.2} 315 273)`);
      rays.forEach((ray,i)=>{
        const y = Number(ray.dataset.endY)+angle*(i-1.5)*1.3;
        const x = Number(ray.dataset.endX);
        ray.querySelectorAll('path').forEach(path=>path.setAttribute('d',`M277 267 365 ${225+i*39+angle*.5} ${x} ${y}`));
        ray.querySelector('circle').setAttribute('cy',y);
        ray.querySelector('text').setAttribute('y',y-16);
      });
    }
    slider.addEventListener('input',bend,{signal});
    buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.prismTheme),{signal}));
    prism.querySelector('.prism-reset').addEventListener('click',()=>{
      slider.value='0';bend();selected='';select('');svg.style.transform='';
    },{signal});
    prism.querySelector('.prism-stage').addEventListener('pointermove',event=>{
      if(reducedMotion.matches || event.pointerType!=='mouse') return;
      const bounds=event.currentTarget.getBoundingClientRect();
      const x=(event.clientX-bounds.left)/bounds.width-.5;
      const y=(event.clientY-bounds.top)/bounds.height-.5;
      svg.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
    },{signal});
    prism.querySelector('.prism-stage').addEventListener('pointerleave',()=>{svg.style.transform='';},{signal});
  }
  if(reducedMotion.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) {entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
    });
  },{threshold:.08});
  document.querySelectorAll('.post-card,.person-card,.perspective,.motive,.editorial,.error-perspectives').forEach((element,i)=>{
    if(element.getBoundingClientRect().top < innerHeight) return;
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay',`${(i%4)*45}ms`);
    revealObserver.observe(element);
  });
}
reducedMotion.addEventListener('change',()=>{
  if(reducedMotion.matches) {
    revealObserver?.disconnect();
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
    const svg=document.querySelector('.prism-svg');if(svg) svg.style.transform='';
  }
});
