/* Edit content/posts.json to add articles; content/site.json to edit the team. */
const areas = {
    environment: {
        number: '01',
        label: 'Environment',
        full: 'Environmental costs of AI',
        color: '#b6cb85',
        question: 'What does intelligence cost the planet?',
        description:
            'The energy, water, and materials behind the digital world. We look beyond the interface to understand AI’s environmental footprint.',
    },
    'physical-ai': {
        number: '02',
        label: 'Physical AI',
        full: 'Physical implementation of AI',
        color: '#dfa57c',
        question: 'What is AI actually built on?',
        description:
            'Chips, memory, servers, and data centres. We explore the physical infrastructure that makes AI possible, from the processor to the systems that keep it running.',
    },
    productivity: {
        number: '03',
        label: 'Productivity',
        full: 'AI for productivity',
        color: '#99b9df',
        question: 'Can we work better, not just faster?',
        description:
            'Useful workflows, thoughtful experiments, and a little healthy skepticism. We explore how AI can help us do meaningful work while keeping our judgment in the loop.',
    },
    cognition: {
        number: '04',
        label: 'Human cognition',
        full: 'AI’s negative impacts on human cognition',
        color: '#bb9edb',
        question: 'What do we lose when we stop thinking?',
        description:
            'The quieter costs of convenience. We examine overreliance, weakened critical thinking, and what happens when we hand too much of our mental work to machines.',
    },
};
// Font Awesome Free 6.7.2, bundled locally; see vendor/fontawesome/LICENSE.txt.
const icon = (direction = 'right') =>
    `<svg class="icon icon-${direction}" aria-hidden="true" focusable="false"><use href="vendor/fontawesome/arrows.svg#arrow-${['up-right', 'down-right'].includes(direction) ? 'right' : direction}"></use></svg>`;
const thumbnail = (post) => post.thumbnail || post.image || `assets/${post.area}.svg`;
const heroImage = (post) => post.heroImage || thumbnail(post);
const heroAlt = (post) => post.heroImageAlt || post.thumbnailAlt || post.imageAlt || '';
const main = document.querySelector('#main');
let page = 'home';
let navigationId = 0;
let contentData;
let articleRequest;
const articleCache = new Map();
const esc = (value) =>
    String(value ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
const date = (value) =>
    new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
const topicLink = (key) => `/${key}`;
const postLink = (post) => `/posts/${encodeURIComponent(post.slug)}`;
const founderSlug = (f) =>
    f.slug ||
    f.name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
const founderLink = (f) => `/about/${encodeURIComponent(founderSlug(f))}`;
const tag = (key) =>
    `<span class="tag" style="--accent:${areas[key].color}"><span aria-hidden="true"></span>${areas[key].label}</span>`;

function chrome(active = page) {
    document.querySelector('#header').innerHTML =
        `<div class="header-inner"><a class="brand" href="/" aria-label="The AI Spectrum home"><img src="assets/favicon.svg" width="33" height="33" alt=""><span>The AI Spectrum<span class="brand-period">.</span></span></a><nav aria-label="Main navigation"><a href="/" ${active === 'home' ? 'aria-current="page"' : ''}>Home</a>${Object.entries(
            areas,
        )
            .map(
                ([key, a]) =>
                    `<a href="${topicLink(key)}" ${active === key ? 'aria-current="page"' : ''}>${a.label}</a>`,
            )
            .join(
                '',
            )}<a href="/about" ${active === 'about' || active === 'founder' ? 'aria-current="page"' : ''}>About us</a></nav></div>`;
    document.querySelector('#footer').innerHTML =
        `<div class="footer-top"><a class="brand" href="/"><img src="assets/favicon.svg" width="28" height="28" alt="">The AI Spectrum.</a><p>More perspectives. Better questions.</p><a class="text-link" href="/about">Meet the people behind it <span aria-hidden="true">${icon('up-right')}</span></a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} The AI Spectrum</span><span>An independent, four-perspective publication</span><a href="#header">Back to top ${icon('up')}</a></div>`;
}
function card(post) {
    return `<article class="post-card" style="--accent:${areas[post.area].color}"><a class="card-image" href="${postLink(post)}" tabindex="-1" aria-hidden="true"><img src="${esc(thumbnail(post))}" alt="" loading="lazy" width="720" height="460"><span class="image-arrow">${icon('up-right')}</span></a><div class="card-copy"><div class="card-meta">${tag(post.area)}<span>${date(post.date)}</span></div><h3><a href="${postLink(post)}">${esc(post.title)}</a></h3><p>${esc(post.excerpt)}</p><a class="text-link" href="${postLink(post)}" aria-label="Read ${esc(post.title)}">Read the story <span aria-hidden="true">${icon('up-right')}</span></a></div></article>`;
}
function home(posts) {
    main.innerHTML = `<section class="hero"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> AN INDEPENDENT LOOK AT ARTIFICIAL INTELLIGENCE</p><h1>There’s more<br>to AI than<br><em>the algorithm.</em></h1><p class="hero-intro">A tool. A footprint. A physical foundation.<br>A shift in how we think.</p><p class="hero-description">We explore the full spectrum of artificial intelligence — what it makes possible, and what it asks of us.</p><a class="button" href="#perspectives">Explore the spectrum <span aria-hidden="true">${icon('down-right')}</span></a></div>${prismMarkup(areas)}</section><section class="perspectives" id="perspectives"><div class="section-heading"><p class="eyebrow">THE FOUR PERSPECTIVES</p><p>Follow a question. Find a different angle.</p></div><div class="perspective-grid">${Object.entries(
        areas,
    )
        .map(
            ([key, a]) =>
                `<a class="perspective" href="${topicLink(key)}" style="--accent:${a.color}"><div class="perspective-top"><span>${a.number} /</span><span aria-hidden="true">${icon('up-right')}</span></div><h2>${a.label}</h2><p>${a.question}</p><span class="perspective-bottom">Explore the theme <span aria-hidden="true">${icon('right')}</span></span></a>`,
        )
        .join(
            '',
        )}</div></section><section class="latest"><div class="section-heading"><div><p class="eyebrow">NOTES FROM ACROSS THE SPECTRUM</p><h2>The latest thinking<span class="brand-period">.</span></h2></div><span class="small-note">Four themes. An open mind.</span></div><div class="posts-grid">${posts.map((p) => card(p)).join('')}</div></section><section class="motive"><p class="eyebrow">WHY WE’RE HERE</p><h2>Curiosity over hype.<br><em>Understanding over assumptions.</em></h2><div><p>AI is becoming part of everyday life. We believe understanding it means looking at the whole picture: the resources it consumes, the systems it powers, the work it changes, and the habits it shapes.</p><p>This is our space to ask better questions, connect different perspectives, and make a complex subject a little more human.</p><a class="text-link" href="/about">The people behind the questions <span aria-hidden="true">${icon('up-right')}</span></a></div></section>`;
}
function theme(key, posts) {
    const a = areas[key];
    const stories = posts.filter((p) => p.area === key);
    document.title = `${a.label} — The AI Spectrum`;
    document.querySelector('meta[name="description"]').content = a.description;
    main.innerHTML = `<section class="theme-banner" style="--accent:${a.color}">
    <div class="banner-grain" aria-hidden="true"></div>
    <div class="banner-inner">
      <a class="breadcrumb" href="/#perspectives">${icon('left')} All perspectives</a>
      <div class="banner-heading"><div><p class="eyebrow">PERSPECTIVE ${a.number} / FOUR</p><h1>${a.label}<span>.</span></h1><p class="banner-subtitle">${a.full}</p></div><span class="banner-number" aria-hidden="true">${a.number}</span></div>
      <div class="banner-bottom"><h2>${a.question}</h2><p>${a.description}</p></div>
    </div>
  </section><section class="latest theme-latest" style="--accent:${a.color}"><div class="section-heading"><h2>Latest stories</h2><div class="article-count" aria-label="${stories.length} ${stories.length === 1 ? 'article' : 'articles'}"><strong>${String(stories.length).padStart(2, '0')}</strong><span>${stories.length === 1 ? 'article' : 'articles'}</span></div></div><div class="posts-grid topic-posts">${stories.map((p) => card(p)).join('') || '<p>New perspectives are on their way. Check back soon.</p>'}</div></section>`;
}
function about(founders) {
    document.title = 'About us — The AI Spectrum';
    main.innerHTML = `<section class="about-intro"><p class="eyebrow">THE PEOPLE BEHIND THE PERSPECTIVES</p><h1>Four minds.<br><em>A wider view.</em></h1><div><p>We’re a team of four, connected by a shared curiosity about artificial intelligence and the world it’s changing.</p><p>Each of us follows a different thread. Together, we want to look beyond easy answers — and create a space where useful ideas and difficult questions can sit side by side.</p></div></section><section class="team-section"><div class="section-heading"><h2>Meet the team<span class="brand-period">.</span></h2><p>Select a portrait to read their story ${icon('up-right')}</p></div><div class="team-grid">${founders.map((f) => `<a class="person-card" href="${founderLink(f)}" style="--accent:${areas[f.area].color}"><div class="portrait-wrap"><img src="${esc(f.image)}" alt="${esc(f.imageAlt)}" width="600" height="700"><span class="portrait-link">Read my story ${icon('up-right')}</span></div><div class="person-meta">${tag(f.area)}<h3>${esc(f.name)}</h3><p>${esc(f.line)}</p></div></a>`).join('')}</div></section><section class="editorial"><p class="eyebrow">OUR EDITORIAL APPROACH</p><h2>Look closely.<br>Ask honestly.</h2><div><p>We aim to explain clearly, link to our sources, and distinguish evidence from opinion. A promising application can have real costs; a serious concern can still deserve careful scrutiny.</p><p>We’re here to keep learning, and to bring you into that process.</p></div></section>`;
}
function founder(founders, posts, slug) {
    const f = founders.find((f) => founderSlug(f) === slug);
    if (!f) return missing('Profile not found', 'This team member’s page doesn’t exist.', '/about', 'Meet the team');
    document.title = `${f.name} — The AI Spectrum`;
    main.innerHTML = `<section class="profile" style="--accent:${areas[f.area].color}"><a class="breadcrumb" href="/about">${icon('left')} Meet the team</a><p class="eyebrow">ONE MIND BEHIND THE SPECTRUM</p><h1>${esc(f.name)}</h1><p class="profile-line">${esc(f.line)}</p><img class="profile-image" src="${esc(f.image)}" alt="${esc(f.imageAlt)}" width="600" height="700">${tag(f.area)}<div class="profile-bio">${markdown(f.bio.join('\n\n'))}</div></section><section class="latest"><div class="section-heading"><h2>Stories by ${esc(f.name)}</h2></div><div class="posts-grid topic-posts">${
        posts
            .filter((p) => p.author === f.id)
            .map((p) => card(p))
            .join('') || '<p>New stories are on their way.</p>'
    }</div></section>`;
}
// Markdown is authored in this repository, never submitted by site visitors.
// Remove executable HTML and unsafe URLs as an additional publishing safeguard.
function markdown(source) {
    const template = document.createElement('template');
    template.innerHTML = marked.parse(source, { gfm: true });
    template.content
        .querySelectorAll('script,style,iframe,object,embed,form,input,button,link,meta,base,svg,math')
        .forEach((el) => el.remove());
    template.content.querySelectorAll('*').forEach((el) => {
        for (const attr of [...el.attributes]) {
            if (attr.name.startsWith('on') || ['style', 'srcdoc', 'srcset', 'id', 'name'].includes(attr.name))
                el.removeAttribute(attr.name);
            if (['href', 'src', 'xlink:href', 'action'].includes(attr.name)) {
                try {
                    if (!['https:', 'http:', 'mailto:'].includes(new URL(attr.value, document.baseURI).protocol))
                        el.removeAttribute(attr.name);
                } catch {
                    el.removeAttribute(attr.name);
                }
            }
        }
        if (el.tagName === 'IMG') {
            el.loading = 'lazy';
            el.decoding = 'async';
        }
        if (el.tagName === 'A') el.rel = 'noopener noreferrer';
        if (el.tagName === 'TABLE') {
            const wrap = document.createElement('div');
            wrap.className = 'table-scroll';
            el.replaceWith(wrap);
            wrap.append(el);
        }
    });
    return template.innerHTML;
}
async function article(posts, founders, slug, ticket) {
    const post = posts.find((p) => p.slug === slug);
    if (!post) return missing('Story not found', 'That story may have moved, or the link may be incomplete.');
    let source = articleCache.get(post.file);
    if (!source) {
        articleRequest = new AbortController();
        const response = await fetch(post.file, { signal: articleRequest.signal });
        if (!response.ok) throw new Error('The article could not be loaded.');
        source = await response.text();
        articleCache.set(post.file, source);
    }
    if (ticket !== navigationId) return;
    const author = founders.find((f) => f.id === post.author);
    const minutes = Math.max(1, Math.ceil(source.split(/\s+/).length / 200));
    chrome(post.area);
    document.title = `${post.title} — The AI Spectrum`;
    document.querySelector('meta[name="description"]').content = post.excerpt;
    main.innerHTML = `<article class="article" style="--accent:${areas[post.area].color}"><header class="article-header"><a class="breadcrumb" href="${topicLink(post.area)}">${icon('left')} ${areas[post.area].label}</a><div class="article-labels">${tag(post.area)}${post.sample ? '<span class="sample-label">SAMPLE STORY</span>' : ''}</div><h1>${esc(post.title)}</h1><p class="article-deck">${esc(post.excerpt)}</p><div class="byline"><span>By ${author ? `<a href="${founderLink(author)}">${esc(author.name)} ${icon('up-right')}</a>` : 'The AI Spectrum'}</span><span>${date(post.date)}</span><span>${minutes} min read</span></div></header><figure class="article-cover"><img src="${esc(heroImage(post))}" alt="${esc(heroAlt(post))}" width="720" height="460"></figure><div class="prose">${markdown(source)}</div><div class="article-end"><span>Keep exploring.</span><a class="text-link" href="${topicLink(post.area)}">More on ${areas[post.area].label.toLowerCase()} ${icon('up-right')}</a></div></article><section class="latest related"><div class="section-heading"><h2>A different perspective</h2></div><div class="posts-grid related-grid">${posts
        .filter((p) => p.area !== post.area)
        .slice(0, 3)
        .map((p) => card(p))
        .join('')}</div></section>`;
}
function missing(
    title = 'A little outside the spectrum',
    message = 'This page slipped out of view. Pick a perspective below, or follow the light back home.',
    href = '/',
    label = 'Back to the spectrum',
    code = '404',
) {
    document.title = `${code === '404' ? 'Page not found' : title} — The AI Spectrum`;
    main.innerHTML = `<section class="error-page"><div class="error-art" aria-hidden="true"><span class="error-digit">4</span><div class="error-orbit"><div class="error-prism"></div><span></span><span></span><span></span><span></span></div><span class="error-digit">4</span></div><div class="error-copy"><p class="eyebrow">${code === '404' ? '404 / SIGNAL NOT FOUND' : 'SIGNAL INTERRUPTED'}</p><h1>${esc(title)}<span>.</span></h1><p>${esc(message)}</p><a class="button" href="${href}">${label} ${icon('right')}</a></div><div class="error-perspectives">${Object.entries(
        areas,
    )
        .map(
            ([key, a]) =>
                `<a href="${topicLink(key)}" style="--accent:${a.color}"><span>${a.number} / ${a.label}</span>${icon('up-right')}</a>`,
        )
        .join('')}</div></section>`;
}

// Client-side navigation; published route shells also support direct visits.
function currentRoute() {
    let path;
    try {
        path = decodeURIComponent(location.pathname).replace(/\/+$/, '') || '/';
    } catch {
        return { page: '404' };
    }
    const params = new URLSearchParams(location.search);
    let canonical = path;
    if (path === '/index.html') canonical = '/';
    else if (path === '/about.html') canonical = '/about';
    else if (path === '/post.html') canonical = `/posts/${params.get('slug') || ''}`;
    else if (path === '/founder.html') {
        const f = contentData.founders.find((f) => f.id === params.get('id'));
        canonical = f ? founderLink(f) : '/about/unknown';
    } else if (path.endsWith('.html') && areas[path.slice(1, -5)]) canonical = path.slice(0, -5);
    if (canonical !== location.pathname || location.search) {
        history.replaceState(history.state, '', canonical + location.hash);
    }
    if (canonical === '/') return { page: 'home' };
    if (areas[canonical.slice(1)]) return { page: canonical.slice(1) };
    if (canonical === '/about') return { page: 'about' };
    const founderMatch = canonical.match(/^\/about\/([^/]+)$/);
    if (founderMatch) return { page: 'founder', slug: founderMatch[1] };
    const postMatch = canonical.match(/^\/posts\/([^/]+)$/);
    if (postMatch) return { page: 'post', slug: postMatch[1] };
    return { page: '404' };
}
let historyKey = history.state?.key || crypto.randomUUID();
const scrollPositions = new Map();
history.replaceState({ ...history.state, key: historyKey }, '');
history.scrollRestoration = 'manual';

async function renderRoute({ initial = false, restoreScroll } = {}) {
    const ticket = ++navigationId;
    articleRequest?.abort();
    cleanupEffects();
    document.body.classList.add('is-routing');
    main.setAttribute('aria-busy', 'true');
    try {
        const route = currentRoute();
        page = route.page;
        document.body.dataset.page = page;
        main.classList.toggle('theme-page', Boolean(areas[page]));
        document.title = 'The AI Spectrum — A wider view of intelligence';
        document.querySelector('meta[name="description"]').content =
            'Four perspectives on artificial intelligence: its footprint, physical infrastructure, usefulness, and influence on how we think.';
        chrome(page);
        const { posts, founders } = contentData;
        if (page === 'home') home(posts);
        else if (areas[page]) theme(page, posts);
        else if (page === 'about') about(founders);
        else if (page === 'founder') founder(founders, posts, route.slug);
        else if (page === 'post') await article(posts, founders, route.slug, ticket);
        else missing();
        if (ticket !== navigationId) return;
    } catch (error) {
        if (error.name === 'AbortError' || ticket !== navigationId) return;
        console.error(error);
        missing(
            'We lost the signal',
            'This story could not be loaded. Try again in a moment, or explore another perspective.',
            '/',
            'Back to home',
            'offline',
        );
    } finally {
        if (ticket === navigationId) {
            main.removeAttribute('aria-busy');
            document.body.classList.remove('is-routing');
        }
    }
    if (ticket !== navigationId) return;
    if (!initial) main.focus({ preventScroll: true });
    // Give browser layout one frame before restoring a reading position.
    requestAnimationFrame(() => {
        if (ticket !== navigationId) return;
        const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
        if (restoreScroll !== undefined) window.scrollTo({ top: restoreScroll, behavior: 'instant' });
        else if (target) target.scrollIntoView({ behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
        initializeEffects();
        document.querySelector('#route-status').textContent = document.title;
    });
}
function navigate(url) {
    scrollPositions.set(historyKey, window.scrollY);
    historyKey = crypto.randomUUID();
    history.pushState({ key: historyKey }, '', url.pathname + url.search + url.hash);
    renderRoute();
}
document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
    )
        return;
    const raw = link.getAttribute('href');
    if (!raw) return;
    const url = raw.startsWith('#') ? new URL(location.pathname + raw, location.origin) : new URL(link.href);
    if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
    // Leave image, Markdown, and other file downloads to the browser.
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return;
    event.preventDefault();
    if (url.pathname === location.pathname && !url.search) {
        const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;
        if (target) {
            history.replaceState(history.state, '', url.pathname + url.hash);
            target.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            });
            if (raw === '#main') main.focus({ preventScroll: true });
        } else if (!url.hash) window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    navigate(url);
});
window.addEventListener('popstate', () => {
    scrollPositions.set(historyKey, window.scrollY);
    historyKey = history.state?.key || crypto.randomUUID();
    renderRoute({ restoreScroll: scrollPositions.get(historyKey) || 0 });
});
async function start() {
    chrome();
    try {
        const responses = await Promise.all([fetch('/content/posts.json'), fetch('/content/site.json')]);
        if (responses.some((response) => !response.ok)) throw new Error('Content unavailable');
        const [posts, site] = await Promise.all(responses.map((response) => response.json()));
        posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
        contentData = { posts, founders: site.founders };
        await renderRoute({ initial: true });
    } catch (error) {
        console.error(error);
        missing(
            'We lost the signal',
            'Please reload to reconnect with the spectrum.',
            '/',
            'Try the home page',
            'offline',
        );
    }
}
start();
