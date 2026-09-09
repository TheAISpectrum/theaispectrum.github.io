const app = document.querySelector('#app');
const nav = document.querySelector('[data-site-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const blogManifestPath = '/blog/index.json';

const categories = {
  'implementation-of-ai': {
    slug: 'implementation-of-ai',
    route: '/implementation-of-ai',
    label: 'AI Infrastructure',
    shortLabel: 'Infrastructure',
    index: '01',
    colorClass: 'infrastructure',
    kicker: 'PHYSICAL IMPLEMENTATION',
    title: 'AI is software with a physical footprint.',
    intro: 'Models feel intangible from a browser window. This section traces them back to the chips, datacenters, networks, power systems, and engineering decisions that make intelligence at scale physically possible.',
    thesis: 'To understand AI, follow the signal all the way down to silicon.',
    image: '/images/datacenter-aisle.png',
    imageAlt: 'Conceptual placeholder for a dark datacenter aisle with ordered server racks.'
  },
  'using-ai-efficiently': {
    slug: 'using-ai-efficiently',
    route: '/using-ai-efficiently',
    label: 'Using AI',
    shortLabel: 'Use',
    index: '02',
    colorClass: 'use',
    kicker: 'PRACTICE & METHOD',
    title: 'Use intelligence without outsourcing yours.',
    intro: 'AI becomes valuable when it is placed deliberately inside a workflow. This section examines prompting, verification, task design, context, iteration, and the difference between faster output and better thinking.',
    thesis: 'The strongest workflow does not ask AI to think instead of you. It decides where AI deserves a role.',
    image: '/images/quiet-ai-workflow.png',
    imageAlt: 'Conceptual placeholder for a person working beside a restrained AI interface.'
  },
  'ai-impact': {
    slug: 'ai-impact',
    route: '/ai-impact',
    label: "AI's Impact",
    shortLabel: 'Impact',
    index: '03',
    colorClass: 'impact',
    kicker: 'CONSEQUENCE & RESPONSIBILITY',
    title: 'Every capability changes something beyond the screen.',
    intro: 'AI systems alter how people work, decide, create, trust, and compete. This section focuses on the negative impacts that can be hidden by convenience: error at scale, displaced labor, weakened privacy, concentrated power, and diluted responsibility.',
    thesis: 'Progress is incomplete if we measure what a system can do but ignore what its use changes.',
    image: '/images/ai-impact-human.png',
    imageAlt: 'Conceptual placeholder showing a human figure facing a large machine intelligence system.'
  }
};

let postsCache = null;

document.body.classList.add('ready');
bootstrap();

async function bootstrap() {
  const redirectedRoute = new URLSearchParams(location.search).get('route');
  if (redirectedRoute) {
    history.replaceState({}, '', redirectedRoute);
  }

  bindNavigation();
  await renderRoute(location.pathname);
}

function bindNavigation() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a.spa-link');
    if (!link) return;

    const url = new URL(link.href, location.origin);
    if (url.origin !== location.origin) return;

    event.preventDefault();
    navigate(url.pathname);
  });

  window.addEventListener('popstate', () => renderRoute(location.pathname));

  menuToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

async function navigate(path) {
  const normalized = normalizePath(path);
  if (normalized === normalizePath(location.pathname)) return;
  history.pushState({}, '', normalized);
  document.body.classList.remove('nav-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  await renderRoute(normalized);
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

async function renderRoute(pathname) {
  const path = normalizePath(pathname);
  app.className = 'app route-loading';
  app.innerHTML = '<div class="route-loader"><span></span><span></span><span></span></div>';

  const posts = await getPosts();
  updateActiveNav(path);

  if (path === '/') return renderHome(posts);
  if (path === '/about') return renderAbout();

  const category = Object.values(categories).find((item) => item.route === path);
  if (category) return renderCategory(category, posts);

  const blogMatch = path.match(/^\/blogs\/(implementation-of-ai|using-ai-efficiently|ai-impact)\/([a-z0-9-]+)$/);
  if (blogMatch) {
    const [, categorySlug, slug] = blogMatch;
    const post = posts.find((item) => item.category === categorySlug && item.slug === slug);
    if (post) return renderArticle(post);
  }

  renderInApp404(path);
}

function normalizePath(path) {
  if (!path) return '/';
  const cleaned = path.replace(/\/{2,}/g, '/').replace(/\/$/, '');
  return cleaned || '/';
}

async function getPosts() {
  if (postsCache) return postsCache;
  try {
    const response = await fetch(blogManifestPath, { cache: 'no-cache' });
    if (!response.ok) throw new Error('Manifest unavailable');
    const manifest = await response.json();
    const manifestUrl = new URL(blogManifestPath, location.origin);

    postsCache = await Promise.all((manifest.posts || []).map(async (post) => {
      const path = new URL(post.path, manifestUrl).href;
      let content = '';
      try {
        const markdownResponse = await fetch(path, { cache: 'no-cache' });
        if (markdownResponse.ok) content = await markdownResponse.text();
      } catch {}

      return {
        ...post,
        path,
        slug: post.slug || post.path.split('/').pop().replace(/\.md$/, ''),
        content,
        readingTime: estimateReadingTime(content || post.excerpt || '')
      };
    }));

    return postsCache.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    postsCache = [];
    return postsCache;
  }
}

function renderHome(posts) {
  setDocumentMeta({
    title: 'The AI Spectrum',
    description: 'The AI Spectrum examines AI infrastructure, intelligent use, and the consequences that follow.',
    canonical: '/'
  });
  app.className = 'app home-page';
  app.innerHTML = `
    <section class="hero content-wide">
      <div class="hero-copy">
        <p class="kicker"><span>INDEPENDENT PUBLICATION</span><span>ISSUE 01 — 2026</span></p>
        <h1>Artificial intelligence is not <em>one story.</em></h1>
        <p class="hero-deck">It is a physical system, a working method, and a force with consequences. <strong>The AI Spectrum</strong> studies all three — because understanding only the interface means understanding only the surface.</p>
        <div class="hero-actions">
          <a class="button-primary spa-link" href="/implementation-of-ai">Enter the spectrum <span aria-hidden="true">→</span></a>
          <a class="text-link spa-link" href="/about">Why we publish <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="spectrum-index" aria-label="The three editorial lenses">
        ${Object.values(categories).map((category) => `
          <a class="spectrum-row spa-link ${category.colorClass}" href="${category.route}">
            <span class="spectrum-number">${category.index}</span>
            <span class="spectrum-line"></span>
            <span class="spectrum-name">${category.shortLabel}</span>
            <span class="spectrum-arrow" aria-hidden="true">↗</span>
          </a>`).join('')}
      </div>
    </section>

    <section class="editorial-statement content-wide ruled-section">
      <div class="section-label"><span>OUR PREMISE</span><span>01 / 04</span></div>
      <div class="statement-grid">
        <h2>The interface is only the <span class="accent-word">visible edge</span> of AI.</h2>
        <div class="statement-copy">
          <p>A chatbot can look simple enough to disappear into a tab. Behind it are semiconductor supply chains, datacenters, energy demand, carefully designed workflows, institutional choices, and human consequences.</p>
          <p>We publish across that entire chain. The aim is not to make AI sound more complicated. It is to make the complexity <em>legible.</em></p>
        </div>
      </div>
    </section>

    <section class="lenses content-wide ruled-section">
      <div class="section-label"><span>THREE LENSES</span><span>02 / 04</span></div>
      <div class="lens-grid">
        ${Object.values(categories).map((category) => renderLensCard(category)).join('')}
      </div>
    </section>

    <section class="feature-essay content-wide ruled-section">
      <div class="section-label"><span>WHY THIS MATTERS</span><span>03 / 04</span></div>
      <div class="feature-layout">
        <figure class="feature-visual">
          <img src="/images/spectrum-system.png" alt="Conceptual placeholder showing three interconnected layers: infrastructure, use, and impact." />
          <figcaption><span>FIG. 01</span> One technology; three levels of interpretation.</figcaption>
        </figure>
        <div class="feature-copy">
          <p class="mini-kicker">READING THE WHOLE SYSTEM</p>
          <h2>Capability without context is a partial truth.</h2>
          <p>AI is often discussed through isolated headlines: a new chip, a new model, a faster workflow, a new risk. The separation is convenient, but misleading. Infrastructure shapes capability. Capability changes use. Use creates impact.</p>
          <p>That relationship is the central visual and editorial idea of this publication: <strong>the spectrum is continuous.</strong></p>
          <a class="text-link spa-link" href="/about">Read our editorial approach <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>

    <section class="latest content-wide ruled-section">
      <div class="section-label"><span>LATEST FIELD NOTES</span><span>04 / 04</span></div>
      <div class="latest-grid">
        ${posts.slice(0, 3).map((post, index) => renderPostCard(post, index === 0)).join('') || '<p class="empty-state">No posts published yet.</p>'}
      </div>
    </section>
  `;
}

function renderLensCard(category) {
  return `
    <a class="lens-card spa-link ${category.colorClass}" href="${category.route}">
      <div class="lens-card-top"><span>${category.index}</span><span>${category.kicker}</span></div>
      <div class="lens-marker" aria-hidden="true"><i></i><i></i><i></i></div>
      <h3>${category.label}</h3>
      <p>${category.intro}</p>
      <div class="lens-card-bottom"><span>Explore the lens</span><span aria-hidden="true">↗</span></div>
    </a>
  `;
}

function renderCategory(category, posts) {
  const categoryPosts = posts.filter((post) => post.category === category.slug);
  setDocumentMeta({
    title: `${category.label} | The AI Spectrum`,
    description: category.intro,
    canonical: category.route
  });
  app.className = `app category-page category-${category.colorClass}`;
  app.innerHTML = `
    <section class="category-hero content-wide">
      <div class="category-heading">
        <p class="kicker"><span>LENS ${category.index}</span><span>${category.kicker}</span></p>
        <h1>${category.title}</h1>
        <p class="category-deck">${category.intro}</p>
      </div>
      <figure class="category-image">
        <img src="${category.image}" alt="${category.imageAlt}" />
        <figcaption><span>VISUAL STUDY ${category.index}</span><span>${category.label.toUpperCase()}</span></figcaption>
      </figure>
    </section>

    <section class="category-thesis content-wide ruled-section">
      <div class="section-label"><span>EDITORIAL LENS</span><span>${category.index} / 03</span></div>
      <blockquote>“${category.thesis}”</blockquote>
    </section>

    <section class="category-posts content-wide ruled-section">
      <div class="section-label"><span>PUBLISHED UNDER THIS LENS</span><span>${String(categoryPosts.length).padStart(2, '0')} ARTICLES</span></div>
      <div class="post-list">
        ${categoryPosts.map((post, index) => renderEditorialRow(post, index + 1)).join('') || '<p class="empty-state">No articles have been published under this lens yet.</p>'}
      </div>
    </section>
  `;
}

function renderPostCard(post, featured = false) {
  const category = categories[post.category];
  return `
    <a class="post-card spa-link ${featured ? 'featured' : ''} ${category?.colorClass || ''}" href="/blogs/${post.category}/${post.slug}">
      <div class="post-card-meta"><span>${category?.shortLabel || post.categoryLabel}</span><time datetime="${post.date}">${formatDate(post.date)}</time></div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="post-card-footer"><span>${post.readingTime} MIN READ</span><span aria-hidden="true">→</span></div>
    </a>
  `;
}

function renderEditorialRow(post, index) {
  return `
    <a class="editorial-row spa-link" href="/blogs/${post.category}/${post.slug}">
      <span class="row-number">${String(index).padStart(2, '0')}</span>
      <span class="row-copy"><strong>${escapeHtml(post.title)}</strong><span>${escapeHtml(post.excerpt)}</span></span>
      <span class="row-meta"><time datetime="${post.date}">${formatDate(post.date)}</time><span>${post.readingTime} MIN</span></span>
      <span class="row-arrow" aria-hidden="true">↗</span>
    </a>
  `;
}

async function renderArticle(post) {
  const category = categories[post.category] || categories['using-ai-efficiently'];
  const content = stripFrontmatter(post.content || '');
  const parsed = window.marked ? marked.parse(content) : basicMarkdown(content);
  const html = window.DOMPurify ? DOMPurify.sanitize(parsed) : parsed;
  const route = `/blogs/${post.category}/${post.slug}`;

  setDocumentMeta({
    title: `${post.title} | The AI Spectrum`,
    description: post.excerpt,
    canonical: route,
    ogType: 'article'
  });

  app.className = `app article-page article-${category.colorClass}`;
  app.innerHTML = `
    <article class="article-shell content-wide">
      <a class="article-back spa-link" href="${category.route}"><span aria-hidden="true">←</span> ${category.label}</a>
      <header class="article-header">
        <div class="article-taxonomy">
          <span class="article-lens">LENS ${category.index}</span>
          <span>${category.kicker}</span>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
        <p class="article-excerpt">${escapeHtml(post.excerpt || '')}</p>
        <div class="article-byline">
          <div><span>WRITTEN BY</span><strong>${escapeHtml(post.author || 'The AI Spectrum')}</strong></div>
          <div><span>PUBLISHED</span><strong>${formatDate(post.date)}</strong></div>
          <div><span>READ TIME</span><strong>${post.readingTime} MIN</strong></div>
          <button type="button" data-copy-post-link aria-label="Copy article link"><i class="fa-solid fa-link" aria-hidden="true"></i><span>Copy link</span></button>
        </div>
      </header>

      <figure class="article-hero-image">
        <img src="${post.featureImage || category.image}" alt="Editorial image for ${escapeHtml(post.title)}" />
        <figcaption><span>THE AI SPECTRUM / ${category.shortLabel.toUpperCase()}</span><span>${formatDate(post.date).toUpperCase()}</span></figcaption>
      </figure>

      <div class="article-layout">
        <aside class="article-rail">
          <span class="rail-label">IN THIS ARTICLE</span>
          <nav data-article-toc aria-label="Article contents"></nav>
          <span class="rail-rule"></span>
          <p>${escapeHtml(category.thesis)}</p>
        </aside>
        <div class="article-content" data-article-content>${html}</div>
      </div>
    </article>
  `;

  if (window.hljs) {
    app.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
  }
  enhanceCodeBlocks();
  enhanceArticleImages(post.path);
  buildTableOfContents();
}

function renderAbout() {
  setDocumentMeta({
    title: 'About Us | The AI Spectrum',
    description: 'The editorial idea, visual language, and team behind The AI Spectrum.',
    canonical: '/about'
  });
  app.className = 'app about-page';
  app.innerHTML = `
    <section class="about-hero content-wide">
      <p class="kicker"><span>ABOUT THE PUBLICATION</span><span>EST. 2026</span></p>
      <h1>We publish where <em>technology meets consequence.</em></h1>
      <div class="about-lede">
        <p><strong>The AI Spectrum</strong> is a publication about artificial intelligence as a complete system — from the hardware that makes it possible, to the methods that make it useful, to the effects that make it consequential.</p>
        <p>Our editorial principle is simple: <em>look past the interface.</em> Every AI interaction sits inside a larger technical and human structure. We make that structure readable without flattening its complexity.</p>
      </div>
    </section>

    <section class="about-principles content-wide ruled-section">
      <div class="section-label"><span>EDITORIAL PRINCIPLES</span><span>01 / 02</span></div>
      <div class="principle-grid">
        <div><span>01</span><h2>Trace the system.</h2><p>Connect visible AI experiences to the infrastructure, incentives, and decisions underneath them.</p></div>
        <div><span>02</span><h2>Keep complexity legible.</h2><p>Readable does not mean reductive. We explain difficult ideas through structure, comparison, and precise language.</p></div>
        <div><span>03</span><h2>Interrogate convenience.</h2><p>When technology removes friction, ask what else it changes: judgment, power, labor, privacy, or responsibility.</p></div>
      </div>
    </section>

    <section class="team content-wide ruled-section">
      <div class="section-label"><span>THE TEAM</span><span>02 / 02</span></div>
      <div class="team-grid">
        ${[1,2,3].map((member) => `
          <article class="member-card">
            <div class="member-image"><img src="/images/member-${String(member).padStart(2, '0')}.svg" alt="Placeholder portrait for team member ${member}" /></div>
            <div class="member-index">0${member}</div>
            <h2>Member Name</h2>
            <p class="member-role">ROLE / TITLE</p>
            <p>Short member description goes here. Replace this with a concise explanation of their perspective, responsibilities, and contribution to The AI Spectrum.</p>
          </article>`).join('')}
      </div>
    </section>
  `;
}

function renderInApp404(path) {
  setDocumentMeta({ title: '404 | The AI Spectrum', description: 'This route could not be found.', canonical: path });
  app.className = 'app inline-404';
  app.innerHTML = `
    <section class="error-page">
      <div class="error-signal" aria-hidden="true"><span>4</span><i></i><span>4</span></div>
      <p class="kicker">SIGNAL LOST // ROUTE NOT FOUND</p>
      <h1>This part of the spectrum is <em>dark.</em></h1>
      <p>The address <code>${escapeHtml(path)}</code> does not map to a published page.</p>
      <a href="/" class="button-primary spa-link">Return to the spectrum <span aria-hidden="true">→</span></a>
    </section>
  `;
}

function updateActiveNav(path) {
  nav?.querySelectorAll('a').forEach((link) => {
    const route = link.dataset.route;
    const active = route === '/' ? path === '/' : path === route || (route !== '/about' && path.startsWith('/blogs/') && path.includes(route.replace('/', '')));
    link.toggleAttribute('aria-current', active);
  });
}

function buildTableOfContents() {
  const content = document.querySelector('[data-article-content]');
  const toc = document.querySelector('[data-article-toc]');
  if (!content || !toc) return;

  const headings = [...content.querySelectorAll('h2, h3')];
  if (!headings.length) {
    toc.innerHTML = '<span>No sections</span>';
    return;
  }

  headings.forEach((heading, index) => {
    const id = heading.id || slugify(heading.textContent || `section-${index + 1}`);
    heading.id = id;
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = heading.tagName === 'H3' ? 'toc-sub' : '';
    link.textContent = heading.textContent;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      heading.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState({}, '', `${location.pathname}#${id}`);
    });
    toc.append(link);
  });
}

function enhanceCodeBlocks() {
  app.querySelectorAll('.article-content pre').forEach((pre) => {
    if (pre.querySelector('[data-copy-code]')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-button';
    button.dataset.copyCode = '';
    button.setAttribute('aria-label', 'Copy code');
    button.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i><span>Copy</span>';
    pre.append(button);
  });
}

function enhanceArticleImages(basePath = location.href) {
  app.querySelectorAll('.article-content img').forEach((image) => {
    const source = image.getAttribute('src');
    if (source && !/^(?:[a-z]+:|#|\/)/i.test(source)) image.src = new URL(source, basePath).href;
    image.classList.add('lightbox-image');
    image.setAttribute('tabindex', '0');
  });
}

document.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;

  const shareButton = event.target.closest('[data-copy-post-link]');
  if (shareButton) {
    await copyText(location.href);
    const old = shareButton.innerHTML;
    shareButton.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Copied</span>';
    setTimeout(() => shareButton.innerHTML = old, 1400);
    return;
  }

  const codeButton = event.target.closest('[data-copy-code]');
  if (codeButton) {
    await copyText(codeButton.closest('pre')?.querySelector('code')?.innerText || '');
    const old = codeButton.innerHTML;
    codeButton.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Copied</span>';
    setTimeout(() => codeButton.innerHTML = old, 1400);
    return;
  }

  const image = event.target.closest('.article-content img');
  if (image) openLightbox(image);
  if (event.target.closest('.article-lightbox button') || event.target.classList.contains('article-lightbox')) closeLightbox();
});

function openLightbox(image) {
  closeLightbox(true);
  const lightbox = document.createElement('div');
  lightbox.className = 'article-lightbox';
  lightbox.innerHTML = `<button type="button" aria-label="Close image">×</button><img src="${image.currentSrc || image.src}" alt="${escapeHtml(image.alt || '')}" />`;
  document.body.append(lightbox);
  requestAnimationFrame(() => lightbox.classList.add('is-open'));
}

function closeLightbox(immediate = false) {
  const lightbox = document.querySelector('.article-lightbox');
  if (!lightbox) return;
  if (immediate) return lightbox.remove();
  lightbox.classList.remove('is-open');
  setTimeout(() => lightbox.remove(), prefersReducedMotion ? 0 : 180);
}

function stripFrontmatter(markdown) {
  return String(markdown || '').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function basicMarkdown(markdown) {
  return String(markdown)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>')
    .split(/\n{2,}/).map((block) => block.startsWith('<h') ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`).join('');
}

function estimateReadingTime(markdown) {
  const text = stripFrontmatter(markdown).replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[#>*_`\[\]()!-]/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function setDocumentMeta({ title, description, canonical, ogType = 'website' }) {
  document.title = title;
  setMeta('description', description, false);
  setMeta('og:title', title, true);
  setMeta('og:description', description, true);
  setMeta('og:type', ogType, true);
  setMeta('og:url', `${location.origin}${canonical}`, true);
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) { tag = document.createElement('link'); tag.rel = 'canonical'; document.head.append(tag); }
  tag.href = `${location.origin}${canonical}`;
}

function setMeta(name, content, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.querySelector(selector);
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute(property ? 'property' : 'name', name); document.head.append(tag); }
  tag.content = content;
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const input = document.createElement('textarea');
  input.value = value; input.readOnly = true; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.append(input); input.select(); document.execCommand('copy'); input.remove();
}
