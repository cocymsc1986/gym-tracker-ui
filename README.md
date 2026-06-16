# Gym Tracker UI (Kinetic)

A React + Vite single-page app for tracking gym workouts and progress. The product brand surfaced in the UI is **KINETIC**; the repo / package name remains `gym-tracker-ui`. The app also ships to iOS and Android via Capacitor.

## Features

- Email/password auth backed by AWS Cognito (JWT validated client-side)
- Dashboard with weekly tracker and progress charts
- Workout CRUD with per-exercise sets (weights, bodyweight, cardio, "other")
- Duplicate workouts and exercises
- Responsive web UI + native iOS/Android shells via Capacitor

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Routing**: [wouter](https://github.com/molefrog/wouter) (lightweight client-side routing)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **UI Components**: shadcn/ui (new-york style) on top of Radix UI primitives
- **Forms**: React Hook Form + Zod
- **Tables/Charts**: TanStack Table, Recharts
- **HTTP**: Axios with auth interceptors
- **Auth**: `amazon-cognito-identity-js` + `aws-jwt-verify`
- **Mobile**: Capacitor 8 (iOS + Android)
- **Testing**: Vitest + Testing Library + jsdom
- **Language**: TypeScript (strict)

## Prerequisites

- Node.js **22** (see `.nvmrc`; CI also runs against Node 20). Use `nvm use` to match.
- npm (committed `package-lock.json`)
- A running backend API (the Go gym-tracker API) — defaults to `http://localhost:8080`
- For mobile work: Xcode (iOS) and/or Android Studio

## Getting Started

1. Clone and install:

   ```bash
   git clone git@github.com:cocymsc1986/gym-tracker-ui.git
   cd gym-tracker-ui
   nvm use
   npm install
   ```

2. Set up environment variables (note the **hyphen** in the example file name):

   ```bash
   cp .env-example .env
   ```

   Then fill in your Cognito values. See [Environment Variables](#environment-variables) below.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app will be available at <http://localhost:5173>.

   The backend API is expected on `http://localhost:8080` by default. If that's not where yours runs, set `VITE_API_URL` in `.env`.

## Environment Variables

All variables are read at build time via `import.meta.env.*` (Vite). They must be prefixed with `VITE_` to be exposed to the client.

| Variable                      | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `VITE_API_URL`                | Backend API base URL (default: `http://localhost:8080`)                 |
| `VITE_CAPACITOR_API_URL`      | API URL used only when running inside a native (Capacitor) shell        |
| `VITE_COGNITO_USER_POOL_ID`   | AWS Cognito user pool ID (used by `aws-jwt-verify`)                     |
| `VITE_COGNITO_CLIENT_ID`      | AWS Cognito app client ID                                               |

API URL resolution lives in `src/app/lib/apiClient.ts`:

1. If running on native (Capacitor) **and** `VITE_CAPACITOR_API_URL` is set, that wins.
2. Otherwise `VITE_API_URL`.
3. Otherwise (web only) it falls back to `http://localhost:8080`.
4. On native with no Capacitor URL configured, the client throws — `.env.local` must be set for mobile dev.

## Available Scripts

| Script                       | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| `npm run dev`                | Start Vite dev server                                         |
| `npm run build`              | Production web build (output: `build/client/`)                |
| `npm run build:dev`          | Build using `mode=development`                                |
| `npm run build:mobile:dev`   | Build for native dev (`mode=mobile-dev`) and run `cap sync`   |
| `npm run build:mobile:prod`  | Build for native prod (`mode=mobile`) and run `cap sync`      |
| `npm run cap:sync`           | `npx cap sync` (copies the web build into native projects)    |
| `npm run cap:open:ios`       | Open the iOS project in Xcode                                 |
| `npm run cap:open:android`   | Open the Android project in Android Studio                    |
| `npm run cap:run:ios`        | Mobile prod build then `cap run ios`                          |
| `npm run cap:run:android`    | Mobile prod build then `cap run android`                      |
| `npm run preview`            | Serve the production build locally                            |
| `npm run lint`               | ESLint                                                        |
| `npm run typecheck`          | `tsc --noEmit` against `tsconfig.app.json`                    |
| `npm test`                   | Vitest (jsdom)                                                |
| `npm run build:mock`         | Build the SPA with mock auth/API baked in (`mode=mock`)       |
| `npm run mock:server`        | Run the in-process mock API + static server (needs prior build) |
| `npm run mock:start`         | `build:mock` then `mock:server` — full local QA stack         |
| `npm run docker:build`       | Build the QA Docker image (`gym-tracker-ui-qa`)               |
| `npm run docker:run`         | Run the QA image, mapping host `:8080`                        |
| `npm run docker:qa`          | Build + run the QA image                                      |

CI (`.github/workflows/deploy.yml`) runs `lint`, `typecheck`, and `test` on every push / PR, then deploys `main` to S3 + CloudFront.

## Project Structure

```
src/
├── main.tsx                       # React entry; mounts <App />
└── app/
    ├── App.tsx                    # Wouter <Router>, route table, <AuthProvider>
    ├── app.css / index.css        # Tailwind v4 + design tokens
    ├── api/utils/                 # Form -> API payload validators (exercise types)
    ├── components/
    │   ├── ui/                    # shadcn/ui primitives (button, card, dialog, ...)
    │   ├── Header.tsx             # KINETIC header (only renders when authed)
    │   ├── ProtectedRoute.tsx     # Auth gate
    │   ├── RouteWrappers.tsx      # Data-fetching wrappers around page components
    │   └── ...                    # Feature components (Tracker, Activities, modals, etc.)
    ├── hooks/                     # Custom hooks (e.g. useGetUserId)
    ├── lib/
    │   ├── apiClient.ts           # Axios instance + 401 interceptor
    │   ├── authContext.tsx        # JWT-aware AuthProvider / useAuth
    │   ├── jwtValidation.ts       # Cognito JWT verify + decode helpers
    │   ├── getUserId.ts           # Read user id from stored token
    │   └── utils.ts               # Tailwind cn() helper
    ├── pages/                     # Route-level components (Login, Dashboard, Workout, ...)
    └── types/                     # Workout / Exercise type definitions
```

Path alias: `@/*` → `src/app/*` (configured in `vite.config.ts`, `vitest.config.ts`, and `tsconfig.app.json`).

## Routes

| Path                | Public | Component                                  |
| ------------------- | ------ | ------------------------------------------ |
| `/login`            | Yes    | `pages/Login`                              |
| `/register`         | Yes    | `pages/Register`                           |
| `/forgot-password`  | Yes    | `pages/ForgotPassword`                     |
| `/`                 | No     | `Dashboard` (wrapped by `DashboardWithData`)  |
| `/workouts`         | No     | `Workouts` (wrapped by `WorkoutsWithData`)   |
| `/workout`          | No     | `AddWorkout`                               |
| `/workout/:id`      | No     | `Workout` (wrapped by `WorkoutWithData`)     |
| _anything else_     | —      | 404 fallback                               |

Protected routes are wrapped in `<ProtectedRoute>`, which waits for token validation and redirects to `/login` if unauthenticated.

## Authentication

- Tokens are stored in `localStorage` under the key `gym-tracker-tokens`.
- `AuthProvider` (`src/app/lib/authContext.tsx`) loads tokens on mount and validates them against Cognito (`aws-jwt-verify`).
- `apiClient` attaches `Authorization: Bearer <token>` automatically and clears storage + redirects to `/login` on a 401.
- `getUserId()` decodes the stored JWT to retrieve `username` for use in API paths (e.g. `/workouts/:userId`).

## Mobile Development (Capacitor)

The app ships native iOS and Android shells via Capacitor (`capacitor.config.ts`, `appId: com.cocymsc1986.gymtracker`). The web bundle is built into `build/client/` and copied into the native projects by `cap sync`.

### 1. Find your dev machine IP

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### 2. Configure `.env.local` (gitignored)

```bash
VITE_CAPACITOR_API_URL=http://192.168.1.XXX:8080
```

This is required when running on a real device or simulator — the native shell cannot reach `localhost` on your dev machine.

### 3. Build and run

```bash
# Dev build (source maps, mobile mode)
npm run build:mobile:dev

# Prod build
npm run build:mobile:prod

# Open in IDE
npm run cap:open:ios
npm run cap:open:android

# Or build + run on a device/simulator
npm run cap:run:ios
npm run cap:run:android
```

### 4. Verify the API connection

1. Run the app in the simulator/emulator.
2. Inspect via Safari (iOS) or `chrome://inspect` (Android).
3. You should see: `[API Client] Using API URL: http://[YOUR_IP]:8080`.
4. Try login/registration to confirm connectivity.

### Troubleshooting

- **Network Error**: `.env.local` missing or wrong IP.
- **Connection Refused**: Backend not listening on `:8080` or not on the same network.
- **Native build path breakage**: Vite uses `base: './'` for `mode=mobile*` (relative paths needed for `file://`), and `base: '/'` for web. If you see broken asset paths after a mobile build, double-check the build mode.

## API Integration

The app talks to the Go backend (`gym-tracker-api`). Selected endpoints:

- `POST /auth/signup`, `POST /auth/signin` — Cognito-backed auth
- `GET /workouts/:userId`, `GET /workouts/:userId/:workoutId`
- `POST /workouts/:userId`, `DELETE /workouts/:userId/:workoutId`
- `POST /workouts/:userId/:workoutId/exercises/:exerciseId`
- `GET /exercises/:userId`, `POST /exercises/:userId`, `DELETE /exercises/:userId/:exerciseId`

## Stubbed Mode (QA / Docker)

For QA agents, E2E tests, and offline development there is a fully stubbed mode that runs the SPA with **no external dependencies** — no backend API, no AWS Cognito. Everything (auth, workouts, exercises) is served by a tiny in-process mock server with seeded fixtures.

### Run via Docker (recommended for QA)

```bash
npm run docker:build
npm run docker:run    # listens on http://localhost:8080
# or
npm run docker:qa     # build + run
```

The container serves the SPA and the mock API from the same origin on port 8080.

### Run without Docker

```bash
npm run mock:start    # builds with mode=mock, then runs the mock server
# afterwards just:
npm run mock:server
```

### What's stubbed

- **Auth**: `mode=mock` sets `VITE_MOCK_AUTH=true`, which short-circuits Cognito JWT verification (`src/app/lib/jwtValidation.ts`) to a local decode. The mock server signs unsigned `alg: none` tokens for `qa-user`. Any email/password combination succeeds.
- **API**: `apiClient` uses an empty (same-origin) `baseURL` in mock mode. The mock server (`mock-server/server.mjs`) implements every route the app calls — `/auth/*`, `/workouts/*`, `/exercises/*` — backed by an in-memory store seeded from `mock-server/fixtures.mjs` (2 workouts, 4 exercises, user id `qa-user`).

### QA helper endpoints

Gated by `ALLOW_TEST_ENDPOINTS=true` (default in the Docker image):

| Endpoint                  | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `POST /__test__/reset`    | Restore the initial fixture state            |
| `GET  /__test__/state`    | Dump current in-memory state                 |
| `GET  /__test__/token`    | Mint a fresh QA access token (skip the UI)   |

Set `ALLOW_TEST_ENDPOINTS=false` to disable them.

### Configuration

| Env var                  | Default               | Purpose                                       |
| ------------------------ | --------------------- | --------------------------------------------- |
| `PORT`                   | `8080`                | Port the mock server listens on               |
| `STATIC_ROOT`            | `build/client`        | Directory served as the SPA                   |
| `ALLOW_TEST_ENDPOINTS`   | `true`                | Toggle the `/__test__/*` helpers              |

## Deployment

Production hosting is S3 + CloudFront, provisioned with Terraform (see [`deploy.md`](./deploy.md) and `terraform/`). The `Build and Deploy` workflow builds on push to `main`, syncs `build/client/` to S3, and invalidates CloudFront.

## Contributing

1. Branch off `main` (Claude Code sessions develop on a per-session branch — see `AGENTS.md`).
2. Make your change and add tests where appropriate.
3. Run `npm run lint && npm run typecheck && npm test` locally before pushing.
4. Open a PR — CI runs the same three commands.

Agents working in this repo should read [`AGENTS.md`](./AGENTS.md) first.

## License

Private and proprietary.
