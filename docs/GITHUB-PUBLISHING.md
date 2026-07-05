# GitHub Publishing Plan

## Current Local State

- Catalog version: `0.9.13-local`
- Static site: `index.html`, `style.css`, `viz.js`, `catalog.json`
- GitHub Pages workflow: `.github/workflows/pages.yml`
- Pages action pins: `actions/checkout@v6`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`
- Local Git repository: not initialized at generation time
- Public remote: not configured at generation time

## Publishing Blocker

This folder must be connected to a GitHub repository before it can be committed and pushed. The authenticated GitHub CLI account can publish, but the local directory currently has no `.git` metadata and no `origin` remote.

## Recommended Repository Name

```text
grimoire-algorithms-of-the-arcane
```

## Safe Publish Sequence

```powershell
git init
git branch -M main
git add .
git commit -m "Prepare GRIMOIRE algorithm atlas for GitHub Pages"
gh repo create 0thernes/grimoire-algorithms-of-the-arcane --public --source . --remote origin --push
gh repo edit 0thernes/grimoire-algorithms-of-the-arcane --description "GRIMOIRE: 1000 algorithm atlas with visual, sonic, source, and 50-language implementation matrix scaffold"
```

After push, enable or verify GitHub Pages Actions deployment for the repository.

## Pages Evidence

GitHub Pages publishes static HTML, CSS, JavaScript, Markdown, and JSON files from a GitHub repository. The current workflow copies the static runtime files, root docs, license/notice/contribution/security/citation files, `docs/`, `implementations/`, and `bibliography/` into the Pages artifact.

The local artifact and static-readiness audits check both the copied payload and the current Pages action pins before publication.
