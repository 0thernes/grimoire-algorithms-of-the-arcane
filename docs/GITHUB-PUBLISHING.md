# GitHub Publishing Plan

## Current Local State

- Catalog version: `0.9.13-local`
- Static site: `index.html`, `style.css`, `viz.js`, `catalog.json`
- GitHub Pages workflow: `.github/workflows/pages.yml`
- Pages action pins: `actions/checkout@v6`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`
- Local Git repository: initialized on `main`
- Public remote: `https://github.com/0thernes/grimoire-algorithms-of-the-arcane.git`
- Public repository: `https://github.com/0thernes/grimoire-algorithms-of-the-arcane`
- Public Pages URL: `https://0thernes.github.io/grimoire-algorithms-of-the-arcane/`

## Published Status

The folder has been committed, pushed, and deployed through the GitHub Pages workflow.

Latest verified deployment:

```text
workflow: Deploy GitHub Pages
run: https://github.com/0thernes/grimoire-algorithms-of-the-arcane/actions/runs/28727003236
commit: c854b6ea50c7ef23cb92ff657e64f7aeaac69235
result: success
```

## Reproducible Publish Sequence

```powershell
git init
git branch -M main
git add .
git commit -m "Prepare GRIMOIRE algorithm atlas for GitHub Pages"
gh repo create 0thernes/grimoire-algorithms-of-the-arcane --public --source . --remote origin --push
gh repo edit 0thernes/grimoire-algorithms-of-the-arcane --description "GRIMOIRE: 1000 algorithm atlas with visual, sonic, source, and 50-language implementation matrix scaffold"
gh api -X POST repos/0thernes/grimoire-algorithms-of-the-arcane/pages -f build_type=workflow
```

The first workflow attempt ran before Pages was enabled and failed at `configure-pages`. After `build_type=workflow` was enabled, the same run was rerun and completed successfully.

## Pages Evidence

GitHub Pages publishes static HTML, CSS, JavaScript, Markdown, and JSON files from a GitHub repository. The current workflow copies the static runtime files, root docs, license/notice/contribution/security/citation files, `docs/`, `implementations/`, and `bibliography/` into the Pages artifact.

The local artifact and static-readiness audits check both the copied payload and the current Pages action pins before publication.

Live HTTP evidence on 2026-07-05:

```text
GET https://0thernes.github.io/grimoire-algorithms-of-the-arcane/ -> 200
title contains GRIMOIRE
```
