import { useState } from 'react'
import { DIFFICULTIES } from '../utils/simulation.js'
import { TEAMS } from '../data/teams.js'
import { loadStore } from '../utils/storage.js'

const DIFF_ORDER = ['casual', 'normal', 'elite']

// Derived once at module load — keeps marketing copy in sync with the data.
const TEAM_COUNT = TEAMS.length
const SEASON_YEARS = TEAMS.map(t => parseInt(t.season.split('/')[0], 10)).filter(Number.isFinite)
const FIRST_YEAR = Math.min(...SEASON_YEARS)
const LAST_SEASON = TEAMS.reduce((latest, t) => {
  const y = parseInt(t.season.split('/')[0], 10)
  return y > latest.y ? { y, s: t.season } : latest
}, { y: -Infinity, s: '' }).s
const FIRST_SEASON = TEAMS.find(t => parseInt(t.season.split('/')[0], 10) === FIRST_YEAR)?.season ?? ''

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

export default function Landing({ onStart, onHowTo }) {
  const [difficulty, setDifficulty] = useState('normal')
  const [showRatings, setShowRatings] = useState(false)
  const [store] = useState(loadStore)

  const best = store.bests[difficulty]
  const ratingsLocked = DIFFICULTIES[difficulty].hideStats

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-53px)] px-4">
      <div className="max-w-md w-full text-center fade-in-up">
        {/* Logo mark */}
        <div className="mb-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-px bg-zinc-700" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500">
              Premier League
            </span>
            <div className="w-12 h-px bg-zinc-700" />
          </div>
        </div>

        <h1 className="text-6xl font-black tracking-tight mb-1 leading-none">
          PL
        </h1>
        <h1 className="text-6xl font-black tracking-tight text-pl-yellow mb-6 leading-none">
          DRAFT
        </h1>

        <p className="text-base text-zinc-400 font-medium mb-2 leading-relaxed">
          Draft a legendary squad from iconic Premier League seasons<br />
          and simulate a full 38-game campaign.
        </p>
        <p className="text-sm text-zinc-600 mb-10">
          18 players · {TEAM_COUNT} historic team-seasons · Can you win the title?
        </p>

        {/* Difficulty selector */}
        <div className="max-w-xs mx-auto mb-4">
          <div className="flex gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg" role="group" aria-label="Difficulty">
            {DIFF_ORDER.map((key) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                aria-pressed={difficulty === key}
                className={`flex-1 text-xs font-bold uppercase tracking-wide py-2 rounded-md transition-colors ${
                  difficulty === key
                    ? 'bg-pl-yellow text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {DIFFICULTIES[key].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-zinc-600 h-4">{DIFFICULTIES[difficulty].blurb}</p>
        </div>

        {/* Ratings toggle */}
        <div className="max-w-xs mx-auto mb-6">
          <button
            onClick={() => setShowRatings(v => !v)}
            disabled={ratingsLocked}
            aria-pressed={showRatings && !ratingsLocked}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
              ratingsLocked
                ? 'border-zinc-800 bg-zinc-900/50 cursor-not-allowed'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
            }`}
          >
            <span className="min-w-0">
              <span className={`block text-xs font-bold uppercase tracking-wide ${ratingsLocked ? 'text-zinc-600' : 'text-zinc-200'}`}>
                Player ratings
              </span>
              <span className="block text-[11px] text-zinc-600 leading-tight">
                {ratingsLocked ? 'Unavailable in Elite (blind draft)' : 'Show each player’s overall rating'}
              </span>
            </span>
            <span
              className={`flex-shrink-0 w-9 h-5 rounded-full p-0.5 transition-colors ${
                showRatings && !ratingsLocked ? 'bg-pl-yellow' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                  showRatings && !ratingsLocked ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>

        <button
          onClick={() => onStart(difficulty, showRatings && !ratingsLocked)}
          className="w-full max-w-xs mx-auto bg-pl-yellow text-zinc-950 text-sm font-black tracking-widest uppercase py-4 px-8 rounded-lg hover:brightness-110 transition-all"
        >
          Start Draft
        </button>

        {/* Personal best for the selected difficulty */}
        {best && (
          <div className="mt-5 max-w-xs mx-auto text-[11px] text-zinc-500">
            <span className="font-bold tracking-wide uppercase text-zinc-600">{DIFFICULTIES[difficulty].label} best · </span>
            <span className="text-zinc-300">
              {best.emoji} {best.tier || `${best.position}${ordinal(best.position)}`}
            </span>
            <span className="text-zinc-600"> · {best.pts} pts ({best.position}{ordinal(best.position)})</span>
          </div>
        )}
        {store.drafts > 0 && (
          <p className="mt-1 text-[10px] text-zinc-700">
            {store.drafts} {store.drafts === 1 ? 'season' : 'seasons'} played
          </p>
        )}

        <button
          onClick={onHowTo}
          className="mt-5 text-xs font-semibold tracking-wider uppercase text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          How to play
        </button>
      </div>

      <p className="absolute bottom-6 text-xs text-zinc-700 tracking-wide">
        Featuring seasons from {FIRST_SEASON} to {LAST_SEASON}
      </p>
    </div>
  )
}
