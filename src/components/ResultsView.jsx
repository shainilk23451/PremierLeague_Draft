import { useState } from 'react'
import { getSeasonVerdict, DIFFICULTIES } from '../utils/simulation.js'
import { SLOT_LABELS } from '../utils/draft.js'

// Render a shareable square score card to a canvas and return it as a PNG blob.
function drawScoreCard(verdict, ourStats, squad, difficulty) {
  const W = 1080, H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, W, H)

  // Header
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 56px Arial'
  ctx.fillText('PL', W / 2 - 60, 110)
  ctx.fillStyle = '#e8fa23'
  ctx.fillText('DRAFT', W / 2 + 60, 110)

  ctx.fillStyle = '#52525b'
  ctx.font = 'bold 22px Arial'
  ctx.fillText((DIFFICULTIES[difficulty]?.label ?? 'Normal').toUpperCase() + ' DIFFICULTY', W / 2, 160)

  // Verdict
  ctx.font = '120px Arial'
  ctx.fillText(verdict.emoji || '', W / 2, 320)

  ctx.fillStyle = '#e8fa23'
  ctx.font = '900 64px Arial'
  ctx.fillText(verdict.tier || '', W / 2, 410)

  if (ourStats) {
    ctx.fillStyle = '#a1a1aa'
    ctx.font = 'bold 30px Arial'
    ctx.fillText(`Finished ${ourStats.position}${ordinal(ourStats.position)}`, W / 2, 470)

    // Stat strip
    const stats = [
      [`${ourStats.pts}`, 'PTS'],
      [`${ourStats.won}-${ourStats.drawn}-${ourStats.lost}`, 'W-D-L'],
      [`${ourStats.gd > 0 ? '+' : ''}${ourStats.gd}`, 'GD'],
    ]
    const colW = W / stats.length
    stats.forEach(([val, lbl], i) => {
      const x = colW * i + colW / 2
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 52px Arial'
      ctx.fillText(val, x, 580)
      ctx.fillStyle = '#52525b'
      ctx.font = 'bold 22px Arial'
      ctx.fillText(lbl, x, 615)
    })
  }

  // Starting XI
  ctx.strokeStyle = '#27272a'
  ctx.beginPath()
  ctx.moveTo(80, 655)
  ctx.lineTo(W - 80, 655)
  ctx.stroke()

  const xi = squad.filter(Boolean).slice(0, 11)
  ctx.textAlign = 'left'
  const startY = 700
  const lineH = 33
  xi.forEach((p, i) => {
    const col = i < 6 ? 0 : 1
    const row = i < 6 ? i : i - 6
    const x = col === 0 ? 90 : W / 2 + 20
    const y = startY + row * lineH
    ctx.fillStyle = '#71717a'
    ctx.font = 'bold 18px Arial'
    ctx.fillText(SLOT_LABELS[i], x, y)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 22px Arial'
    ctx.fillText(p.name, x + 55, y)
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = '#52525b'
  ctx.font = 'bold 22px Arial'
  ctx.fillText('pl-draft.vercel.app', W / 2, H - 50)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

function FormDot({ result }) {
  const cls = result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-400' : 'bg-red-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />
}

function TableRow({ team }) {
  const isUs = team.isUs
  const relegation = team.position >= 18
  const cl = team.position <= 4
  const uel = team.position >= 5 && team.position <= 6

  return (
    <tr className={`border-b border-zinc-800 text-sm transition-colors ${
      isUs ? 'bg-pl-yellow/10 border-l-2 border-l-pl-yellow' : ''
    }`}>
      <td className={`py-2.5 pl-4 pr-2 font-bold w-8 ${
        isUs ? 'text-pl-yellow' :
        cl ? 'text-blue-400' : uel ? 'text-orange-400' : relegation ? 'text-red-400' : 'text-zinc-500'
      }`}>
        {team.position}
      </td>
      <td className="py-2.5 pr-2">
        <div>
          <span className={`font-semibold ${isUs ? 'text-pl-yellow font-black' : 'text-white'}`}>
            {team.name}{isUs && ' ★'}
          </span>
          {team.season && (
            <span className="ml-1.5 text-[10px] text-zinc-600">{team.season}</span>
          )}
        </div>
      </td>
      <td className="py-2.5 text-center w-8 text-zinc-500">{team.played}</td>
      <td className="py-2.5 text-center w-8 text-zinc-400">{team.won}</td>
      <td className="py-2.5 text-center w-8 text-zinc-500">{team.drawn}</td>
      <td className="py-2.5 text-center w-8 text-zinc-500">{team.lost}</td>
      <td className="py-2.5 text-center w-10 text-zinc-400">{team.gf}</td>
      <td className="py-2.5 text-center w-10 text-zinc-500">{team.ga}</td>
      <td className={`py-2.5 text-center w-10 font-semibold ${team.gd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {team.gd > 0 ? '+' : ''}{team.gd}
      </td>
      <td className={`py-2.5 pr-4 text-center w-10 font-black text-base ${isUs ? 'text-pl-yellow' : 'text-white'}`}>
        {team.pts}
      </td>
    </tr>
  )
}

export default function ResultsView({ seasonResult, squad, difficulty = 'normal', onRestart }) {
  const [sharing, setSharing] = useState(false)

  if (!seasonResult) return null

  const { table, ourStats } = seasonResult
  const verdict = getSeasonVerdict(ourStats)
  const form5 = (ourStats?.form ?? []).slice(-5)

  const handleShare = async () => {
    setSharing(true)
    try {
      const blob = await drawScoreCard(verdict, ourStats, squad, difficulty)
      if (!blob) return
      const file = new File([blob], 'pl-draft-result.png', { type: 'image/png' })
      const shareData = {
        files: [file],
        title: 'PL Draft',
        text: `${verdict.emoji} ${verdict.tier} — ${ourStats.pts} pts in PL Draft!`,
      }
      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'pl-draft-result.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      // user cancelled share or it failed — no action needed
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Verdict */}
      <div className="text-center fade-in-up">
        <div className="text-5xl mb-3">{verdict.emoji}</div>
        {verdict.tier && (
          <div className="inline-block mb-2 text-[10px] font-black tracking-[0.25em] uppercase text-pl-yellow border border-pl-yellow/40 rounded-full px-3 py-1">
            {verdict.tier}
          </div>
        )}
        <h2 className="text-2xl font-black text-white">{verdict.text}</h2>
        {ourStats && (
          <div className="mt-3 flex items-center justify-center gap-4 text-sm text-zinc-400">
            <span className="font-black text-pl-yellow text-xl">{ourStats.pts} pts</span>
            <span>{ourStats.won}W {ourStats.drawn}D {ourStats.lost}L</span>
            <span className={ourStats.gd >= 0 ? 'text-green-400' : 'text-red-400'}>
              GD {ourStats.gd > 0 ? '+' : ''}{ourStats.gd}
            </span>
          </div>
        )}
        {form5.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="text-xs text-zinc-600 mr-1">Last 5:</span>
            {form5.map((r, i) => <FormDot key={i} result={r} />)}
          </div>
        )}
      </div>

      {/* League Table */}
      <div className="fade-in-up">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-3">Final League Table</h3>
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-600 font-bold tracking-wider uppercase text-[10px]">
                  <th className="py-2 pl-4 pr-2 text-left w-8">#</th>
                  <th className="py-2 pr-2 text-left">Team</th>
                  <th className="py-2 text-center w-8">P</th>
                  <th className="py-2 text-center w-8">W</th>
                  <th className="py-2 text-center w-8">D</th>
                  <th className="py-2 text-center w-8">L</th>
                  <th className="py-2 text-center w-10">GF</th>
                  <th className="py-2 text-center w-10">GA</th>
                  <th className="py-2 text-center w-10">GD</th>
                  <th className="py-2 pr-4 text-center w-10">Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((team) => <TableRow key={team.name} team={team} />)}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2 border-t border-zinc-800 text-[10px] text-zinc-600">
            <span><span className="text-blue-400 font-bold">■</span> Champions League</span>
            <span><span className="text-orange-400 font-bold">■</span> Europa League</span>
            <span><span className="text-red-400 font-bold">■</span> Relegation</span>
          </div>
        </div>
      </div>

      {/* Your squad */}
      <div className="fade-in-up">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-3">Your Squad</h3>
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900">
          {squad.filter(Boolean).map((player, i) => (
            <div key={`${player.id}-${i}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 last:border-0">
              <span className="text-[10px] font-bold text-zinc-600 w-4">{i + 1}</span>
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: player.primaryColor }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-white">{player.name}</span>
                <span className="ml-2 text-xs text-zinc-500">{player.teamName} {player.season}</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase">{SLOT_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 fade-in-up pb-8">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 bg-zinc-800 text-white font-black tracking-widest uppercase text-sm py-3 rounded-lg hover:bg-zinc-700 transition-all disabled:opacity-60"
        >
          {sharing ? 'Preparing…' : 'Share Result'}
        </button>
        <button
          onClick={onRestart}
          className="flex-1 bg-pl-yellow text-zinc-950 font-black tracking-widest uppercase text-sm py-3 rounded-lg hover:brightness-110 transition-all"
        >
          Draft Again
        </button>
      </div>
    </div>
  )
}
