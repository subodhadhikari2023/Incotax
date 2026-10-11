# IncoTax Legal Services – Website

Marketing website for **IncoTax Legal Services**, a tax and legal practice.
Visitors contact the firm through WhatsApp. There is no client login.
A small admin panel lets the firm edit site content.

> **Status:** in development. The project has just been scaffolded and no features are built yet.

## Tech stack

| Area            | Choice                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Framework       | [Next.js](https://nextjs.org) 16 (App Router) with React 19                                             |
| Language        | TypeScript                                                                                              |
| Styling         | Tailwind CSS 4                                                                                          |
| Linting         | ESLint (`eslint-config-next`)                                                                           |
| Hosting         | [Netlify](https://www.netlify.com) (Free plan)                                                          |
| Content storage | One JSON file in [Netlify Blobs](https://docs.netlify.com/blobs/overview/), edited from the admin panel |

There is no separate backend and no database.

## Pages

- Home
- Why IncoTax
- Service detail (one page per service)
- Contact Us
- Legal pages: Terms and Conditions, Privacy Policy, Refund Policy, Disclaimer, Grievance Redressal
- 404
- Admin panel (login and content editor)

## Getting started (Docker)

Development and testing run in Docker, so no local Node.js install is needed. Every service uses
the official Playwright image (Node 24 plus test browsers), the same image CI uses.
Docker is only for local work: Netlify builds and hosts the live site from this repository.

Requirements: Docker with Docker Compose.

```bash
git clone https://github.com/subodhadhikari2023/Incotax.git
cd Incotax
docker compose run --rm app npm ci   # install dependencies (first time and after lockfile changes)
docker compose up app                # dev server with hot reload
```

Then open <http://localhost:3000>.

| Command                                      | What it does                                          |
| -------------------------------------------- | ----------------------------------------------------- |
| `docker compose up app`                      | Starts the dev server on port 3000                    |
| `docker compose run --rm test`               | Runs unit and component tests (Vitest)                |
| `docker compose run --rm e2e`                | Builds the site and runs end-to-end tests             |
| `docker compose run --rm app npm run <name>` | Runs any npm script below inside the container        |
| `docker compose run --rm app npm i -D <pkg>` | Adds a dependency (keeps the lockfile on Node 24/npm) |

After an end-to-end run, the HTML report is in `playwright-report/`.

> The containers run as user `1000:1000` so files they create stay owned by you. If your user
> ID differs, export `UID` and `GID` before running Compose.

## Scripts

| Command                | What it does                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Starts the development server with hot reload                     |
| `npm run build`        | Creates a production build                                        |
| `npm run start`        | Serves the production build (run `build` first)                   |
| `npm run lint`         | Runs ESLint                                                       |
| `npm run format`       | Formats all files with Prettier                                   |
| `npm run format:check` | Checks formatting without changing files                          |
| `npm run typecheck`    | Generates Next.js route types and runs the TypeScript check       |
| `npm test`             | Runs unit and component tests once (Vitest)                       |
| `npm run test:watch`   | Runs Vitest in watch mode                                         |
| `npm run test:e2e`     | Builds the site and runs Playwright tests at 1440, 768 and 390 px |

## Testing

Development is test-first: write a failing test, make it pass, then move on.

- **Unit and component tests:** Vitest with React Testing Library, in jsdom. Test files sit next
  to the code they test as `*.test.ts(x)` under `src/`.
- **End-to-end tests:** Playwright, in `e2e/*.spec.ts`. They run against a production build on
  port 3100 at the three design widths: desktop 1440, tablet 768 and phone 390.

## Conventions

- **Formatting:** Prettier, with Tailwind class sorting. ESLint handles code-quality rules only.
- **Git hooks (Husky):** before each commit, lint-staged lints and formats the staged files;
  commit messages are checked by commitlint.
- **Commit messages:** [Conventional Commits](https://www.conventionalcommits.org), for example
  `feat: add contact form`, `fix: correct footer links`, `docs: update README`.
- **Branches:** `main` is production, and every push to it deploys to Netlify. `dev` is for
  integration. Build each feature on its own branch (`feat/...`, `fix/...`, `chore/...`) and merge
  it through a pull request.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs lint, formatting, type-check, unit
  tests and end-to-end tests on every push to `main` or `dev` and on every pull request.

## Project structure

```
src/
  app/        Routes, layouts and pages (App Router)
e2e/          Playwright end-to-end tests
public/       Static files (logo, icons)
.github/      CI workflow
compose.yaml  Docker setup for development and testing
```

## Environment variables

The admin login needs a password hash and a cookie-signing secret. Store them in a local
`.env.local` file, which git ignores. In production, set them in the Netlify dashboard.
Never commit them. The variable names will be listed here once the admin panel is built.

## Deployment

Netlify deploys the site from this repository:

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: read from `.nvmrc` (24)
- Netlify's Next.js adapter is added automatically and supports Server Actions and Netlify Blobs.

Pushing to `main` triggers a production deploy, and each deploy uses part of the free plan's
monthly credits. Do day-to-day work on `dev` and merge to `main` only for releases.

## License

Copyright © 2026 IncoTax Legal Services. All rights reserved.
This repository is public for reference only. See [LICENSE](LICENSE).
