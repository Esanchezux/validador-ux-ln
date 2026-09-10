import { useState } from 'react'
import { GenerationReport } from './GenerationReport'
import { PIECES } from '../constants/spec'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `Hace ${m}min`
  if (h < 24) return `Hace ${h}h`
  return `Hace ${d}d`
}

function HistoryCard({ entry, isSelected, onClick }) {
  const { params } = entry
  const pieceConfig = PIECES.find((p) => p.value === params?.piece) || PIECES[0]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border overflow-hidden transition-all bg-white ${
        isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative bg-gray-100 h-24 overflow-hidden">
        <img src={entry.thumbnail} alt="" className="w-full h-full object-cover object-top" />
        <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${pieceConfig.color}`}>
          {params?.piece}
        </span>
      </div>
      {/* Info */}
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-gray-700 truncate">{params?.product}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo(entry.timestamp)}</p>
      </div>
    </button>
  )
}

export function HistoryPanel({ history, onClear }) {
  const [selectedId, setSelectedId] = useState(null)
  const selected = history.find((e) => e.id === selectedId)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-500">Sin historial aún</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Las generaciones que realices aparecerán acá automáticamente
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[240px_1fr] gap-6 items-start">
      {/* Lista */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {history.length} generación{history.length !== 1 ? 'es' : ''}
          </p>
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Limpiar todo
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          {history.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedId === entry.id}
              onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
            />
          ))}
        </div>
      </div>

      {/* Reporte seleccionado */}
      <div>
        {selected ? (
          <GenerationReport report={selected.report} params={selected.params} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-2 bg-white rounded-xl border border-gray-200">
            <p className="text-sm text-gray-400">
              Seleccioná una generación para ver la propuesta completa
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
