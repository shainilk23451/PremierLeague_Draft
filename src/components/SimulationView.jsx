import { useEffect, useState, useRef } from 'react'

function ResultBadge({ result }) {
  const cls = result === 'W'
    ? 'bg-green-500 text-white'
    : result === 'D'
    ? 'bg-yellow-500 text-zinc-950'
    : 'bg-red-600 text-white'
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-black ${cls}`}>
      {result}
    </span>
  )
}

export default function SimulationView({ seasonResult, onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  const matches = seasonResult?.ourMatches ?? []

  useEffect(() => {
    if (!seasonResult || matches.length === 0) return
    intervalRef.current = setInterval(() => {
      setVisibleCount(prev => {
        const next = prev + 1
        if (next >= matches.length) {
          clearInterval(intervalRef.current)
          setTimeout(() => setDone(true), 600)
        }
        return next
      })
    }, 60)
    return () => clearInterval(intervalRef.current)
  }, [seasonResult, matches.length])

  if (!seasonResult) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-53px)]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚽</div>
          <p className="text-sm font-semibold text-zinc-500 tracking-wider uppercase">Simulating season…</p>
        </div>
      </div>
    )
  }

  const { ourStats } = seasonResult
  const visible = matches.slice(0, visibleCount)

  const running = visible.reduce(
    (acc, m) => ({
      w: acc.w + (m.result === 'W' ? 1 : 0),
      d: acc.d + (m.result === 'D' ? 1 : 0),
      l: acc.l + (m.result === 'L' ? 1 : 0),
      gf: acc.gf + m.goalsFor,
      ga: acc.ga + m.goalsAgainst,
      pts: acc.pts + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0),
    }),
    { w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
  )

  return (
    <div className="flex flex-col h-[calc(100vh-53px)]">
      {/* Stats bar */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
          {done ? 'Season Complete' : 'Simulating Season…'}
        </h2>
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-zinc-400">MD {visible.length}/38</span>
          <span className="text-green-400">W {running.w}</span>
          <span className="text-yellow-400">D {running.d}</span>
          <span className="text-red-400">L {running.l}</span>
          <span className="ml-auto font-black text-pl-yellow text-lg">{running.pts} <span className="text-sm text-zinc-500 font-semibold">pts</span></span>
        </div>
      </div>

      {/* Match log */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-zinc-950">
        <div className="space-y-1">
          {visible.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 fade-in-up text-sm"
            >
              <span className="text-[10px] font-bold text-zinc-600 w-6 text-right">{i + 1}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.isHome ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-400'}`}>
                {m.isHome ? 'H' : 'A'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-zinc-200 font-medium truncate block">{m.opponent}</span>
                {m.opponentSeason && (
                  <span className="text-[9px] text-zinc-600">{m.opponentSeason}</span>
                )}
              </div>
              <span className="font-black text-white tabular-nums text-base">
                {m.goalsFor}–{m.goalsAgainst}
              </span>
              <ResultBadge result={m.result} />
            </div>
          ))}
        </div>
      </div>

      {/* Done button */}
      {done && (
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900 fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-zinc-400">
              <span className="font-black text-white">{ourStats?.pts ?? running.pts} pts</span>
              {' '}· {running.w}W {running.d}D {running.l}L
              {' '}· GD {running.gf - running.ga >= 0 ? '+' : ''}{running.gf - running.ga}
            </div>
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-pl-yellow text-zinc-950 font-black tracking-widest uppercase text-sm py-3 rounded-lg hover:brightness-110 transition-all"
          >
            See League Table
          </button>
        </div>
      )}
    </div>
  )
}
