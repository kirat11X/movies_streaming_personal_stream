# Personal Stream — Frontend

React 19 + Vite client for [Personal Stream](../README.md). See the root README for
the full stack, API reference and setup; this file covers the frontend only.

## Running

```bash
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev              # http://localhost:5173
```

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint across the project |

The backend must be running on `VITE_API_BASE_URL`, and its `FRONTEND_ORIGIN` must
match this dev server's origin exactly — cookies are rejected otherwise.

## Design system

There is **no UI framework**. Bootstrap and React-Bootstrap were removed; all
styling is hand-written CSS (~39 kB, ~8 kB gzipped).

- `src/index.css` — design tokens (surfaces, brand gradient, text, radii,
  elevation, motion, layout), reset, and the shared primitives: `.btn`, `.chip`,
  `.input`, `.field`, `.notice`, `.empty`, `.shell`, `.page`.
- One CSS file per component, colocated with its `.jsx`.
- Icons are inline SVG in `components/ui/Icon.jsx` — no icon package. Every glyph
  inherits `currentColor`.
- The brand mark is inline SVG in `components/ui/Logo.jsx`.

Prefer extending the tokens in `index.css` over introducing new hard-coded colours.

## Structure

```text
src/
├── api/           axiosConfig (public) · axiosPrivateConfig (credentialed)
├── components/
│   ├── auth/      split-screen shell shared by login + register
│   ├── browse/    search, genre filter, sort — state lives in the URL
│   ├── header/    footer/     app chrome
│   ├── hero/      rows/       spotlight carousel + horizontal rails
│   ├── home/      mylist/     landing page, saved titles
│   ├── movie/     movies/     poster card, detail sheet, responsive grid
│   ├── recommended/           personalised picks page
│   ├── spinner/   notfound/   loader, skeletons, 404
│   ├── stream/    player page with related titles
│   └── ui/        Icon, Logo, PageHeader
├── context/       AuthProvider · MoviesProvider
├── hooks/         useAuth · useMovies · useMyList · useRecommended · useAxiosPrivate
└── utils/         youtube.js (ID extraction) · genres.js (case-insensitive matching)
```

## State

| Concern | Where | Notes |
|---|---|---|
| Session | `AuthProvider` | Restores from `localStorage`, exposes `{ auth, setAuth, loading }` |
| Catalogue | `MoviesProvider` | Fetches `/movies` **once** and shares it, so page changes don't refetch. Also derives the deduplicated genre list |
| Recommendations | `useRecommended` | Calls the protected `/recommended`; keeps the axios instance in a ref because `useAxiosPrivate` returns a new one each render |
| My List / history | `useMyList` | `localStorage`, keyed by `imdb_id`, synced across mounted copies via a custom `ps:storage` event |

## Conventions

- Genre comparisons go through `utils/genres.js` — the catalogue contains casing
  variants (`Sci-Fi` / `Sci-fi`) that must collapse into one filter.
- YouTube IDs go through `utils/youtube.js`, which accepts a bare ID or a full URL
  and returns `''` when it cannot parse one. Guard playback on the result.
- Filter and search state belongs in the URL (`useSearchParams`) so views are
  shareable and the back button works.
- React keys for genres use `genre_name`, not `genre_id` — ids are not unique in
  the data.
