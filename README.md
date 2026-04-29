# Hidden Signals

Personal academic website for **Xinchun Wang** / **王新春**, a second-year Computer Science and Technology undergraduate at **Shandong Normal University**.

Live site: <https://wang-xinchun.github.io/>

GitHub profile: <https://github.com/wang-xinchun>

Email: <1198383781w@gmail.com>

## Overview

This is a single-page static portfolio focused on undergraduate research in computer vision, camouflaged object detection, remote sensing image super-resolution, and reliable lightweight perception.

The site is designed to make the first screen immediately useful: identity, institution, publication status, Huawei Spark Award challenge work, fast contact links, and representative research evidence are all reachable without a backend or build system.

## Research Highlights

- **KBS SCI Q1**: first-author manuscript under review, focused on constrained test-time adjustment for camouflaged object detection.
- **Neurocomputing SCI Q2**: first-author manuscript under review, focused on lightweight remote sensing image super-resolution.
- **IEEE TGRS SCI Q1**: published paper as third author.
- **Huawei Spark Award enterprise challenge**: active work on 3D SBS video synthesis.

## Site Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Main single-page website content. |
| `styles.css` | Visual system, responsive layout, cards, canvas atmosphere, and page rail. |
| `script.js` | Canvas background, section index, cursor behavior, reveal effects, and card interactions. |
| `assets/avatar-xinchun.png` | Personal avatar image revealed on hover. |
| `assets/emblem-sdnu.png` | Shandong Normal University emblem used in the academic snapshot. |
| `assets/logo-huawei.png` | Huawei logo used in the Spark Award card. |
| `assets/paper-preview-kbs.png` | First-page preview only for the KBS manuscript. |
| `assets/paper-preview-neurocomputing.png` | First-page preview only for the Neurocomputing manuscript. |
| `publish_to_github.sh` | Helper script for publishing the site to GitHub Pages. |

## Privacy Note

The manuscript PDF originals are intentionally **not** published while submissions are under review. Public paper links only show first-page preview images.

## Run Locally

```bash
git clone https://github.com/wang-xinchun/wang-xinchun.github.io.git
cd wang-xinchun.github.io
python -m http.server 6006 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:6006
```

## Deploy

This repository is published with GitHub Pages from the root of the `main` branch.

Recommended personal Pages repository name:

```text
wang-xinchun.github.io
```

Deployment settings:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`

If a GitHub token with repository permissions is available on the server:

```bash
export GITHUB_TOKEN=your_token_here
bash publish_to_github.sh
```

## Maintenance

- Keep file names lowercase and hyphenated.
- Keep public images inside `assets/`.
- Do not commit manuscript PDF originals before formal acceptance.
- Do not commit GitHub tokens, server passwords, or private credentials.
- Use first-page preview images for papers that are still under review.
