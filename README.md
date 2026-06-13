# Prompt Manager

A full-stack web application for creating, organizing, and searching AI prompts. Built as a portfolio project to
demonstrate modern Next.js patterns, clean architecture, and a comprehensive testing strategy.

## Tech Stack

**Frontend**

- [Next.js 16](https://nextjs.org/) — App Router, Server Components, Server Actions
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form validation
- [Framer Motion](https://www.framer.com/motion/) — UI animations
- [nuqs](https://nuqs.47ng.com/) — URL query state management

**Backend / Data**

- [Prisma 7](https://www.prisma.io/) + PostgreSQL
- Next.js Server Actions with `revalidatePath` for cache invalidation

**Testing**

- [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/) — unit and component tests
- [Playwright](https://playwright.dev/) — end-to-end tests against a real database

**CI**

- GitHub Actions — runs build, Jest, and Playwright on every push

## Architecture

The project follows a **Clean Architecture** approach with clear separation between layers:

```
src/
├── app/                        # Next.js routes and Server Actions
│   ├── actions/prompt.actions.ts
│   ├── [id]/page.tsx
│   └── new/page.tsx
├── components/                 # UI layer (React components)
├── core/
│   ├── domain/prompts/         # Entities and repository interface
│   └── application/prompts/   # Use cases (business logic)
└── infra/
    └── repository/             # Prisma implementation of the repository
```

The domain layer has **zero framework dependencies** — use cases depend only on the `PromptRepository` interface, making
them straightforward to test with fakes.

## Features

- Create, edit, and delete prompts
- Real-time search with URL-synced query state (bookmarkable, shareable)
- Copy prompt content to clipboard
- Responsive layout with collapsible sidebar and mobile menu
- Optimistic UI with loading states and toast notifications

## Getting Started

**Prerequisites:** Node.js 20+, PostgreSQL

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
# Unit and component tests
npm test

# With coverage report
npm run test:cov

# End-to-end tests (requires the dev server running)
npm run test:e2e
```

The test suite covers **70 tests across 12 suites**:

| Layer          | What is tested                                                      |
| -------------- | ------------------------------------------------------------------- |
| Use cases      | Business rules in isolation using repository fakes                  |
| Server Actions | Input validation, error handling, `revalidatePath` calls            |
| Components     | Rendering, user interactions, async state with `useActionState`     |
| Repository     | Prisma queries against a real in-memory-compatible DB               |
| E2E            | Full user flows (create, edit, delete, search) with real PostgreSQL |

E2E tests create their own data with unique identifiers and clean up via `try/finally`, making them safe to run in
parallel across multiple browsers.

## Scripts

| Script                | Description                                     |
| --------------------- | ----------------------------------------------- |
| `npm run dev`         | Start development server                        |
| `npm run build`       | Generate Prisma client and build for production |
| `npm run db:migrate`  | Create and apply a new migration                |
| `npm run db:studio`   | Open Prisma Studio                              |
| `npm run lint`        | Run ESLint                                      |
| `npm run check:types` | Type-check without emitting                     |
