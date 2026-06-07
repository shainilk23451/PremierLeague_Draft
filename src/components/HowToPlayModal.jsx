import { useState } from 'react'

const SLIDES = [
  {
    title: 'Aim',
    content: (
      <p className="text-center text-base leading-relaxed text-zinc-300">
        Draft an all-time Premier League squad from iconic historical teams, then simulate a full{' '}
        <strong className="text-white">38-game season</strong> to see how your team fares in the table.
      </p>
    ),
  },
  {
    title: 'How to Draft',
    content: (
      <div className="space-y-4 text-sm">
        <p className="text-zinc-300">Each round, a random quality team from PL history is shown. Pick <strong className="text-white">one player</strong> from their squad.</p>
        <div className="border border-zinc-700 rounded-lg overflow-hidden text-xs">
          {[
            ['GOALKEEPER', 'Slot 1 or Bench GK'],
            ['DEFENDER', 'Slots 2–5 or Bench'],
            ['MIDFIELDER', 'Slots 6–8 or Bench'],
            ['FORWARD', 'Slots 9–11 or Bench'],
          ].map(([pos, slots]) => (
            <div key={pos} className="flex justify-between px-4 py-2.5 border-b border-zinc-800 last:border-0 bg-zinc-900">
              <span className="font-semibold text-white">{pos}</span>
              <span className="text-zinc-500">{slots}</span>
            </div>
          ))}
        </div>
        <p className="text-zinc-500">You have <strong className="text-white">2 skips</strong> — use them to pass on a team you don't like.</p>
      </div>
    ),
  },
  {
    title: 'Simulate',
    content: (
      <div className="space-y-3 text-sm">
        <p className="text-zinc-300">Once all 18 slots are filled, simulate a full Premier League season against each current PL club's best-ever squad.</p>
        <p className="text-zinc-400">Your result is based on:</p>
        <ul className="space-y-1.5 list-none">
          {[
            'Forward quality — goals & attacking threat',
            'Midfield control — creativity & pressing',
            'Defensive solidity — backline + goalkeeper',
            'Squad depth — bench quality matters too',
          ].map(f => (
            <li key={f} className="flex items-start gap-2 text-zinc-400">
              <span className="text-pl-yellow mt-0.5">·</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: 'Share',
    content: (
      <p className="text-center text-base leading-relaxed text-zinc-300">
        Share a screenshot of your final league table — especially if you become{' '}
        <strong className="text-pl-yellow">Premier League Champions!</strong>
      </p>
    ),
  },
]

export default function HowToPlayModal({ onClose }) {
  const [slide, setSlide] = useState(0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">
            How to Play
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold tracking-widest uppercase border border-zinc-700 px-3 py-1 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="border-t border-zinc-800" />
        </div>

        {/* Slide */}
        <div className="px-6 py-5 min-h-[200px] flex flex-col justify-center">
          <h2 className="text-2xl font-black text-white mb-5">{SLIDES[slide].title}</h2>
          <div>{SLIDES[slide].content}</div>
        </div>

        <div className="px-6 pb-2">
          <div className="border-t border-zinc-800" />
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="w-9 h-9 border border-zinc-700 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-zinc-800 transition-colors text-zinc-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all ${i === slide ? 'w-5 h-2 bg-pl-yellow' : 'w-2 h-2 bg-zinc-700'}`}
              />
            ))}
          </div>

          <button
            onClick={() => slide < SLIDES.length - 1 ? setSlide(s => s + 1) : onClose()}
            className="w-9 h-9 border border-zinc-700 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors text-zinc-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
