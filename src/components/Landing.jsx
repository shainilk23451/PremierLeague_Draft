import { useState } from 'react'
import { DIFFICULTIES } from '../utils/simulation.js'

const DIFF_ORDER = ['casual', 'normal', 'elite']

export default function Landing({ onStart, onHowTo }) {
  const [difficulty, setDifficulty] = useState('normal')

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
        <p className="text-sm text-zinc-600 mb-12">
          18 players · 34 historic team-seasons · Can you win the title?
        </p>

        {/* Difficulty selector */}
        <div className="max-w-xs mx-auto mb-6">
          <div className="flex gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            {DIFF_ORDER.map((key) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
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

        <button
          onClick={() => onStart(difficulty)}
          className="w-full max-w-xs mx-auto bg-pl-yellow text-zinc-950 text-sm font-black tracking-widest uppercase py-4 px-8 rounded-lg hover:brightness-110 transition-all"
        >
          Start Draft
        </button>

        <button
          onClick={onHowTo}
          className="mt-5 text-xs font-semibold tracking-wider uppercase text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          How to play
        </button>
      </div>

      <p className="absolute bottom-6 text-xs text-zinc-700 tracking-wide">
        Featuring seasons from 1992/93 to 2023/24
      </p>
    </div>
  )
}
