# Trade Architect

[cloudflarebutton]

A full-stack application built on Cloudflare Workers, featuring a modern React frontend with Tailwind CSS and shadcn/ui components. The backend leverages Durable Objects for scalable, stateful entity management (users, chat boards, messages) with indexed listing capabilities. Ideal for real-time collaborative apps like chat systems or trading dashboards.

## Features

- **Serverless Backend**: Hono-based API routes with Durable Objects for entities (Users, ChatBoards) and automatic indexing for efficient listing/pagination.
- **Modern UI**: React 18 with Vite, Tailwind CSS, shadcn/ui, TanStack Query for data fetching, and responsive design with dark mode.
- **Real-time Capabilities**: Chat boards store messages per entity; supports create/read/update/delete operations.
- **Type-Safe**: Full TypeScript support across frontend, backend, and shared types.
- **Production-Ready**: CORS, error handling, client error reporting, health checks, and Cloudflare observability.
- **Demo Data**: Seeded with mock users, chats, and messages for instant testing.
- **Sidebar Layout**: Optional responsive sidebar with search and navigation.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Lucide React, Sonner (toasts), Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects, SQLite (via DO storage).
- **Utilities**: Zod (validation), Immer (immutability), Zustand (state), React Router.
- **Dev Tools**: Bun (package manager), Wrangler (deployment), ESLint, TypeScript 5.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (≥1.0)
- [Cloudflare Account](https://dash.cloudflare.com/) with Workers enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest` or global install)

### Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd trade-architect-ccdqpruuanex1xh6ysayp
   ```

2. Install dependencies:
   ```
   bun install
   ```

3. (Optional) Generate Workers types:
   ```
   bun run cf-typegen
   ```

### Local Development

1. Start the dev server (frontend + worker proxy):
   ```
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`).

2. In another terminal, login to Cloudflare (for DO testing):
   ```
   bunx wrangler@latest login
   bunx wrangler@latest deploy --dry-run
   ```

### Usage Examples

- **List Users**: `GET /api/users?limit=10&cursor=abc`
- **Create User**: `POST /api/users` `{ "name": "John Doe" }`
- **List Chats**: `GET /api/chats`
- **Send Message**: `POST /api/chats/:chatId/messages` `{ "userId": "u1", "text": "Hello!" }`
- **Delete Multiple**: `POST /api/users/deleteMany` `{ "ids": ["u1", "u2"] }`

Frontend automatically fetches and displays data. Edit `src/pages/HomePage.tsx` or add routes in `src/main.tsx`.

### Build & Preview

```
bun run build
bun run preview
```

## Deployment

Deploy to Cloudflare Workers with full assets (SPA + API):

```
bun run deploy
```

Or manually:

```
bunx wrangler@latest deploy
```

- Configured for `[your-subdomain].workers.dev`.
- Custom domain: Edit `wrangler.jsonc`.
- Durable Objects auto-migrate via `migrations`.

[cloudflarebutton]

**Pro Tip**: Use `wrangler tail` for live logs and `wrangler dev --remote` for remote dev.

## Customization

- **Frontend**: Edit `src/pages/`, use shadcn (`npx shadcn@latest add <component>`), add routes.
- **Backend**:
  - Add entities: Extend `IndexedEntity` in `worker/entities.ts`.
  - Add routes: `worker/user-routes.ts` (imported dynamically).
  - Shared types: `shared/types.ts`.
- **Sidebar**: Customize `src/components/app-sidebar.tsx` or wrap pages in `AppLayout`.
- **API Client**: `src/lib/api-client.ts` for type-safe fetches.
- **Theme**: Toggle via `ThemeToggle`; CSS vars in `src/index.css`.

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Build for production |
| `bun lint` | Lint code |
| `bun deploy` | Deploy to Cloudflare |
| `bun run cf-typegen` | Generate types |

## Troubleshooting

- **DO Migration Errors**: Run `wrangler deploy --dry-run`.
- **CORS Issues**: API routes auto-handle.
- **Bun Issues**: Ensure Bun ≥1.0; `rm -rf node_modules/.vite`.
- **Types**: Restart TS server after `cf-typegen`.

## License

MIT. See [LICENSE](LICENSE) for details.