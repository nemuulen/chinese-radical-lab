
  # Mandarin Chinese Learning App (UPDATE)

  This is a code bundle for Mandarin Chinese Learning App (UPDATE). The original project is available at https://www.figma.com/design/N3wPttP8Cc6NYxAqOtnMLG/Mandarin-Chinese-Learning-App--UPDATE-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

## Local mock backend (prototype)

This project includes a minimal mock backend for local development that implements the main endpoints the frontend expects (health, characters, daily challenge, challenge submissions, discoveries, user register/login/profile, leaderboard, analytics).

To install dependencies and run the mock backend:

1. Install project dependencies:

```bash
npm install
```

2. Start the mock backend (runs on port 54321):

```bash
npm run backend
```

The front-end `src/utils/api.ts` automatically points to the local mock backend when you open the app at `http://localhost:...`, so during development you can run `npm run dev` (for the front-end) and `npm run backend` (for the mock backend) concurrently.

Notes:
- The mock backend uses an in-memory store so data will reset when the process restarts.
- Use the register/login endpoints to create a user and obtain a token (the frontend stores the token in localStorage). The mock backend returns a simple token for convenience.
- This is intended as a prototype; swap to the real Supabase functions by deploying the serverless functions and removing the localhost override in `src/utils/api.ts`.
