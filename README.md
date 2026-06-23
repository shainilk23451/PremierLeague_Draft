# PL Draft

Draft a legendary XI from iconic Premier League squads, then simulate a full 38-game campaign against a field of 20 teams and find out where your team finishes.

**Live:** https://pl-draft.vercel.app

## How it works

1. **Draft** — The randomizer surfaces a varied set of historic PL team-seasons. Build an 18-player squad (starting XI + bench) by picking players slot by slot. You get a limited number of skips.
2. **Simulate** — Your squad plays a 38-game season in a 20-team round-robin. Match results use a Poisson goal model driven by your squad's attack and defense ratings, home advantage, and per-match form variance.
3. **Results** — See your final league table position and a named result tier, from *Relegated* all the way up to *GOAT (38-0)*.

## Features

- **Authentic data** — Player goals, assists and per-player clean sheets are drawn from real historic seasons.
- **Result tier ladder** — Relegated → Relegation Battle → Mid-Table → Europa → Champions League → Runners-Up → Champions → Centurions → Invincibles → GOAT (38-0).
- **Difficulty modes** — Casual, Normal, and Elite. Elite strengthens the AI field and hides player stats during the draft.
- **Shareable score card** — Generate a score card of your squad and final result to share.

## Tech stack

- React 18 + Vite 6
- Tailwind CSS 3
- Plain JavaScript

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
```
