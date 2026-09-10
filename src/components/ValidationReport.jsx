const STATUS_CONFIG = {
  pass: {
    icon: '✅',
    label: 'Cumple',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  fail: {
    icon: '❌',
    label: 'No cumple',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  unknown: {
    icon: '❓',
    label: 'Sin verificar',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
}

const RESULT_CONFIG = {
  LISTO: {
    bg: 'bg-green-500',
    text: 'text-white',
    label: 'LISTO',
    desc: 'Sin bloqueantes. Puede pasar a Front-End.',
  },
  'NO LISTO': {
    bg: 'bg-red-500',
    text: 'text-white',
    label: 'NO LISTO',
    desc: 'Tiene al menos un bloqueante que debe corregirse antes del handoff.',
  },
  'CON OBSERVACIONES': {
    bg: 'bg-amber-400',
    text: 'text-white',
    label: 'CON OBSERVACIONES',
    desc: 'Sin bloqueantes, pero hay puntos que requieren atención.',
  },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function SeverityBadge({ severity }) {
  if (!severity) return null
  const isBlocker = severity === 'Bloqueante'
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
        isBlocker ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {isBlocker ? 'BLOQ.' : 'OBS.'}
    </span>
  )
}

function CriterionRow({ criterion, index }) {
  const cfg = STATUS_CONFIG[criterion.status] || STATUS_CONFIG.unknown
  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="px-4 py-3 text-center text-xs font-bold text-gray-400 w-8">{criterion.id}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-1.5">
          {criterion.name}
          <SeverityBadge severity={criterion.severity} />
        </div>
      </td>
      <td className="px-4 py-3 text-center w-36">
        <StatusBadge status={criterion.status} />
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 leading-relaxed">{criterion.observation}</td>
    </tr>
  )
}

export function ValidationReport({ report, variant, breakpoint, product }) {
  const resultCfg = RESULT_CONFIG[report.result] || RESULT_CONFIG['CON OBSERVACIONES']
  const failCount = report.criteria.filter((c) => c.status === 'fail').length
  const passCount = report.criteria.filter((c) => c.status === 'pass').length
  const unknownCount = report.criteria.filter((c) => c.status === 'unknown').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className={`px-6 py-4 ${resultCfg.bg} ${resultCfg.text}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                Resultado
              </p>
              <h2 className="text-2xl font-bold mt-0.5">{resultCfg.label}</h2>
            </div>
            <div className="text-right text-sm opacity-90">
              <p>{variant} · {breakpoint}</p>
              <p className="font-semibold">{product}</p>
            </div>
          </div>
          <p className="text-sm mt-2 opacity-90">{resultCfg.desc}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-bold text-green-600">{passCount}</p>
            <p className="text-xs text-gray-500">Aprobados</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-bold text-red-500">{failCount}</p>
            <p className="text-xs text-gray-500">Rechazados</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xl font-bold text-amber-500">{unknownCount}</p>
            <p className="text-xs text-gray-500">No verificables</p>
          </div>
        </div>
      </div>

      {/* Criteria table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Checklist de criterios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-xs text-gray-400 font-semibold text-center">#</th>
                <th className="px-4 py-2 text-xs text-gray-400 font-semibold">Criterio</th>
                <th className="px-4 py-2 text-xs text-gray-400 font-semibold text-center">Estado</th>
                <th className="px-4 py-2 text-xs text-gray-400 font-semibold">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.criteria.map((c, i) => (
                <CriterionRow key={c.id} criterion={c} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical issues */}
      {report.critical_issues?.filter(Boolean).length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <h3 className="text-sm font-semibold text-red-700">Problemas críticos</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {report.critical_issues.filter(Boolean).map((issue, i) => (
              <li key={i} className="px-4 py-3 flex gap-3 text-sm text-gray-700">
                <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations?.filter(Boolean).length > 0 && (
        <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <h3 className="text-sm font-semibold text-blue-700">Recomendaciones</h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {report.recommendations.filter(Boolean).map((rec, i) => (
              <li key={i} className="px-4 py-3 flex gap-3 text-sm text-gray-700">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 px-1 pb-2">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </div>
    </div>
  )
}
