# GitHub Publishing Plan

## Current Local State

- Catalog version: `0.9.13-local`
- Static site: `index.html`, `style.css`, `viz.js`, `catalog.json`
- GitHub Pages workflow: `.github/workflows/pages.yml`
- Pages workflow markers: `actions/checkout@v7`, `contents: write`, `git checkout -b gh-pages`, `git push --force origin gh-pages`
- Local Git repository: initialized on `main`
- Public remote: `https://github.com/0thernes/grimoire-algorithms-of-the-arcane.git`
- Public repository: `https://github.com/0thernes/grimoire-algorithms-of-the-arcane`
- Public Pages URL: `https://0thernes.github.io/grimoire-algorithms-of-the-arcane/`

## Published Status

The source folder is committed and pushed on `main`. The Pages workflow creates a clean generated `gh-pages` branch from the static artifact, and GitHub Pages should be configured to serve the `gh-pages` branch root.

Verified deployment anchor:

```text
workflow: Publish GitHub Pages
actions: https://github.com/0thernes/grimoire-algorithms-of-the-arcane/actions/workflows/pages.yml
pages: https://0thernes.github.io/grimoire-algorithms-of-the-arcane/
source branch: gh-pages /
result: the live Pages URL returned HTTP 200 during the 2026-07-05 audit.
```

## Reproducible Publish Sequence

```powershell
git init
git branch -M main
git add .
git commit -m "Prepare GRIMOIRE algorithm atlas for GitHub Pages"
gh repo create 0thernes/grimoire-algorithms-of-the-arcane --public --source . --remote origin --push
gh repo edit 0thernes/grimoire-algorithms-of-the-arcane --description "GRIMOIRE: 1000 algorithm atlas with visual, sonic, source, and 50-language implementation matrix scaffold"
gh workflow run pages.yml --ref main
@'
{
  "build_type": "legacy",
  "source": {
    "branch": "gh-pages",
    "path": "/"
  }
}
'@ | gh api -X PUT repos/0thernes/grimoire-algorithms-of-the-arcane/pages --input -
```

The earlier `build_type=workflow` route was retired after `actions/deploy-pages` accepted the artifact but returned an opaque `Deployment failed, try again later.` status on repeated fresh dispatches. The branch-publish route avoids that failing deployment endpoint while keeping the shipped site artifact clean.

## Pages Evidence

GitHub Pages publishes static HTML, CSS, JavaScript, Markdown, and JSON files from a GitHub repository. The current workflow copies the static runtime files, root docs, license/notice/contribution/security/citation files, `docs/`, `implementations/`, and `bibliography/` into the generated `gh-pages` branch.

The local artifact and static-readiness audits check both the copied payload and the current branch-publishing workflow markers before publication.

Live HTTP evidence on 2026-07-05:

```text
GET https://0thernes.github.io/grimoire-algorithms-of-the-arcane/ -> 200
title contains GRIMOIRE
```
