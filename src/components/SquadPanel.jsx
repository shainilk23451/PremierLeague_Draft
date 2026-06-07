import { useMemo } from 'react'
import { getValidSlots, SLOT_LABELS, getSquadStats, canPlaySlot } from '../utils/draft.js'

const SLOT_POSITIONS = {
  0:  { col: 2,   row: 0 }, // GK
  1:  { col: 0,   row: 1 }, // LB
  2:  { col: 1,   row: 1 }, // CB
  3:  { col: 3,   row: 1 }, // CB
  4:  { col: 4,   row: 1 }, // RB
  5:  { col: 0.7, row: 2 }, // LCM
  6:  { col: 2,   row: 2 }, // CM
  7:  { col: 3.3, row: 2 }, // RCM
  8:  { col: 0.5, row: 3 }, // LW
  9:  { col: 2,   row: 3 }, // ST
  10: { col: 3.5, row: 3 }, // RW
}

function PitchSlot({ index, player, isValid, isLiftable, isSwapSelected, isSwappable, isSquadFull, onClick, onLift, onSwapSelect }) {
  const label = SLOT_LABELS[index]
  const teamColor = player?.primaryColor
  const base = 'w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-150 select-none border-2'

  if (isValid) {
    return (
      <button
        onClick={() => onClick(index)}
        className={`${base} bg-pl-yellow border-pl-yellow text-zinc-950 scale-110 ring-2 ring-pl-yellow ring-offset-2 ring-offset-pitch cursor-pointer`}
        title={label}
      >
        <span className="text-[11px] font-black">{index + 1}</span>
      </button>
    )
  }

  if (player) {
    if (isSwapSelected) {
      return (
        <button
          onClick={() => onSwapSelect(index)}
          className={`${base} scale-110 ring-2 ring-amber-400 ring-offset-2 ring-offset-pitch cursor-pointer`}
          style={{ backgroundColor: teamColor || '#fff', borderColor: '#f59e0b' }}
          title={`Deselect ${player.name}`}
        >
          <span className="text-[9px] font-bold leading-none text-white drop-shadow-sm">{player.name.split(' ').pop().slice(0, 6)}</span>
          <span className="text-[7px] text-white/70 leading-none mt-0.5">{label}</span>
        </button>
      )
    }
    if (isSwappable) {
      return (
        <button
          onClick={() => onSwapSelect(index)}
          className={`${base} scale-105 ring-2 ring-pl-yellow ring-offset-1 ring-offset-pitch cursor-pointer`}
          style={{ backgroundColor: teamColor || '#fff', borderColor: teamColor || '#fff' }}
          title={`Swap with ${player.name}`}
        >
          <span className="text-[9px] font-bold leading-none text-white drop-shadow-sm">{player.name.split(' ').pop().slice(0, 6)}</span>
          <span className="text-[7px] text-white/70 leading-none mt-0.5">{label}</span>
        </button>
      )
    }
    const isClickable = isSquadFull || isLiftable
    return (
      <button
        onClick={() => {
          if (isSquadFull) onSwapSelect(index)
          else if (isLiftable) onLift(index)
        }}
        className={`${base} ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-white/40 hover:ring-offset-1 hover:ring-offset-[#1a2e1a]' : 'cursor-default'}`}
        style={{ backgroundColor: teamColor || '#fff', borderColor: teamColor || '#fff' }}
        title={isSquadFull ? `Swap ${player.name}` : isLiftable ? `Move ${player.name}` : `${player.name} (${player.season})`}
      >
        <span className="text-[9px] font-bold leading-none text-white drop-shadow-sm">{player.name.split(' ').pop().slice(0, 6)}</span>
        <span className="text-[7px] text-white/70 leading-none mt-0.5">{label}</span>
      </button>
    )
  }

  return (
    <button
      className={`${base} bg-white/5 border-white/20 text-white/30 cursor-not-allowed`}
      title={label}
    >
      <span className="text-[11px] font-semibold">{index + 1}</span>
    </button>
  )
}

export default function SquadPanel({ squad, selectedPlayer, onPlacePlayer, onLiftPlayer, swapFromSlot, onSwapSelect, isSquadFull, round, totalRounds }) {
  const validSlots = selectedPlayer ? getValidSlots(selectedPlayer, squad) : []
  const isLiftable = !selectedPlayer && !isSquadFull
  const stats = getSquadStats(squad)

  const swappableSlots = useMemo(() => {
    if (swapFromSlot === null || !squad[swapFromSlot]) return []
    const playerA = squad[swapFromSlot]
    return squad.reduce((acc, playerB, idx) => {
      if (idx === swapFromSlot || !playerB) return acc
      if (canPlaySlot(playerA, idx) && canPlaySlot(playerB, swapFromSlot)) acc.push(idx)
      return acc
    }, [])
  }, [swapFromSlot, squad])

  const COLS = 5
  const ROWS = 4

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500">
          Squad
        </span>
        <span className="text-xs font-semibold text-zinc-500">
          {stats.total}/{totalRounds}
        </span>
      </div>

      {/* Pitch */}
      <div
        className="pitch-bg relative mx-3 rounded-lg overflow-hidden flex-1"
        style={{ minHeight: '280px' }}
      >
        {/* Pitch markings */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/10 rounded-full" />
          <div className="absolute left-0 right-0 top-1/2 border-t border-white/10" />
        </div>

        {/* Formation slots */}
        <div className="absolute inset-0 p-2">
          {Object.entries(SLOT_POSITIONS).map(([idxStr, { col, row }]) => {
            const idx = Number(idxStr)
            const leftPct = (col / (COLS - 1)) * 88 + 6
            const bottomPct = (row / (ROWS - 1)) * 80 + 8
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}
              >
                <PitchSlot
                  index={idx}
                  player={squad[idx]}
                  isValid={validSlots.includes(idx)}
                  isLiftable={isLiftable}
                  isSwapSelected={swapFromSlot === idx}
                  isSwappable={swappableSlots.includes(idx)}
                  isSquadFull={isSquadFull}
                  onClick={onPlacePlayer}
                  onLift={onLiftPlayer}
                  onSwapSelect={onSwapSelect}
                />
              </div>
            )
          })}
        </div>

        {/* Selected player banner */}
        {selectedPlayer && (
          <div className="absolute top-2 left-2 right-2 bg-pl-yellow rounded px-3 py-1.5 text-center">
            <span className="text-[10px] font-black tracking-wider uppercase text-zinc-950">
              Place: {selectedPlayer.name}
            </span>
          </div>
        )}
      </div>

      {/* Bench */}
      <div className="px-3 pt-2 pb-3">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-zinc-600 mb-2">Bench</p>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 7 }, (_, i) => {
            const slotIdx = 11 + i
            const player = squad[slotIdx]
            const isValid = validSlots.includes(slotIdx)
            const label = slotIdx === 11 ? 'GK' : 'SUB'

            const isSwapSelectedBench = swapFromSlot === slotIdx
            const isSwappableBench = swappableSlots.includes(slotIdx)
            return (
              <button
                key={slotIdx}
                onClick={() => {
                  if (isValid) onPlacePlayer(slotIdx)
                  else if (isSquadFull && player) onSwapSelect(slotIdx)
                  else if (isLiftable && player) onLiftPlayer(slotIdx)
                }}
                className={`w-9 h-9 rounded-full border-2 flex flex-col items-center justify-center text-[8px] font-bold transition-all duration-150 ${
                  isValid
                    ? 'bg-pl-yellow border-pl-yellow text-zinc-950 scale-110 ring-2 ring-pl-yellow ring-offset-1 ring-offset-zinc-950 cursor-pointer'
                    : isSwapSelectedBench
                    ? 'text-white scale-110 ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-950 cursor-pointer'
                    : isSwappableBench
                    ? 'text-white scale-105 ring-2 ring-pl-yellow ring-offset-1 ring-offset-zinc-950 cursor-pointer'
                    : player
                    ? `text-white ${isSquadFull || isLiftable ? 'cursor-pointer hover:ring-2 hover:ring-white/40 hover:ring-offset-1 hover:ring-offset-zinc-950' : 'cursor-default'}`
                    : 'bg-white/5 border-white/20 text-white/30'
                }`}
                style={player && !isValid ? { backgroundColor: isSwapSelectedBench ? player.primaryColor : player.primaryColor, borderColor: isSwapSelectedBench ? '#f59e0b' : player.primaryColor } : {}}
                title={player ? (isSquadFull ? `Swap ${player.name}` : isLiftable ? `Move ${player.name}` : `${player.name} (${player.season})`) : label}
              >
                {player ? (
                  <span className="leading-none text-center px-0.5 truncate w-full text-center text-white">
                    {player.name.split(' ').pop().slice(0, 4)}
                  </span>
                ) : (
                  <span>{slotIdx + 1}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
