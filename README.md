# The AI Spectrum

A dark, responsive publication built with vanilla HTML, CSS, and JavaScript. No build step, database, accounts, or visitor submissions. Markdown is rendered using a locally bundled copy of Marked (MIT licensed).

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
  "image": "assets/my-cover.jpg",
  "imageAlt": "A specific description of what the cover shows"
}
```

4. Add your cover image to `assets/`. Use the exact path and capitalization in the JSON. Any standard web image format works, including JPG, PNG, WebP, and SVG. Landscape covers around 1400 × 800 pixels work well.
5. Commit and push to `main`. GitHub Pages publishes the updated files. Posts automatically sort by date, newest first, on the home page and their theme page. Keep dates in `YYYY-MM-DD` format. Future dates do not schedule publication: listed posts are visible immediately.

Each post belongs to **exactly one** area. Use one of these values:

| `area` value | Theme |
| --- | --- |
| `environment` | Environmental costs of AI |
| `physical-ai` | Physical implementation of AI |
| `productivity` | AI for productivity |
| `cognition` | AI’s negative impacts on human cognition |

Slugs must be unique; use lowercase letters, numbers, and hyphens. Author IDs refer to `content/site.json`. Remove an article’s object from the list to unpublish it. Set `"sample": true` only if you want the visible sample label.

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
4. Keep the `id` unchanged so author links keep working. Change `area` only to one of the four values above.

Portraits crop to a 6:7 ratio, with the face centered. The same image is used on the About page and the separate centered profile page. If needed, adjust `object-position` for `.portrait-wrap img` and `.profile-image` in `styles.css`.

## Preview locally

Use a local HTTP server; double-clicking HTML files will not allow the browser to fetch the Markdown and JSON. From this folder:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. Any other static web server is also suitable. No install or build is required to publish. Fonts load from Google Fonts, with local fallbacks if unavailable. All illustrations and the Markdown parser are bundled locally.

## GitHub Pages deployment

This repository is named `theaispectrum.github.io`, so its Pages address is **https://theaispectrum.github.io/**.

In GitHub, open **Settings → Pages → Build and deployment**:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

Save. Subsequent pushes to `main` publish automatically. `.nojekyll` ensures the files are served directly. Theme URLs use real HTML files; posts and founder profiles use query parameters, so refresh and direct links work without server routing rules. The custom `404.html` links back to the homepage, including from nested invalid URLs.

## File map

- `index.html` — home page shell
- `environment.html`, `physical-ai.html`, `productivity.html`, `cognition.html` — theme page shells
- `about.html`, `founder.html`, `post.html` — team, profile, and article shells
- `script.js` — page rendering, theme descriptions, and navigation
- `styles.css` — dark theme and responsive layouts
- `content/posts.json` — article index
- `content/posts/*.md` — article bodies
- `content/site.json` — founder names, images, and bios
- `assets/` — original SVG illustrations and your images
- `vendor/` — pinned Marked 15.0.12 parser and its license

The four starter articles are labeled samples. Review or replace them before presenting them as your team’s own writing. Factual sample stories link to their sources, and the cognition article distinguishes reported associations from causal claims.
