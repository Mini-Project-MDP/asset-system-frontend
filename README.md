# Asset System Frontend

A single-page web application for an **asset management system** — the frontend part of the MDP project.
Built with React 19 and TypeScript on top of Vite, using Ant Design as the component library,
Tailwind CSS for utility styling, TanStack Query for server-state management, and React Router
for navigation.

> Status: **early setup**. The foundation (build tooling, global providers, folder structure, lint
> configuration) is in place; business pages and features are not implemented yet — `src/App.tsx`
> still contains the default Vite template page.

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 8 |
| UI components | Ant Design 6 |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Data fetching / caching | TanStack React Query 5 |
| Routing | React Router 7 |
| Date & time | Day.js |
| Linting | ESLint 10 + typescript-eslint |

## Project Structure

The project follows a feature-based approach, separating app-level code from shared code:

```
src/
├── app/
│   ├── providers/      # Global providers (React Query, Ant Design ConfigProvider)
│   └── router/         # Application route definitions
├── features/           # Business feature modules (e.g. assets, categories, loans)
├── shared/
│   ├── components/     # Reusable UI components
│   ├── constants/      # Shared constants, including route paths
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Page layouts
│   ├── lib/            # Third-party library instances (e.g. queryClient)
│   ├── services/       # HTTP client & API calls
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Helper functions
├── assets/             # Images and icons
└── styles/             # Additional global styles
```

Configuration already in place:

- `src/app/providers/AppProvider.tsx` — wraps the app with `QueryClientProvider` and the Ant Design theme (primary color `#1677ff`, border radius `6`).
- `src/shared/lib/queryClient.ts` — React Query defaults: `staleTime` of 60 seconds, `retry` once, no refetch on window focus.

## Getting Started

Requires a recent Node.js LTS version and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (Vite + HMR)
npm run build    # type-check (tsc -b) then build for production into dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## Development Notes

- For a production application, consider enabling type-aware lint rules by replacing
  `tseslint.configs.recommended` with `tseslint.configs.recommendedTypeChecked`
  (or `strictTypeChecked`) in [eslint.config.js](eslint.config.js), and pointing
  `parserOptions.project` at `./tsconfig.node.json` and `./tsconfig.app.json`.
- The React Compiler is not enabled because of its impact on dev & build performance.
  Setup guide: https://react.dev/learn/react-compiler/installation
