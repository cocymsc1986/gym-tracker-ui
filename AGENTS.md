# AGENTS.md

Operating notes for AI coding agents working on `gym-tracker-ui`. Read this before making changes.

## TL;DR

- React 19 + Vite SPA. Routing is **wouter**, not React Router. Path alias `@` → `src/app`.
- All API calls go through `src/app/lib/apiClient.ts` (axios). It injects the bearer token and handles 401 → `/login` automatically.
- Auth state lives in `src/app/lib/authContext.tsx`. The user id used in API paths comes from `getUserId()` (decodes the stored Cognito JWT).
- Pages are **pure presentational components**. Data fetching lives in wrapper components in `src/app/components/RouteWrappers.tsx`.
- Before pushing, run: `npm run lint && npm run typecheck && npm test`. CI runs the same three.
- Mobile builds use `mode=mobile`/`mode=mobile-dev` so that Vite emits **relative** asset paths. Don't hardcode absolute paths.

## Repository Map

```
src/
├── main.tsx              # React entry — mounts <App />
└── app/
    ├── App.tsx           # Wouter <Router>, route table, <AuthProvider>
    ├── index.css         # Tailwind v4 imports + theme tokens (colors, fonts)
    ├── app.css           # Legacy CSS leftovers (mostly empty/decorative)
    ├── api/utils/        # Form-data → API payload validators per ExerciseType
    ├── components/
    │   ├── ui/           # shadcn/ui primitives (new-york style); do NOT hand-edit unless adding a new shadcn block
    │   ├── Header.tsx    # Top nav. Returns null when not authenticated.
    │   ├── ProtectedRoute.tsx
    │   ├── RouteWrappers.tsx  # Data-fetch wrappers that feed pure pages
    │   └── ...           # Feature components (Tracker, Activities, Modals, ProgressChart, ...)
    ├── hooks/
    ├── lib/
    │   ├── apiClient.ts  # Axios instance + interceptors
    │   ├── authContext.tsx
    │   ├── jwtValidation.ts   # validateJWT(token) + decodeJWT(token)
    │   ├── getUserId.ts  # Reads username out of stored JWT
    │   └── utils.ts      # cn() — clsx + tailwind-merge
    ├── pages/            # Route-level components
    └── types/            # Workout, Exercise, set/unit enums
```

Path alias `@/* → src/app/*` is configured in `vite.config.ts`, `vitest.config.ts`, and `tsconfig.app.json`. Always import from `@/...` rather than long relative paths.

## Stack & Conventions

| Concern    | Choice                                                            |
| ---------- | ----------------------------------------------------------------- |
| Framework  | React 19 + Vite 6 (TypeScript strict)                             |
| Routing    | `wouter` — `<Router>`, `<Route>`, `<Switch>`, `<Link>`, `useLocation`, `<Redirect>` |
| Styling    | Tailwind CSS v4 via `@tailwindcss/vite`; design tokens in `src/app/index.css` |
| UI Kit     | shadcn/ui (new-york) on Radix; primitives in `components/ui/`     |
| Icons      | `lucide-react`                                                    |
| Forms      | React Hook Form + Zod (`@hookform/resolvers`)                     |
| Tables     | TanStack Table                                                    |
| Charts     | Recharts                                                          |
| Dates      | `date-fns`                                                        |
| HTTP       | Axios (`apiClient`)                                               |
| Auth       | AWS Cognito (`amazon-cognito-identity-js`, `aws-jwt-verify`)      |
| Mobile     | Capacitor 8 (iOS + Android)                                       |
| Tests      | Vitest + Testing Library + jsdom                                  |
| Lint       | ESLint flat config (`eslint.config.js`) with typescript-eslint, react-hooks, react-refresh, vitest plugins |

Conventions:

- Components use **named exports** (e.g. `export function Login()`), except for `App` which is a default export.
- Files in `pages/` are kept presentational; they receive data via props and emit callbacks. Avoid putting fetch calls directly in pages.
- New shared UI primitives belong in `components/ui/`. Anything feature-specific belongs in `components/`.
- Tailwind classes only. Use design tokens (`bg-primary-dark`, `font-headline`, `bg-surface-low`, etc.) rather than raw hex.
- `cn(...)` is the className combiner; use it whenever you merge static + conditional classes.
- Do **not** add a `README` to a subfolder — there's a single repo-level README + this file.

## Routing (wouter)

`src/app/App.tsx` defines the full route table. To add a route:

1. Add a `pages/MyThing.tsx` (presentational).
2. If it needs data, add a `MyThingWithData` wrapper in `components/RouteWrappers.tsx` that fetches and renders the page.
3. Register the route inside the `<Switch>` in `App.tsx`. Wrap in `<ProtectedRoute>` if it requires auth.
4. Use `<Link href="/...">` for navigation and `useLocation()` for programmatic navigation:

   ```ts
   const [, setLocation] = useLocation();
   setLocation("/workouts");
   ```

5. URL params come through the render-prop form:

   ```tsx
   <Route path="/workout/:id">
     {(params) => <WorkoutWithData workoutId={params.id} />}
   </Route>
   ```

`<ProtectedRoute>` (`components/ProtectedRoute.tsx`) shows a spinner while `isInitializing || isValidating` is true and redirects to `/login` otherwise.

## Data Fetching Pattern

There is **no global query/caching layer** (no React Query, no SWR). Each data-fetching wrapper in `RouteWrappers.tsx` does its own `useEffect` + `useState`. Keep that pattern for consistency.

The contract is:

- **`*WithData` wrapper** owns `loading`, `data`, fetch effects, and mutation handlers.
- **Page component** (`Dashboard`, `Workouts`, `Workout`) is a pure render of `props`.
- Mutations call `apiClient` and update local state optimistically; refetch via a `loadData()` callback when a full refresh is needed (see `WorkoutWithData.handleDuplicateExercise`).

When adding a new fetched route, follow this shape:

```tsx
export function MyPageWithData({ id }: { id: string }) {
  const [data, setData] = useState<Foo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const userId = getUserId();
      if (!userId) { setLoading(false); return; }
      try {
        const res = await apiClient.get(`/foo/${userId}/${id}`);
        if (res.status === 200) setData(res.data);
      } catch (e) {
        console.error("Error fetching foo:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Spinner />;
  return <MyPage data={data} />;
}
```

## API Client

`src/app/lib/apiClient.ts` exports a configured axios instance. **All HTTP requests must go through it** — never call `axios` directly. Key behaviour:

- **Base URL resolution**:
  1. `VITE_CAPACITOR_API_URL` if running natively
  2. `VITE_API_URL`
  3. `http://localhost:8080` (web only fallback)
  4. Throws on native if (1) is missing.
- **Request interceptor**: attaches `Authorization: Bearer <token>` from `localStorage["gym-tracker-tokens"]` unless one is already set.
- **Response interceptor**: on `401`, clears tokens and redirects to `/login` (unless already there).

User id for API paths comes from `getUserId()`, which decodes the stored JWT (the validation is already done by `AuthProvider`). Always guard with `if (!userId) return;`.

## Auth

- `AuthProvider` (`lib/authContext.tsx`) wraps the whole app in `App.tsx`.
- Storage key is `gym-tracker-tokens` (export `TOKEN_STORAGE_KEY`).
- Validation uses `CognitoJwtVerifier` against `VITE_COGNITO_USER_POOL_ID` / `VITE_COGNITO_CLIENT_ID`.
- `useAuth()` returns `{ isAuthenticated, tokens, setTokens, logout, isValidating, isInitializing, userPayload }`. `isAuthenticated` is only true once the JWT has been verified.
- The login flow calls `apiClient.post("/auth/signin", ...)` and writes the returned `{ access_token, refresh_token, expires_in }` via `setTokens(...)`.
- Special case: if Cognito returns `WaitPeriodNotYetEndedJwkError` (JWKS rate limit during dev), validation temporarily treats the token as valid using a local decode. Don't "fix" this without understanding it.

## Forms & Exercise Types

`src/app/api/utils/exerciseValidator.ts` contains the canonical `FormData` → typed payload translation for each `ExerciseType` (`WEIGHTS`, `BODY_WEIGHT`, `CARDIO`, `OTHER`). When you add a new field to an exercise:

1. Update the matching interface in `exerciseValidator.ts`.
2. Update the `validate<Type>` function to read it from `FormData`.
3. Update the form UI under `components/` (modals + `AddSets.tsx`).
4. Update `types/Exercise.ts` if the shape is exposed to other components.
5. Add/extend tests in `exerciseValidator.test.ts`.

`WeightItem` is shared between weights and bodyweight; bodyweight just hides `weight` and `unit` in the UI but keeps them in the payload to stay backend-compatible (see `AddSets.tsx` for the rationale).

## Styling System

- Tailwind v4 with the new `@theme` block lives in `src/app/index.css`. Tokens include `surface-{lowest,low,high,highest}`, `primary-dark`, headline font (`Space Grotesk`), body font (`Manrope`). Light + dark variants are defined.
- Use the `font-headline` utility for the "KINETIC" / heading typography.
- shadcn/ui components live under `components/ui/` (see `components.json` — style `new-york`, base colour `red`, no CSS variables prefix, alias `@/components/ui`). To add a new shadcn component, prefer running the shadcn CLI rather than authoring by hand.
- Use `cn(...)` (from `@/lib/utils`) for conditional class merging.

## Mobile / Capacitor

- `capacitor.config.ts` points `webDir` at `build/client`. Always run `npm run cap:sync` (or one of the `build:mobile:*` scripts that chains it) after a relevant change before opening Xcode/Android Studio.
- `vite.config.ts` sets `base: './'` only for `mode=mobile` and `mode=mobile-dev`. That's required for `file://` loading inside the native shell. Don't change this without understanding why.
- For real-device testing, set `VITE_CAPACITOR_API_URL` in `.env.local` to your dev machine's LAN IP. The app cannot reach `localhost` from a simulator/device.

## Testing

- Vitest config: `vitest.config.ts` — jsdom environment, setup file `vitest.setup.ts` (polyfills `pointerCapture`, `scrollIntoView`, `IntersectionObserver` for Radix components).
- Test files live next to the code: `Foo.tsx` ↔ `Foo.test.tsx`.
- Globals are enabled (`describe`, `it`, `expect` available without import). Vitest plugin is registered in eslint config for test files.
- Common mocks (see `pages/Login.test.tsx` for the canonical pattern):

  ```ts
  vi.mock("wouter", () => ({
    Link: ({ children, href, ...p }: any) => <a href={href} {...p}>{children}</a>,
    useLocation: () => ["/login", mockSetLocation],
  }));
  vi.mock("@/lib/authContext", () => ({ useAuth: () => ({ ... }) }));
  vi.mock("@/lib/apiClient", () => ({ apiClient: { post: vi.fn() } }));
  ```
- Use `@testing-library/user-event` over `fireEvent`.
- Tests must pass under jsdom — don't introduce real network calls or unguarded `window` access.

## Lint / Typecheck / Test

Run these locally before pushing — CI fails on any of them:

```bash
npm run lint
npm run typecheck   # tsc --noEmit against tsconfig.app.json
npm test            # vitest run
```

ESLint config (`eslint.config.js`) ignores `dist/`, `build/`, `.react-router/**`. The `@typescript-eslint/no-unused-vars` rule allows `_`-prefixed names. The `react-refresh/only-export-components` rule may complain if you export non-components from a component file — extract to a sibling file rather than disabling.

## Environment & Modes

Vite is built with multiple modes:

| Mode          | Triggered by                | `base` | Notes                       |
| ------------- | --------------------------- | ------ | --------------------------- |
| `development` | `npm run dev`, `build:dev`  | `/`    | Default                     |
| `production`  | `npm run build`             | `/`    | Web prod build              |
| `mobile-dev`  | `npm run build:mobile:dev`  | `./`   | Capacitor dev build         |
| `mobile`      | `npm run build:mobile:prod` | `./`   | Capacitor prod build        |

Env files are loaded by Vite per standard conventions: `.env`, `.env.local`, `.env.<mode>`, `.env.<mode>.local`. **Only `VITE_*` variables reach the client.** `.env-example` (note the hyphen) is the committed template.

## Backend / API Endpoints (selected)

User id segments are the Cognito `username` from the JWT.

- `POST /auth/signup`, `POST /auth/signin`
- `GET /workouts/:userId`, `GET /workouts/:userId/:workoutId`
- `POST /workouts/:userId` → returns `{ workoutId }`
- `DELETE /workouts/:userId/:workoutId`
- `POST /workouts/:userId/:workoutId/exercises/:exerciseId`
- `DELETE /workouts/:userId/:workoutId/exercises/:exerciseId`
- `GET /exercises/:userId`
- `POST /exercises/:userId` (payload includes a client-generated `exerciseId` UUID)
- `DELETE /exercises/:userId/:exerciseId`

Exercise IDs are generated client-side with `crypto.randomUUID()` (see `RouteWrappers.tsx`).

## Deployment

- Hosting: S3 (static) + CloudFront, fronted by Route 53 + ACM in `us-east-1`.
- IaC: `terraform/` (see `deploy.md`).
- CI: `.github/workflows/deploy.yml`. On push to `main`, runs `lint`/`typecheck`/`test`, then builds with Cognito + API env vars from secrets, syncs `build/client/` to S3, and invalidates CloudFront. **You should not invoke deploys manually**; let `main` do it.

## Do / Don't

**Do**

- Use `apiClient`, never raw axios/fetch.
- Use `getUserId()` for the URL user segment; guard `null`.
- Add data-fetching in `RouteWrappers.tsx`-style wrappers; keep pages presentational.
- Use `@/` imports.
- Run lint + typecheck + tests before commit.
- Stick to wouter's API (`useLocation`, `<Link>`, `<Redirect>`).

**Don't**

- Add React Router DOM, Next.js, React Query, Redux, or other "obvious" deps without discussion — the codebase is intentionally small.
- Edit `components/ui/*` cosmetically. They are shadcn outputs; treat as generated code unless you're adding a new primitive.
- Put auth-token state in component state. Use `useAuth()`.
- Hardcode API URLs. Use the env-driven `apiClient`.
- Change Vite `base` for non-mobile modes.

## Stubbed Mode (`mode=mock`) — QA / Docker

A fully external-dependency-free runtime exists for QA agents and offline work. Two pieces:

1. **`VITE_MOCK_AUTH=true`** (set automatically by `.env.mock` when building with `--mode mock`).
   - `src/app/lib/jwtValidation.ts` short-circuits Cognito verification to a local `decodeJWT` + expiry check.
   - `src/app/lib/apiClient.ts` returns `baseURL: ""` so all axios calls become same-origin relative URLs.
2. **`mock-server/server.mjs`** — plain-Node http server (no new deps). Serves the built SPA out of `build/client/` and implements every endpoint the app calls against an in-memory store seeded from `mock-server/fixtures.mjs`.

### Running it

```bash
npm run mock:start          # build + serve on :8080
# or
npm run docker:qa           # build image, run container on :8080
```

### Test endpoints (QA-only)

Gated on `ALLOW_TEST_ENDPOINTS` (default `true`):

- `POST /__test__/reset` — restore initial fixtures (use between agent runs).
- `GET  /__test__/state`  — dump the current in-memory state.
- `GET  /__test__/token`  — mint a fresh `qa-user` access token without going through the UI.

### Auth in mock mode

- The mock server issues unsigned `alg: none` JWTs containing `{ sub: "qa-user", username: "qa-user", exp: now+1h, ... }`.
- The signature is ignored: client-side validation is `decodeJWT` only when `VITE_MOCK_AUTH=true`.
- Any email/password combination succeeds on `/auth/signin`.
- The seeded fixtures are scoped to the `qa-user` userId — that's the username the JWT decodes to and the segment used in `/workouts/:userId/...` paths.

### Adding new endpoints

If you add a new `apiClient.*` call:

1. Add a matching route to the `routes` array in `mock-server/server.mjs`. Use the existing `match(pattern, pathname)` helper for `:params`.
2. If it returns new shapes that the dashboard expects, add or update seed entries in `mock-server/fixtures.mjs`.
3. Don't forget the user-scoped store (`getWorkouts(userId)` / `getExercises(userId)`).
4. Smoke test with `curl http://localhost:8080/your-new-endpoint`.

### Things NOT to do in mock mode

- Don't try to validate against a real Cognito pool — the mock JWT has no signature.
- Don't hardcode `qa-user` in the SPA. Always use `getUserId()` so the production flow stays intact.
- Don't add the mock server to the production Docker / S3 deploy. It is only built into the `gym-tracker-ui-qa` image and is gitignored from any deploy bundle.

## Working in Claude Code Sessions

When this repo is opened in a Claude Code on the web session, the session is configured with a **dedicated development branch** (passed in the task brief, e.g. `claude/<slug>`). Develop on that branch, commit with descriptive messages, and push with `git push -u origin <branch>`. **Do not push to `main`.** Do not open a PR unless the user explicitly asks for one.
