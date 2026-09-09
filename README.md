# The AI Spectrum

A static single-page publication designed for GitHub Pages.

## Deploy

1. Put all files in the root of the `theaispectrum.github.io` repository.
2. In GitHub, enable Pages from the repository root / main branch.
3. The site assumes it is served at `https://theaispectrum.github.io/`.

## Clean routing

Internal navigation uses the History API. GitHub Pages sends direct deep-link requests to `404.html`; that file validates known routes and blog slugs, then returns valid routes to the SPA. Unknown addresses remain on the custom themed 404 page.

## Publishing a blog post

1. Add a Markdown file to `/blog/`.
2. Add an entry to `/blog/index.json`.
3. Set `category` to exactly one of:
   - `implementation-of-ai`
   - `using-ai-efficiently`
   - `ai-impact`
4. The public URL is automatically `/blogs/{category}/{slug}`.

No query parameter is needed.
