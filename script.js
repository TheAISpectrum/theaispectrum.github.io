/* Edit content/posts.json to add articles; content/site.json to edit the team. */
const areas = {
  environment: { number: '01', label: 'Environment', full: 'Environmental costs of AI', color: '#b6cb85', question: 'What does intelligence cost the planet?', description: 'The energy, water, and materials behind the digital world. We look beyond the interface to understand AI’s environmental footprint.' },
  'physical-ai': { number: '02', label: 'Physical AI', full: 'Physical implementation of AI', color: '#dfa57c', question: 'What happens when AI enters our world?', description: 'From sensors to robotic systems, intelligence needs a body to act. We explore the hardware, engineering, and real-world limits of physical AI.' },
  productivity: { number: '03', label: 'Productivity', full: 'AI for productivity', color: '#99b9df', question: 'Can we work better, not just faster?', description: 'Useful workflows, thoughtful experiments, and a little healthy skepticism. We explore how AI can help us do meaningful work while keeping our judgment in the loop.' },
  cognition: { number: '04', label: 'Human cognition', full: 'AI’s negative impacts on human cognition', color: '#bb9edb', question: 'What do we lose when we stop thinking?', description: 'The quieter costs of convenience. We examine overreliance, weakened critical thinking, and what happens when we hand too much of our mental work to machines.' }
};
const main = document.querySelector('#main');
const page = document.body.dataset.page;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const topicLink = key => `${key}.html`;
const postLink = post => `post.html?slug=${encodeURIComponent(post.slug)}`;
const tag = key => `<span class="tag" style="--accent:${areas[key].color}"><span aria-hidden="true"></span>${areas[key].label}</span>`;

function chrome(active = page) {
  document.querySelector('#header').innerHTML = `<div class="header-inner"><a class="brand" href="index.html" aria-label="The AI Spectrum home"><img src="assets/favicon.svg" width="33" height="33" alt=""><span>The AI Spectrum<span class="brand-period">.</span></span></a><nav aria-label="Main navigation"><a href="index.html" ${active === 'home' ? 'aria-current="page"' : ''}>Home</a>${Object.entries(areas).map(([key,a]) => `<a href="${topicLink(key)}" ${active === key ? 'aria-current="page"' : ''}>${a.label}</a>`).join('')}<a href="about.html" ${active === 'about' || active === 'founder' ? 'aria-current="page"' : ''}>About us <span aria-hidden="true">↗</span></a></nav></div>`;
  document.querySelector('#footer').innerHTML = `<div class="footer-top"><a class="brand" href="index.html"><img src="assets/favicon.svg" width="28" height="28" alt="">The AI Spectrum.</a><p>More perspectives. Better questions.</p><a class="text-link" href="about.html">Meet the people behind it <span aria-hidden="true">↗</span></a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} The AI Spectrum</span><span>An independent, four-perspective publication</span><a href="#header">Back to top ↑</a></div>`;
}
function card(post, featured = false) {
  return `<article class="post-card ${featured ? 'featured-card' : ''}" style="--accent:${areas[post.area].color}"><a class="card-image" href="${postLink(post)}" tabindex="-1" aria-hidden="true"><img src="${esc(post.image)}" alt="" loading="lazy" width="720" height="460"><span class="image-arrow">↗</span></a><div class="card-copy"><div class="card-meta">${tag(post.area)}<span>${date(post.date)}</span></div><h3><a href="${postLink(post)}">${esc(post.title)}</a></h3><p>${esc(post.excerpt)}</p><a class="text-link" href="${postLink(post)}" aria-label="Read ${esc(post.title)}">Read the story <span aria-hidden="true">↗</span></a></div></article>`;
}
function home(posts) {
  main.innerHTML = `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> AN INDEPENDENT LOOK AT ARTIFICIAL INTELLIGENCE</p><h1>There’s more<br>to AI than<br><em>the algorithm.</em></h1><p class="hero-intro">A tool. A footprint. A physical presence.<br>A shift in how we think.</p><p class="hero-description">We explore the full spectrum of artificial intelligence — what it makes possible, and what it asks of us.</p><a class="button" href="#perspectives">Explore the spectrum <span aria-hidden="true">↘</span></a></div><figure class="hero-art"><img src="assets/spectrum.svg" width="760" height="690" alt="A single beam of light enters a prism and separates into four colored paths: environment, physical AI, productivity, and human cognition."><figcaption><span>ONE TECHNOLOGY.</span><span>FOUR WAYS OF SEEING IT.</span></figcaption></figure></section><section class="perspectives" id="perspectives"><div class="section-heading"><p class="eyebrow">THE FOUR PERSPECTIVES</p><p>Follow a question. Find a different angle.</p></div><div class="perspective-grid">${Object.entries(areas).map(([key,a]) => `<a class="perspective" href="${topicLink(key)}" style="--accent:${a.color}"><div class="perspective-top"><span>${a.number} /</span><span aria-hidden="true">↗</span></div><h2>${a.label}</h2><p>${a.question}</p><span class="perspective-bottom">Explore the theme <span aria-hidden="true">→</span></span></a>`).join('')}</div></section><section class="latest"><div class="section-heading"><div><p class="eyebrow">NOTES FROM ACROSS THE SPECTRUM</p><h2>The latest thinking<span class="brand-period">.</span></h2></div><span class="small-note">Four themes. An open mind.</span></div><div class="posts-grid">${posts.map((p,i) => card(p,i===0)).join('')}</div></section><section class="motive"><p class="eyebrow">WHY WE’RE HERE</p><h2>Curiosity over hype.<br><em>Understanding over assumptions.</em></h2><div><p>AI is becoming part of everyday life. We believe understanding it means looking at the whole picture: the resources it consumes, the systems it powers, the work it changes, and the habits it shapes.</p><p>This is our space to ask better questions, connect different perspectives, and make a complex subject a little more human.</p><a class="text-link" href="about.html">The people behind the questions <span aria-hidden="true">↗</span></a></div></section>`;
}
function theme(key, posts) {
  const a = areas[key];
  document.title = `${a.label} — The AI Spectrum`;
  main.innerHTML = `<section class="theme-hero" style="--accent:${a.color}"><div><a class="breadcrumb" href="index.html#perspectives">← All perspectives</a><p class="eyebrow">PERSPECTIVE ${a.number} / ${a.full.toUpperCase()}</p><h1>${a.label}<span>.</span></h1><h2>${a.question}</h2><p>${a.description}</p></div><img src="assets/${key}.svg" width="720" height="460" alt="${esc(posts.find(p=>p.area===key)?.imageAlt || '')}"></section><section class="latest theme-latest"><div class="section-heading"><h2>Latest stories</h2><span class="small-note">${posts.filter(p=>p.area===key).length} article${posts.filter(p=>p.area===key).length===1?'':'s'} · Newest first</span></div><div class="posts-grid topic-posts">${posts.filter(p=>p.area===key).map(p=>card(p)).join('') || '<p>New perspectives are on their way. Check back soon.</p>'}</div></section>`;
}
function about(founders) {
  document.title = 'About us — The AI Spectrum';
  main.innerHTML = `<section class="about-intro"><p class="eyebrow">THE PEOPLE BEHIND THE PERSPECTIVES</p><h1>Four minds.<br><em>A wider view.</em></h1><div><p>We’re a team of four, connected by a shared curiosity about artificial intelligence and the world it’s changing.</p><p>Each of us follows a different thread. Together, we want to look beyond easy answers — and create a space where useful ideas and difficult questions can sit side by side.</p></div></section><section class="team-section"><div class="section-heading"><h2>Meet the team<span class="brand-period">.</span></h2><p>Select a portrait to read their story ↗</p></div><div class="team-grid">${founders.map(f=>`<a class="person-card" href="founder.html?id=${encodeURIComponent(f.id)}" style="--accent:${areas[f.area].color}"><div class="portrait-wrap"><img src="${esc(f.image)}" alt="${esc(f.imageAlt)}" width="600" height="700"><span class="portrait-link">Read my story ↗</span></div><div class="person-meta">${tag(f.area)}<h3>${esc(f.name)}</h3><p>${esc(f.line)}</p></div></a>`).join('')}</div></section><section class="editorial"><p class="eyebrow">OUR EDITORIAL APPROACH</p><h2>Look closely.<br>Ask honestly.</h2><div><p>We aim to explain clearly, link to our sources, and distinguish evidence from opinion. A promising application can have real costs; a serious concern can still deserve careful scrutiny.</p><p>We’re here to keep learning, and to bring you into that process.</p></div></section>`;
}
function founder(founders, posts) {
  const f = founders.find(f=>f.id===new URLSearchParams(location.search).get('id'));
  if (!f) return missing('Profile not found', 'This team member’s page doesn’t exist.', 'about.html', 'Meet the team');
  document.title = `${f.name} — The AI Spectrum`;
  main.innerHTML = `<section class="profile" style="--accent:${areas[f.area].color}"><a class="breadcrumb" href="about.html">← Meet the team</a><p class="eyebrow">ONE MIND BEHIND THE SPECTRUM</p><h1>${esc(f.name)}</h1><p class="profile-line">${esc(f.line)}</p><img class="profile-image" src="${esc(f.image)}" alt="${esc(f.imageAlt)}" width="600" height="700">${tag(f.area)}<div class="profile-bio">${f.bio.map(p=>`<p>${esc(p)}</p>`).join('')}</div></section><section class="latest"><div class="section-heading"><h2>Stories by ${esc(f.name)}</h2></div><div class="posts-grid topic-posts">${posts.filter(p=>p.author===f.id).map(p=>card(p)).join('') || '<p>New stories are on their way.</p>'}</div></section>`;
}
// Markdown is authored in this repository, never submitted by site visitors.
// Remove executable HTML and unsafe URLs as an additional publishing safeguard.
function markdown(source) {
  const template = document.createElement('template');
  template.innerHTML = marked.parse(source, {gfm:true});
  template.content.querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta,base,svg,math').forEach(el=>el.remove());
  template.content.querySelectorAll('*').forEach(el=>{
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on') || ['style','srcdoc','srcset','id','name'].includes(attr.name)) el.removeAttribute(attr.name);
      if (['href','src','xlink:href','action'].includes(attr.name)) {
        try { if (!['https:','http:','mailto:'].includes(new URL(attr.value,location.href).protocol)) el.removeAttribute(attr.name); }
        catch { el.removeAttribute(attr.name); }
      }
    }
    if(el.tagName==='IMG') {el.loading='lazy'; el.decoding='async';}
    if(el.tagName==='A') el.rel='noopener noreferrer';
    if(el.tagName==='TABLE') {const wrap=document.createElement('div'); wrap.className='table-scroll'; el.replaceWith(wrap); wrap.append(el);}
  });
  return template.innerHTML;
}
async function article(posts, founders) {
  const post = posts.find(p=>p.slug===new URLSearchParams(location.search).get('slug'));
  if(!post) return missing('Story not found', 'That story may have moved, or the link may be incomplete.');
  const response = await fetch(post.file);
  if(!response.ok) throw new Error('The article could not be loaded.');
  const source = await response.text();
  const author = founders.find(f=>f.id===post.author);
  const minutes = Math.max(1,Math.ceil(source.split(/\s+/).length/200));
  chrome(post.area);
  document.title = `${post.title} — The AI Spectrum`;
  document.querySelector('meta[name="description"]').content = post.excerpt;
  main.innerHTML = `<article class="article" style="--accent:${areas[post.area].color}"><header class="article-header"><a class="breadcrumb" href="${topicLink(post.area)}">← ${areas[post.area].label}</a><div class="article-labels">${tag(post.area)}${post.sample?'<span class="sample-label">SAMPLE STORY</span>':''}</div><h1>${esc(post.title)}</h1><p class="article-deck">${esc(post.excerpt)}</p><div class="byline">${author?`<a href="founder.html?id=${encodeURIComponent(author.id)}">${esc(author.name)} ↗</a>`:'The AI Spectrum'}<span>${date(post.date)}</span><span>${minutes} min read</span></div></header><figure class="article-cover"><img src="${esc(post.image)}" alt="${esc(post.imageAlt)}" width="720" height="460"></figure><div class="prose">${markdown(source)}</div><div class="article-end"><span>Keep exploring.</span><a class="text-link" href="${topicLink(post.area)}">More on ${areas[post.area].label.toLowerCase()} ↗</a></div></article><section class="latest related"><div class="section-heading"><h2>A different perspective</h2></div><div class="posts-grid related-grid">${posts.filter(p=>p.area!==post.area).slice(0,3).map(p=>card(p)).join('')}</div></section>`;
}
function missing(title='Page not found', message='There’s more to explore. Let’s take you back to the spectrum.', href='index.html', label='Back to home') {
  document.title = `${title} — The AI Spectrum`;
  main.innerHTML = `<section class="error-page"><p class="eyebrow">A DIFFERENT DIRECTION</p><h1>${esc(title)}.</h1><p>${esc(message)}</p><a class="button" href="${href}">${label} →</a></section>`;
}
async function start() {
  chrome();
  if(page==='404') return missing();
  try {
    const [postResponse, siteResponse] = await Promise.all([fetch('content/posts.json'),fetch('content/site.json')]);
    if(!postResponse.ok || !siteResponse.ok) throw new Error('Content unavailable');
    const [posts, site] = await Promise.all([postResponse.json(),siteResponse.json()]);
    posts.sort((a,b)=>b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
    if(page==='home') home(posts);
    else if(areas[page]) theme(page,posts);
    else if(page==='about') about(site.founders);
    else if(page==='founder') founder(site.founders,posts);
    else if(page==='post') await article(posts,site.founders);
    else missing();
  } catch(error) {
    console.error(error);
    missing('Unable to load this page', 'Please reload and try again. If you’re previewing locally, use a local web server as described in the README.');
  }
}
start();
