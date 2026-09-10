import { useState } from 'react'
import { PIECES } from '../constants/spec'

const CATEGORY_STYLES = {
  Principal: 'bg-blue-100 text-blue-700',
  Secundario: 'bg-gray-100 text-gray-600',
  Decorativo: 'bg-purple-100 text-purple-600',
}

const TYPE_LABELS = {
  bg: { label: 'Fondo', color: 'bg-indigo-100 text-indigo-700' },
  image: { label: 'Imagen', color: 'bg-green-100 text-green-700' },
}

const TABS = [
  { id: 'proposal', label: 'Propuesta' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'spec', label: 'Spec técnica' },
]

// ─── Prompt card ──────────────────────────────────────────────────────────────

function PromptCard({ item }) {
  const [copied, setCopied] = useState(false)
  const typeStyle = TYPE_LABELS[item.type] || TYPE_LABELS.bg

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{item.breakpoint}</p>
          <span className="text-xs text-gray-400 flex-shrink-0">{item.dimensions}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${typeStyle.color}`}>
            {typeStyle.label}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-[#001E62] text-white hover:bg-[#003087]'
          }`}
        >
          {copied ? 'Copiado ✓' : 'Copiar prompt'}
        </button>
      </div>

      {/* Note */}
      {item.note && (
        <div className="px-4 pt-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{item.note}</p>
        </div>
      )}

      {/* Prompt text */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700 leading-relaxed font-mono bg-gray-50 rounded-lg p-3 select-all">
          {item.prompt}
        </p>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function ModalConceptCard({ concept }) {
  if (!concept) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-4 rounded-full bg-green-500" />
        <h3 className="text-sm font-semibold text-gray-700">Concepto editorial</h3>
      </div>
      <div className="p-4 space-y-3">
        {concept.mood && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Mood / atmósfera</p>
            <p className="text-sm text-gray-700 italic">{concept.mood}</p>
          </div>
        )}
        {concept.main_subject && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Sujeto principal</p>
            <p className="text-sm text-gray-700">{concept.main_subject}</p>
          </div>
        )}
        {concept.editorial_style && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Estilo editorial</p>
            <p className="text-sm text-gray-700">{concept.editorial_style}</p>
          </div>
        )}
        {concept.composition_notes && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Composición por breakpoint</p>
            <p className="text-xs text-gray-600 leading-relaxed">{concept.composition_notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MiscelaneasCard({ miscelaneas }) {
  if (!miscelaneas?.left && !miscelaneas?.right && !miscelaneas?.scattered?.length) return null

  const sides = [
    { side: 'Izquierda', data: miscelaneas.left, accent: 'border-l-4 border-l-blue-400' },
    { side: 'Derecha',   data: miscelaneas.right, accent: 'border-l-4 border-l-purple-400' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-4 rounded-full bg-purple-500" />
        <h3 className="text-sm font-semibold text-gray-700">Composición</h3>
      </div>

      {miscelaneas.kv_global_style && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Estilo visual del KV</p>
          <p className="text-xs text-gray-600 italic">{miscelaneas.kv_global_style}</p>
        </div>
      )}

      {/* Assets principales: izquierda y derecha */}
      {(miscelaneas.left || miscelaneas.right) && (
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Assets principales — bordes · 40% opacidad</p>
          <div className="space-y-3">
            {sides.map(({ side, data, accent }) =>
              data ? (
                <div key={side} className={`rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2 ${accent}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{side}</span>
                    <span className="text-xs font-bold text-gray-800">{data.name}</span>
                  </div>
                  {data.object_description && (
                    <p className="text-xs text-gray-600">{data.object_description}</p>
                  )}
                  {data.visual_details && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Detalles visuales</p>
                      <p className="text-xs text-gray-600">{data.visual_details}</p>
                    </div>
                  )}
                  {data.rendering && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Técnica</p>
                      <p className="text-xs text-gray-700 font-medium bg-white rounded px-2 py-1 border border-gray-200">{data.rendering}</p>
                    </div>
                  )}
                  {data.colors && (
                    <p className="text-xs font-mono text-gray-500">{data.colors}</p>
                  )}
                  {data.scale_and_placement && (
                    <p className="text-xs text-gray-400 italic">{data.scale_and_placement}</p>
                  )}
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Elementos decorativos dispersos */}
      {miscelaneas.scattered?.length > 0 && (
        <div className="px-4 pt-3 pb-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Elementos decorativos dispersos · 15-25% opacidad</p>
          <div className="flex flex-wrap gap-2">
            {miscelaneas.scattered.map((el, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-start gap-2 min-w-0">
                {el.colors && /^#[0-9A-Fa-f]{3,8}$/.test(el.colors.match(/#[0-9A-Fa-f]{3,8}/)?.[0] || '') && (
                  <div
                    className="w-4 h-4 rounded flex-shrink-0 mt-0.5 border border-black/10"
                    style={{ backgroundColor: el.colors.match(/#[0-9A-Fa-f]{3,8}/)?.[0] || '#ccc' }}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{el.name}</p>
                  {el.description && <p className="text-[10px] text-gray-500 leading-relaxed">{el.description}</p>}
                  {el.colors && <p className="text-[10px] font-mono text-gray-400 mt-0.5">{el.colors}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProposalTab({ report }) {
  const { kv_analysis, proposal, miscelaneas, modal_concept } = report

  return (
    <div className="space-y-4">
      {/* Análisis del KV */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full bg-[#001E62]" />
          <h3 className="text-sm font-semibold text-gray-700">Análisis del Key Visual</h3>
        </div>
        <div className="p-4 space-y-4">
          {kv_analysis?.palette?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Paleta cromática</p>
              <div className="space-y-2">
                {kv_analysis.palette.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg border border-black/10 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: /^#[0-9A-Fa-f]{3,8}$/.test(c?.hex || '') ? c.hex : '#ccc' }}
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-700">{c.role}</p>
                      <p className="text-xs text-gray-500">{c.hex} — {c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kv_analysis?.resources?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recursos visuales</p>
              <div className="flex flex-wrap gap-1.5">
                {kv_analysis.resources.map((r, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_STYLES[r.category] || 'bg-gray-100 text-gray-600'}`}>
                    {r.element} · {r.category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {kv_analysis?.illustration_style && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Estilo de ilustración</p>
              <p className="text-sm text-gray-600">{kv_analysis.illustration_style}</p>
            </div>
          )}

          {kv_analysis?.tone && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tono y mood</p>
              <p className="text-sm text-gray-600">{kv_analysis.tone}</p>
            </div>
          )}

          {kv_analysis?.restrictions?.filter(Boolean).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Restricciones</p>
              <ul className="space-y-1">
                {kv_analysis.restrictions.filter(Boolean).map((r, i) => (
                  <li key={i} className="text-xs text-amber-600 flex gap-1.5">
                    <span className="flex-shrink-0">⚠</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Composición: banner (bg) o concepto editorial (modal imagen) */}
      <MiscelaneasCard miscelaneas={miscelaneas} />
      <ModalConceptCard concept={modal_concept} />

      {/* Background + assets propuestos */}
      {proposal?.background && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fondo propuesto</p>
          <div className="flex items-start gap-3">
            <div
              className="w-14 h-10 rounded-lg border border-black/10 flex-shrink-0 shadow-sm"
              style={{ background: proposal.background.value || '#ccc' }}
            />
            <div>
              <p className="text-xs font-mono text-gray-500 mb-1 select-all">{proposal.background.value}</p>
              <p className="text-sm text-gray-600">{proposal.background.description}</p>
            </div>
          </div>

          {proposal.assets?.length > 0 && (
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assets propuestos</p>
              {proposal.assets.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-semibold flex-shrink-0 uppercase text-[10px]">
                    {a.frame}
                  </span>
                  <span className="text-gray-600"><strong>{a.name}</strong> — {a.description}</span>
                </div>
              ))}
            </div>
          )}

          {proposal.distribution && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Distribución</p>
              <p className="text-sm text-gray-600">{proposal.distribution}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PromptsTab({ report }) {
  const prompts = report.prompts || []
  const designerNote = report.designer_note
  const [copiedAll, setCopiedAll] = useState(false)

  const handleCopyAll = () => {
    const text = prompts
      .map((p) => `## ${p.breakpoint} — ${p.dimensions}\n${p.prompt}`)
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  if (!prompts.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-400">No se generaron prompts en esta sesión.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Aviso de imágenes adjuntas */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">!</div>
        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold text-amber-800">Cómo usar en ChatGPT</p>
          <p className="text-xs text-amber-700">
            {designerNote || 'Copiá el texto del prompt y adjuntá también las imágenes de los assets del KV en la misma conversación. La IA usará las imágenes como referencia visual.'}
          </p>
        </div>
        <button
          onClick={handleCopyAll}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all ${
            copiedAll ? 'bg-green-100 text-green-700' : 'bg-[#001E62] text-white hover:bg-[#003087]'
          }`}
        >
          {copiedAll ? 'Copiados ✓' : 'Copiar todos'}
        </button>
      </div>

      {prompts.map((item, i) => (
        <PromptCard key={item.key || i} item={item} />
      ))}
    </div>
  )
}

function SpecTab({ report }) {
  const spec = report.tech_spec
  const checklist = spec?.checklist || {}
  const checkItems = [
    { label: 'Máximo 2 assets por composición', value: checklist.max_2_assets },
    { label: 'Fondo por código de color/degradé (no imagen)', value: checklist.bg_by_code },
    { label: 'Mobile sin imágenes decorativas', value: checklist.mobile_no_images },
    { label: 'Áreas de contenido no invadidas', value: checklist.content_not_invaded },
    { label: 'Contraste WCAG AA estimado', value: checklist.wcag_estimated },
    { label: 'Touch target CTA 40px', value: checklist.touch_target },
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Especificación técnica</h3>
      </div>
      <div className="p-4 space-y-4">
        {spec?.dimensions_used && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Dimensiones</p>
            <p className="text-sm text-gray-600">{spec.dimensions_used}</p>
          </div>
        )}
        {spec?.safe_areas && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Safe areas</p>
            <p className="text-sm text-gray-600">{spec.safe_areas}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Restricciones verificadas</p>
          <div className="space-y-1.5">
            {checkItems.map((item, i) => {
              const isNA = item.value === null || item.value === undefined
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isNA ? 'bg-gray-100 text-gray-400' : item.value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {isNA ? '—' : item.value ? '✓' : '✗'}
                  </span>
                  <span className={isNA ? 'text-gray-400' : item.value ? 'text-gray-600' : 'text-red-500'}>
                    {item.label}{isNA ? ' — N/A para imagen de modal' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function GenerationReport({ report, params }) {
  const [activeTab, setActiveTab] = useState('prompts')
  const pieceConfig = PIECES.find((p) => p.value === params?.piece) || PIECES[0]
  const enrichedReport = { ...report, _piece: params?.piece }

  return (
    <div className="space-y-4">
      <div className="bg-[#001E62] rounded-xl overflow-hidden text-white">
        <div className="px-6 py-5 flex items-start justify-between">
          <div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${pieceConfig.color} text-white mb-2 inline-block`}>
              {params?.piece}
            </span>
            <h2 className="text-lg font-bold mt-1 leading-snug max-w-md">{report.summary}</h2>
          </div>
          <div className="text-right text-sm opacity-80 flex-shrink-0 ml-4">
            <p className="font-semibold">{params?.product}</p>
            <p className="text-xs text-blue-300 mt-0.5">{(report.prompts || []).length} prompts generados</p>
          </div>
        </div>
        <div className="flex border-t border-white/10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-white bg-white/10'
                  : 'text-blue-300 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.id === 'prompts' && report.prompts?.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-white/20 rounded-full px-1.5 py-0.5">
                  {report.prompts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'proposal' && <ProposalTab report={enrichedReport} />}
      {activeTab === 'prompts' && <PromptsTab report={enrichedReport} />}
      {activeTab === 'spec' && <SpecTab report={enrichedReport} />}
    </div>
  )
}
