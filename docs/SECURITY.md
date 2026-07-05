# Security

## Threat Model

GRIMOIRE is a static educational/creative coding site. It has no login, no backend, no database, no cookies, no analytics, no payments, no form submission, and no secret-bearing runtime configuration.

## Current Controls

- Runtime files are local and relative.
- No CDN scripts or remote font requests are required.
- Web Audio is synthesized locally from deterministic record metadata.
- `.nojekyll` is an empty sentinel for GitHub Pages.
- The Pages workflow only copies static files and docs into a generated `gh-pages` branch.
- `catalog.json` is static generated metadata and contains no secrets, accounts, tokens, analytics identifiers, or user data.
- No account, credential, OAuth, billing, SSH, deploy-key, or cloud settings are mutated by local QA.

## Data Handling

The app stores no user data. Browser interaction state is transient: active volume, visible cards, canvas animation frames, audio unlock state, and Web Audio voices.

## Current Evidence

- `output/playwright/network-static-audit-summary.json`: zero external runtime URLs.
- `output/playwright/static-readiness-audit-summary.json`: required static files present and `.nojekyll` empty.
- `output/playwright/browser-console-audit-summary.json`: zero actionable console entries and zero page errors.
- `output/playwright/catalog-export-audit-summary.json`: exported catalog has 1000 records and `source-class-only` bibliography status for all records.

## Non-Claims

This project is not a cryptographic library, not a security control, and not a production implementation of the cryptographic algorithms it names. Crypto records are explanatory atlas entries with source-class context.

## Future Hardening

- Add a LICENSE and SECURITY policy if the project becomes a public repository.
- Add a generated dependency-free asset manifest for Pages deploy review.
- Add per-record bibliography before making inventor, date, deployment, or primary-user claims.
