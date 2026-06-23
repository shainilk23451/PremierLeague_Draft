# PL Draft — Project Handoff

A short, port-ready summary of the project state, architecture, and operational details.

## Overview

PL Draft is a web game: draft an 18-player squad from iconic historic Premier League team-seasons, then simulate a 38-game campaign against a 20-team field and see your final table position + result tier.

- **Live site:** https://pl-draft.vercel.app
- **Repo:** https://github.com/shainilk23451/PremierLeague_Draft (public)
- **Hosting:** Vercel (project name `pl-draft`)

## Tech stack

- React 18 + Vite 6 (plain JavaScript, no TypeScript)
- Tailwind CSS 3 — dark theme (`zinc-950/900/800`) with `#e8fa23` (pl-yellow) accent
- No backend; all data is static in `src/data/teams.js`

## Repo layout

```
index.html
package.json            # name "pl-draft", scripts: dev / build / preview
vite.config.js, tailwind.config.js, postcss.config.js
public/
  profile.svg           # branded app/profile icon (source)
  profile.png           # 1024px raster
src/
  main.jsx, App.jsx     # phase state machine: landing | draft | simulating | results
  index.css
  data/teams.js         # 36 historic team-seasons, ~400 players
  utils/
    draft.js            # squad slots, randomizer, valid-slot logic
    simulation.js       # team ratings, Poisson match model, season sim, tier ladder
  components/
    Landing.jsx         # start screen + difficulty selector
    DraftPhase.jsx      # player picking UI (PlayerRow shows G/A/CS, not ratings)
    SquadPanel.jsx
    SimulationView.jsx
    ResultsView.jsx     # final table, result tier, shareable score card
    HowToPlayModal.jsx
```

## Core mechanics

**Squad (18 slots):** 0=GK, 1=LB, 2-3=CB, 4=RB, 5-7=CM, 8=LW, 9=ST, 10=RW, 11=bench GK, 12-17=bench outfield. `TOTAL_ROUNDS = 18`, `SKIPS_ALLOWED = 2`.

**Player data shape:** `{ id, name, position, subPosition, nationality, goals, assists, cleanSheets, rating }`. Defender `cleanSheets` are real per-player values (historic starts x team clean-sheet rate). Ratings exist but are intentionally never displayed in the UI.

**Team ratings** (`calculateTeamRating` in simulation.js):
- `attackRating = fwdAvg*0.60 + midAvg*0.35 + defAvg*0.05`
- `defenseRating = defAvg*0.50 + gkRating*0.40 + midAvg*0.10`
- `depthBonus = max(0, (benchAvg - 72) * 0.10)`

**Match model:** Poisson goals. xG = `clamp(1.25 + differential*1.8, 0.4, 3.0)` where `differential = norm(attack) - norm(opponentDefense)`, `norm(r) = (r-60)/39`. Per-match `formFactor() = 0.80 + random()*0.40` (+/-20% noise) creates upsets. Home advantage = +4 to home attack.

**Season:** 20-team round-robin (380 fixtures), user plays 38. Older seasons (year <= 1994) use 42 games for stats context.

**Result tiers** (`getSeasonVerdict`): Relegated -> Relegation Battle -> Mid-Table -> Europa -> Champions League -> Runners-Up -> Champions -> Centurions (>=100 pts) -> Invincibles (0 losses) -> GOAT (38-0).

**Difficulty:** Casual (AI x0.93, stats visible) / Normal (x1.0, visible) / Elite (x1.07, stats hidden during draft). Selected on Landing, threaded into `simulateSeason`.

**Randomizer:** `pickRandomTeam(usedIds)` prefers clubs not yet seen this draft so the same 5 big clubs (Man Utd/Chelsea/Man City/Arsenal/Liverpool, which have the most season entries) don't dominate.

## Run locally

```bash
npm install
npm run dev       # dev server (Vite, default :5173)
npm run build     # production build -> dist/
npm run preview   # serve the build
```

## Deploy

```bash
npx vercel deploy --prod --yes --name "pl-draft"
```
(`--name` is deprecated but functional.) Production alias: https://pl-draft.vercel.app

## Current status

- Working tree clean; `main` pushed to GitHub.
- Latest features (tier ladder, difficulty modes, share card, defender clean sheets, improved sim, randomizer variety) all built, committed, and deployed.
- README and profile icon committed and live in production.

## Possible next steps / ideas

- Persist best result / leaderboard (would require a backend or local storage).
- Expand team-season library beyond the current 36.
- Polish the share card visuals; add direct social-share intent links.
- Player ratings exist in data but are unused — could power an optional "ratings on" mode.

## Notes for porting

- `.gitignore` excludes `node_modules`, `dist`, `.vercel`, `.claude`, `*.local`, `.DS_Store`. No secrets are committed.
- No environment variables or API keys are required to build or run.
