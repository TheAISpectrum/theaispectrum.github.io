# The AI Spectrum

A dark, responsive publication built with vanilla HTML, CSS, and JavaScript. No frontend framework, database, accounts, or visitor submissions. Publishing automatically generates static entry pages for the SPA routes. Markdown is rendered using a locally bundled copy of Marked (MIT licensed).

## Add a blog post

1. Create a file in `content/posts/`, for example `my-new-story.md`.
2. Write your article using Markdown. The title comes from the post list, so start the body with a paragraph or `##` heading.
3. Add one object to the array in `content/posts.json` (remember the comma between objects):

```json
{
  "slug": "my-new-story",
  "title": "My new story",
  "excerpt": "A short introduction shown on the story card.",
  "area": "environment",
  "date": "2026-09-15",
  "author": "founder-1",
  "file": "content/posts/my-new-story.md",
  "thumbnail": "assets/my-thumbnail.jpg",
  "thumbnailAlt": "A description of the thumbnail",
  "heroImage": "assets/my-hero.jpg",
  "heroImageAlt": "A description of the large article image"
}
```

4. Add your thumbnail and hero images to `assets/`. Use the exact paths and capitalization in the JSON. Any standard web image format works, including JPG, PNG, WebP, and SVG. Use landscape thumbnails around 1400 × 800 pixels; wider hero images around 1800 × 750 pixels suit the article layout.
5. Commit and push to `main`. GitHub Pages publishes the updated files. Posts automatically sort by date, newest first, on the home page and their theme page. Keep dates in `YYYY-MM-DD` format. Future dates do not schedule publication: listed posts are visible immediately.

Each post belongs to **exactly one** area. Use one of these values:

| `area` value | Theme |
| --- | --- |
| `environment` | Environmental costs of AI |
| `physical-ai` | AI chips, servers, and data centre infrastructure |
| `productivity` | AI for productivity |
| `cognition` | AI’s negative impacts on human cognition |

Slugs must be unique; use lowercase letters, numbers, and hyphens. Author IDs refer to `content/site.json`. Remove an article’s object from the list to unpublish it. Set `"sample": true` only if you want the visible sample label.

## Replace a blog thumbnail or hero image

In `content/posts.json`, each post has independent image settings:

- `thumbnail`: the image on the home, theme, founder, and related-story cards.
- `thumbnailAlt`: a description of that image.
- `heroImage`: the large image at the top of the individual article.
- `heroImageAlt`: a description of the article image.

Upload your files to `assets/` (or a subfolder), update those paths, then commit and push. You may use the same file for both settings or choose different images. If `heroImage` is omitted, the thumbnail is used. The original `image` and `imageAlt` fields remain supported as fallbacks for older post entries.

The diagrams in `assets/` are **placeholder thumbnails and hero images** for the four sample posts. The theme pages now use full-width tinted typography banners, so no illustration is cropped there. The homepage’s interactive prism is separate and is defined in `effects.js`. Update `thumbnail` and `heroImage` to replace a post’s artwork; the banners and prism are unaffected.

For images inside the article body, use Markdown as shown below.

## Markdown examples

```markdown
## A section heading

A paragraph with **bold text**, *italic text*, and a [source](https://example.com).

![Describe the image for readers](assets/my-photo.jpg)

*Optional caption below the image.*

- One point
- Another point

1. First step
2. Second step

> A quotation or highlighted idea.

---

| Column one | Column two |
| --- | --- |
| Value | Value |
```

Fenced code blocks and nested lists are also supported. Image paths are relative to the **site root**, not the Markdown file: use `assets/photo.jpg`, not `../../assets/photo.jpg`. External image URLs work too. Prefer local images you have permission to publish. Raw HTML is unnecessary; executable HTML and unsafe links are stripped. Only publish trusted Markdown that you have reviewed.

## Replace the founder images and bios

All four people are configured in **`content/site.json`**. The current names, bios, and illustrated portraits are explicitly placeholders.

1. Put each real photo in `assets/founders/`, for example `alex.jpg`.
2. Change that person’s `image` to `assets/founders/alex.jpg` and `imageAlt` to an accurate description.
3. Change `name`, `line` (the single sentence on the About page), and `bio` (one string per paragraph).
4. Keep the `id` unchanged so author associations keep working. Set `slug` to the URL name you want, such as `alex-smith`; their page will be `/about/alex-smith`. Use unique lowercase letters, numbers, and hyphens. Keep this slug stable when editing their display name. Change `area` only to one of the four values above.

Portraits crop to a 6:7 ratio, with the face centered. The same image is used on the About page and the separate centered profile page. If needed, adjust `object-position` for `.portrait-wrap img` and `.profile-image` in `styles.css`.

## Preview locally

Install Node.js if needed, then run these two commands from the project folder:

```sh
node tools/build.mjs
node tools/serve.mjs
```

Open `http://localhost:8000`. No package installation is needed. The first command copies the website into `_site/` and generates entry pages for every theme, founder, and post. Rerun it after edits and refresh the browser. The local server also serves the custom 404 page for unknown paths.

Edit the source files, not `_site/`, which is regenerated and excluded from Git. Fonts load from Google Fonts with local fallbacks. Images, icons, and the Markdown parser are bundled locally.

## Clean URLs and navigation

- Home: `/`
- Themes: `/environment`, `/physical-ai`, `/productivity`, `/cognition`
- About: `/about`
- Founder: `/about/founder-one` (uses the founder’s `slug`)
- Article: `/posts/the-cloud-has-a-footprint` (uses the post’s `slug`)

Links navigate through the History API without a full page reload. Back/forward navigation restores scroll position. Direct visits and refreshes work because publishing generates an `index.html` entry page for each route. GitHub Pages may initially append a trailing slash to a directory URL; the SPA normalizes it to the clean path. Old `.html` and query-parameter links are still recognized and replaced with their clean equivalent.

Unknown routes display the custom 404 screen. Markdown image paths remain relative to the site root (`assets/photo.jpg`) through the page’s root base URL.

## GitHub Pages deployment

The site is published at **https://theaispectrum.github.io/**.

The repository uses **Settings → Pages → Build and deployment → Source: GitHub Actions**. Each push to `main` runs `.github/workflows/pages.yml`, generates the route entry pages, and publishes `_site/`. This happens automatically when you add a post to `content/posts.json` or a founder to `content/site.json`; there are no route files to maintain by hand.

The build checks for invalid/duplicate route slugs and unknown themes or authors. Check the repository’s Actions tab if publication fails. The site remains plain static HTML, CSS, and JavaScript hosted by GitHub Pages.

## Motion and the homepage prism

Drag the “Bend the light” slider to change the rays. Select a theme to isolate its beam and reveal a link into that theme. Reset restores the full spectrum. The controls also work with keyboard and touch. Page entrances, scroll reveals, and hover details respect the visitor’s reduced-motion setting.

## File map

- `index.html` — home page shell
- `environment.html`, `physical-ai.html`, `productivity.html`, `cognition.html` — legacy theme entry points
- `about.html`, `founder.html`, `post.html` — legacy team, profile, and article entry points
- `script.js` — page rendering, theme descriptions, and SPA navigation
- `effects.js` — interactive prism and scroll reveals
- `tools/build.mjs` — static output and route entry generation
- `tools/serve.mjs` — local preview server
- `.github/workflows/pages.yml` — automatic GitHub Pages publishing
- `styles.css` — dark theme and responsive layouts
- `content/posts.json` — article index
- `content/posts/*.md` — article bodies
- `content/site.json` — founder names, images, and bios
- `assets/` — original SVG illustrations and your images
- `vendor/` — pinned Marked 15.0.12 parser and Font Awesome Free 6.7.2 arrow icons, with their licenses

The four starter articles are labeled samples. Review or replace them before presenting them as your team’s own writing. Factual sample stories link to their sources, and the cognition article distinguishes reported associations from causal claims.
