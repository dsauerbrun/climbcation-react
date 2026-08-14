# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server on port 5001
npm run build      # Production build
npm test           # Run tests (Jest, watch mode)
```

The backend API proxy is configured to `https://localhost:3000` in `package.json`, so the Rails/backend server must be running separately on that port.

## Architecture

**Climbcation** is a React SPA for discovering climbing vacation destinations. Users can search/filter climbing locations, view them on a map, and see location details.

### Key Files

- `src/App.tsx` — Route definitions (React Router v5)
- `src/common/useAuth.tsx` — Auth context + hook (login, signup, logout, password reset)
- `src/components/useFilterParams.tsx` — Filter state management hook
- `src/components/useLocationsFetcher.tsx` — Data fetching hook with infinite scroll pagination
- `src/classes/FilterParams.ts` — Filter state model (climbing type, grades, dates, map bounds, etc.)
- `src/classes/Location.ts` — Location data model and TypeScript interfaces

### Routes

| Path | Component |
|------|-----------|
| `/` or `/home` | `Home.tsx` — main search/discovery page |
| `/location/:slug` | `Location.tsx` — detailed location view |
| `/new-location` | `NewLocation.tsx` — location submission form |
| `/profile` | `Profile.tsx` |
| `/login`, `/signup` | `Login.tsx` (modal-based) |

### State Management

- **Auth:** Context API via `useAuth` hook — wraps the whole app
- **Filters:** `useFilterParams` hook in `Home.tsx` — manages all filter state, passed down as props
- **Locations list:** `useLocationsFetcher` hook — fetches from `/api/filter_locations` (POST), handles pagination

### API Layer

The backend is a Rails API. HTTP calls use both Axios and Fetch. Key endpoints:
- `POST /api/filter_locations` — main location search with filter params
- `GET /api/location/:slug` — single location details
- `GET /api/filters` — available filter options (climbing types, grades, etc.)
- `GET /api/user` — current user session

### Styling

SCSS with Bootstrap 4 + Material-UI 4 mixed together. Global styles in `src/importedcss/`. Component-level styles use `.scss` or `.module.scss` files alongside components.

### TypeScript

`tsconfig.json` uses `strict: true` but `noImplicitAny: false`. Mix of `.tsx`/`.ts` and some legacy `.js` files.
