const blogManifestPath = 'blog/index.json';
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const blogList = document.querySelector('[data-blog-list]');
const articleMount = document.querySelector('[data-article-mount]');
const pageIntro = document.querySelector('.page-intro');
const blogLayout = document.querySelector('.blog-layout');

document.body.classList.add('ready');

if (blogList || articleMount) {
    loadBlog();
}

function setArticleState(showArticle) {
    articleMount.classList.toggle('is-visible', showArticle);
    pageIntro?.classList.toggle('is-hidden', showArticle);
    blogLayout?.classList.toggle('is-hidden', showArticle);
    document.body.classList.toggle('article-view', showArticle);
}

async function loadBlog() {
    const posts = await getPosts();
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('post');

    if (slug) {
        const post = posts.find((item) => item.slug === slug);
        if (post) {
            setArticleState(true);
            await renderArticle(post);
            return;
        }
    }

    setArticleState(false);
    renderBlogList(posts);
}

async function getPosts() {
    try {
        const response = await fetch(blogManifestPath);
        if (!response.ok) return [];

        const manifest = await response.json();
        const manifestUrl = new URL(blogManifestPath, window.location.href);

        const posts = await Promise.all(
            (manifest.posts || []).map(async (post) => {
                const path = new URL(post.path, manifestUrl).href;
                let content = '';

                try {
                    const markdownResponse = await fetch(path, { cache: 'no-cache' });
                    if (markdownResponse.ok) content = await markdownResponse.text();
                } catch {
                    content = '';
                }

                return {
                    title: post.title,
                    date: post.date,
                    excerpt: post.excerpt,
                    content,
                    path,
                    slug: post.slug || post.path.split('/').pop().replace(/\.md$/, ''),
                    readingTime: estimateReadingTime(content || post.excerpt || ''),
                };
            }),
        );

        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch {
        return [];
    }
}

function renderBlogList(posts) {
    if (!posts.length) {
        blogList.innerHTML = '<p>No posts published yet.</p>';
        return;
    }

    blogList.innerHTML = posts
        .map(
            (post) => `
        <a class="blog-card" href="./?post=${encodeURIComponent(post.slug)}">
          <span class="blog-card-meta">
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <span>${post.readingTime} min read</span>
          </span>
          <span class="blog-card-copy">
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.excerpt || 'A new essay from Signal & Structure.')}</p>
          </span>
          <span class="blog-card-footer">
            <span>Read essay <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
          </span>
        </a>
      `,
        )
        .join('');
}

async function renderArticle(post) {
    let markdown = post.content || '';

    if (!markdown) {
        try {
            const response = await fetch(post.path, { cache: 'no-cache' });
            if (response.ok) markdown = await response.text();
        } catch {
            markdown = '';
        }
    }

    const content = stripFrontmatter(markdown);
    const parsed = window.marked ? marked.parse(content) : basicMarkdown(content);
    const html = window.DOMPurify ? DOMPurify.sanitize(parsed) : parsed;

    document.title = `${post.title} | Signal & Structure`;
    setMeta('description', post.excerpt || 'A Signal & Structure essay.', false);
    setMeta('og:title', `${post.title} | Signal & Structure`, true);
    setMeta('og:description', post.excerpt || 'A Signal & Structure essay.', true);
    setCanonical(new URL(`./?post=${encodeURIComponent(post.slug)}`, window.location.href).href);

    articleMount.innerHTML = `
    <a class="article-back-link" href="./">
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      <span>Back to all essays</span>
    </a>

    <header>
      <time class="article-date" datetime="${post.date}">${formatDate(post.date)}</time>
      <h1>${escapeHtml(post.title)}</h1>
      <p>${escapeHtml(post.excerpt || '')}</p>
      <div class="article-meta-row">
        <span class="article-read-time">${post.readingTime} min read</span>
        <div class="article-toolbar">
          <button class="article-share-button" type="button" data-copy-post-link aria-label="Copy article link">
            <i class="fa-solid fa-link" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </header>

    <div class="article-content">${html}</div>
  `;

    if (window.hljs) {
        articleMount.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
    }

    enhanceCodeBlocks();
    enhanceArticleImages(post.path);
    articleMount.classList.add('is-visible');
}

function enhanceCodeBlocks() {
    articleMount.querySelectorAll('.article-content pre').forEach((pre) => {
        if (pre.querySelector('[data-copy-code]')) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy-button';
        button.dataset.copyCode = '';
        button.setAttribute('aria-label', 'Copy code');
        button.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>';
        pre.append(button);
    });
}

function enhanceArticleImages(basePath = window.location.href) {
    articleMount.querySelectorAll('.article-content img').forEach((image) => {
        const source = image.getAttribute('src');
        if (source && !/^(?:[a-z]+:|#|\/)/i.test(source)) {
            image.src = new URL(source, basePath).href;
        }

        image.classList.add('lightbox-image');
        image.setAttribute('tabindex', '0');
    });
}

function stripFrontmatter(markdown) {
    return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function basicMarkdown(markdown) {
    return markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/^### (.*)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*)$/gm, '<h1>$1</h1>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .split(/\n{2,}/)
        .map((block) => (block.startsWith('<h') ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`))
        .join('');
}

function estimateReadingTime(markdown) {
    const text = stripFrontmatter(markdown)
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#>*_`\[\]()!-]/g, ' ');

    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 225));
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function setMeta(name, content, property = false) {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let tag = document.querySelector(selector);

    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(property ? 'property' : 'name', name);
        document.head.appendChild(tag);
    }

    tag.setAttribute('content', content);
}

function setCanonical(url) {
    let tag = document.querySelector('link[rel="canonical"]');

    if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', 'canonical');
        document.head.appendChild(tag);
    }

    tag.setAttribute('href', url);
}

async function copyText(value) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
}

document.addEventListener('click', async (event) => {
    if (!(event.target instanceof Element)) return;

    const shareButton = event.target.closest('[data-copy-post-link]');
    if (shareButton) {
        await copyText(window.location.href);
        const icon = shareButton.querySelector('i');
        if (icon) {
            icon.className = 'fa-solid fa-check';
        }
        window.setTimeout(() => {
            if (icon) icon.className = 'fa-solid fa-link';
        }, 1400);
        return;
    }

    const codeButton = event.target.closest('[data-copy-code]');
    if (codeButton) {
        await copyText(codeButton.closest('pre')?.querySelector('code')?.innerText || '');
        codeButton.classList.add('is-copied');
        codeButton.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
        window.setTimeout(() => {
            codeButton.classList.remove('is-copied');
            codeButton.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>';
        }, 1400);
        return;
    }

    const image = event.target.closest('.article-content img');
    if (image) {
        openLightbox(image);
        return;
    }

    if (event.target.closest('.article-lightbox button') || event.target.classList.contains('article-lightbox')) {
        closeLightbox();
    }
});

function openLightbox(image) {
    closeLightbox(true);
    const lightbox = document.createElement('div');
    lightbox.className = 'article-lightbox';
    lightbox.innerHTML = `
    <button type="button" aria-label="Close image"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    <img src="${image.currentSrc || image.src}" alt="${escapeHtml(image.alt || '')}" />
  `;

    document.body.append(lightbox);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => lightbox.classList.add('is-open'));
    });
}

function closeLightbox(skipAnimation = false) {
    const lightbox = document.querySelector('.article-lightbox');
    if (!lightbox) return;

    if (skipAnimation) {
        lightbox.remove();
        return;
    }

    lightbox.classList.remove('is-open');
    window.setTimeout(() => lightbox.remove(), prefersReducedMotion ? 0 : 220);
}
