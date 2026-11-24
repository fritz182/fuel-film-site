# Fuel-Film website

A plain website with no build step. Open the folder on any static host (Cloudflare Pages, Netlify) and it works.

## Files you will edit

| File | What it controls |
| --- | --- |
| `js/config.js` | Contact email, Instagram / TikTok / YouTube links, the homepage reel |
| `js/projects.js` | Every project: title, client, role, category, link |
| `index.html` | The written copy (hero line, services, about) |

## Common jobs

**Use your own reel file on the homepage**
1. Export a short silent loop (15 to 30 seconds, 1080p, MP4, ideally under 10 MB).
2. Save it as `assets/reel.mp4`.
3. In `js/config.js` set `file: "assets/reel.mp4"`.

**Add a project**
1. Copy any block between `{` and `}` in `js/projects.js` and paste it where you want it to appear.
2. Change the title, client, role, url, host (`youtube`, `vimeo`, `instagram` or `facebook`) and id (the code in the video link).
3. For a thumbnail, save a 16:9 image into `assets/thumbs/` and point `thumb` at it. Without one, the project shows as a text tile.

**Feature a project in "Selected work"**
Add the line `"featured": true,` to its block.

**Categories** (`cat`): `animation`, `docs`, `corporate`, `property`, `interviews`, `social`, `music`, `underwater`, `ai`, `broadcast`.

## Preview on your Mac

In Terminal, from this folder:

```bash
python3 -m http.server 8770
```

Then open http://localhost:8770
