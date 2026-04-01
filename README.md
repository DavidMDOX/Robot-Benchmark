# Humanoid Benchmark MVP

An interactive React + Vite prototype for a humanoid robot benchmark platform.

## What is included

- Industrial and care humanoid benchmark lanes
- Interactive suite explorer
- Simulated benchmark runner
- Searchable leaderboard
- Real-time weighting engine
- Radar / bar / growth charts
- Submission and certification workflow

## Tech stack

- React 18
- Vite
- TypeScript
- Recharts
- Framer Motion
- Lucide React

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Production build

```bash
npm install
npm run build
npm run preview
```

## Deploy

### Vercel

1. Create a new project in Vercel.
2. Import this folder or upload the zip.
3. Framework preset: `Vite`
4. Build command: `npm run build`
5. Output directory: `dist`

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

## Notes

- The metrics and benchmark outputs are mock data designed for MVP demonstration.
- Robot links are included in the source data and can be extended.
- A next step would be connecting the runner panel to a real simulation backend such as Isaac Sim or MuJoCo.
