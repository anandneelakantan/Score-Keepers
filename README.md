# Scoreboard

Scoreboard app to track game scores. Create multiple named games, track players and
round-by-round scores, and view a ranked leaderboard with medals and rank-change
indicators. All data is stored locally in the browser (IndexedDB) — there is no backend.

Live app: https://anandneelakantan.github.io/Score-Keepers/

## Development

The app lives in [`web/`](web/) and is built with Vite + React + TypeScript.

```sh
cd web
npm install
npm run dev
```

## Testing

End-to-end tests use Playwright and run against a production build:

```sh
cd web
npm run build
npx playwright test
```

## Deployment

Pushing to `main` runs [`.github/workflows/static.yml`](.github/workflows/static.yml),
which builds the app, runs lint + the Playwright suite, and only deploys to GitHub Pages
if everything passes. Pull requests run the same build/lint/test gate via
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).
