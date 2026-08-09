# penpa-tests

Testing and solving engine for penpa-edit puzzles.

## Features

- Parse puzzle URLs and extract grid, clues, and rules.
- Solve constraints for various puzzle genres.
- Test runner using Mocha for verifying solver logic.

## Setup

1. Install Node.js
2. Clone the repository
3. Install dependencies: `npm install`

## Running Tests

To run the solver tests:

```bash
npm run test:solver
```

To start the test server for other tests:

```bash
npm test
```

## Sudoku Battle

The realtime multiplayer page is available at `/battle.html`. Apply every SQL
migration in `supabase/migrations` in filename order, then copy `.env.example`
to `.env` and provide the Supabase project URL and publishable (or legacy anon)
key before running or building the app. Restart Vite after changing `.env`.
