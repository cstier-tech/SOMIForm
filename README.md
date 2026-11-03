# SOMI Form

React + TypeScript + Vite app for entering SOMI requests and taking them through each approval
stage. Records are stored in Supabase.

## Setup

Create `.env.local` with the Supabase project's details:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Then:

```
npm install
npm run dev
```

`npm run build` type-checks and builds; `npm run lint` runs Oxlint.
