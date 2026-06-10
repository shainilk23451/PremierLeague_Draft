import { useMemo } from 'react'
import SquadPanel from './SquadPanel.jsx'
import { getAvailablePlayers } from '../utils/draft.js'

function getGamesPlayed(season) {
  const year = parseInt(season?.split('/')[0] || '2000')
  return year <= 1994 ? 42 : 38
}

function posColor(pos) {
  if (pos === 'GK') return 'bg-yellow-500/20 text-yellow-400'
  if (pos === 'DEF') return 'bg-blue-500/20 text-blue-400'
  if (pos === 'MID') return 'bg-green-500/20 text-green-400'
  return 'bg-red-500/20 text-red-400'
}

function PlayerRow({ player, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(player)}
      className={`w-full text-left px-4 py-3 border-b border-zinc-800 last:border-0 flex items-center gap-3 transition-colors ${
        isSelected
          ? 'bg-pl-yellow text-zinc-950'
          : 'hover:bg-zinc-800 text-white'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm leading-tight truncate">{player.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-black/20 text-zinc-950' : posColor(player.position)}`}>
            {player.subPosition}
          </span>
          {player.nationality && (
            <span className={`text-[10px] ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
              {player.nationality}
            </span>
          )}
        </div>
      </div>
      <div className={`flex gap-4 text-right text-xs ${isSelected ? 'text-zinc-700' : 'text-zinc-400'}`}>
        {player.position === 'GK' || player.position === 'DEF' ? (
          <>
            {player.position === 'DEF' && (
              <>
                <div className="text-center">
                  <div className={`font-bold text-sm ${isSelected ? 'text-zinc-950' : 'text-white'}`}>{player.goals}</div>
                  <div className="text-[9px] uppercase tracking-wide">G</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold text-sm ${isSelected ? 'text-zinc-950' : 'text-white'}`}>{player.assists}</div>
                  <div className="text-[9px] uppercase tracking-wide">A</div>
                </div>
              </>
            )}
            <div className="text-center">
              <div className={`font-bold text-sm ${isSelected ? 'text-zinc-950' : 'text-white'}`}>
                {player.cleanSheets ?? '–'}
              </div>
              <div className="text-[9px] uppercase tracking-wide">CS</div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className={`font-bold text-sm ${isSelected ? 'text-zinc-950' : 'text-white'}`}>{player.goals}</div>
              <div className="text-[9px] uppercase tracking-wide">G</div>
            </div>
            <div className="text-center">
              <div className={`font-bold text-sm ${isSelected ? 'text-zinc-950' : 'text-white'}`}>{player.assists}</div>
              <div className="text-[9px] uppercase tracking-wide">A</div>
            </div>
          </>
        )}
      </div>
    </button>
  )
}

export default function DraftPhase({
  round, totalRounds, currentTeam, squad,
  skipsLeft, selectedPlayer, sortKey, onSortChange,
  onSkip, onSelectPlayer, onPlacePlayer, onLiftPlayer,
  swapFromSlot, onSwapSelect,
  onSimulate, isSquadFull,
}) {
  const availablePlayers = useMemo(() => {
    if (!currentTeam) return []
    return getAvailablePlayers(currentTeam, squad)
  }, [currentTeam, squad])

  const sortedPlayers = useMemo(() => {
    if (!availablePlayers.length) return []
    return [...availablePlayers].sort((a, b) => {
      if (sortKey === 'goals') return b.goals - a.goals
      if (sortKey === 'assists') return b.assists - a.assists
      if (sortKey === 'cs') return (b.cleanSheets ?? 0) - (a.cleanSheets ?? 0)
      return b.rating - a.rating
    })
  }, [availablePlayers, sortKey])

  const SORT_OPTS = [
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'cs', label: 'CS' },
  ]

  if (!currentTeam) return null

  return (
    <div className="flex h-[calc(100vh-53px)] overflow-hidden">
      {/* LEFT: Team + Player list */}
      <div className="flex-1 flex flex-col border-r border-zinc-800 overflow-hidden">
        {/* Team header */}
        <div className="px-5 pt-4 pb-3 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 items-center">
              <div
                className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-zinc-700"
                style={{ backgroundColor: currentTeam.primaryColor }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-xl leading-tight text-white">{currentTeam.name}</span>
                  <span className="text-xs font-bold text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">{currentTeam.season}</span>
                  <span className="text-[10px] text-zinc-600">{getGamesPlayed(currentTeam.season)} games</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{currentTeam.achievement}</p>
              </div>
            </div>
            <button
              onClick={onSkip}
              disabled={skipsLeft <= 0}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                skipsLeft > 0
                  ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              Skip ({skipsLeft})
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-zinc-800 rounded-full h-1">
              <div
                className="bg-pl-yellow h-1 rounded-full transition-all duration-500"
                style={{ width: `${(round / totalRounds) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 whitespace-nowrap">
              {round}/{totalRounds}
            </span>
          </div>
        </div>

        {/* Sort buttons */}
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex gap-1.5">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 self-center mr-1">
            Sort
          </span>
          {SORT_OPTS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSortChange(key)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                sortKey === key
                  ? 'bg-pl-yellow text-zinc-950 border-pl-yellow'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          {isSquadFull ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="text-4xl">⚽</div>
              <h2 className="text-xl font-black text-white">Squad Ready!</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Tap any player on the pitch to rearrange positions, then simulate when you're done.
              </p>
              {swapFromSlot !== null && (
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wide">
                  {squad[swapFromSlot]?.name} selected — tap a compatible player to swap
                </p>
              )}
              <button
                onClick={onSimulate}
                className="bg-pl-yellow text-zinc-950 font-black tracking-widest uppercase text-sm px-8 py-3 rounded-lg hover:brightness-110 transition-all"
              >
                Simulate Season
              </button>
            </div>
          ) : sortedPlayers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-zinc-500">
              No eligible players from this team
            </div>
          ) : (
            <div className="slide-in">
              {sortedPlayers.map(player => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  isSelected={selectedPlayer?.id === player.id}
                  onSelect={onSelectPlayer}
                  sortKey={sortKey}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected player hint */}
        {selectedPlayer && !isSquadFull && (
          <div className="px-4 py-2.5 bg-pl-yellow text-zinc-950 text-xs font-black text-center tracking-wide uppercase">
            {selectedPlayer.name} — tap a highlighted slot
          </div>
        )}
      </div>

      {/* RIGHT: Squad panel */}
      <div className="w-72 flex-shrink-0 bg-zinc-950 overflow-y-auto">
        <SquadPanel
          squad={squad}
          selectedPlayer={selectedPlayer}
          onPlacePlayer={onPlacePlayer}
          onLiftPlayer={onLiftPlayer}
          swapFromSlot={swapFromSlot}
          onSwapSelect={onSwapSelect}
          isSquadFull={isSquadFull}
          round={round}
          totalRounds={totalRounds}
        />
      </div>
    </div>
  )
}
