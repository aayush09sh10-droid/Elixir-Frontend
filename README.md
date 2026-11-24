# ELIXIR

ELIXIR is a React and Vite demo platform for esports communities, tournaments, and player profiles.
All accounts, moderation, tournament participation, inventory, and social activity are mock data stored
in the current browser. It does not provide production authentication or call game, OAuth, or payment
services.

## Development

```sh
npm install
npm run dev
npm run build
npm run format
npm run format:check
```

## Code organization

- `src/App.jsx` composes providers and maps URLs to page components.
- `src/app/layout.jsx` contains shared page layout and the authenticated route boundary.
- `src/pages/` groups UI by product area. `TournamentGrid` is shared between relevant pages.
- `src/components/common/` contains reusable presentation components.
- `src/context/` owns cross-page session and selected-game state.
- `src/data/repositories/` owns feature-specific mock data operations. These modules use
  `src/utils/demoStorage.js` for defensive browser storage access.
- `src/data/` contains the read-only seed data used by those repositories.

The structure follows the parts of SOLID that fit a small React application: components and data
repositories have focused responsibilities; pages depend on feature APIs rather than mutating seed
objects; and shared UI and route boundaries are reusable. Browser-side role checks are a demo
convenience and must not be treated as server authorization.
