import { useState } from 'react'
import { ImageUploader } from './components/ImageUploader'
import { ParameterForm } from './components/ParameterForm'
import { GenerationReport } from './components/GenerationReport'
import { HistoryPanel } from './components/HistoryPanel'
import { generateDesign } from './lib/claudeClient'
import { useHistory } from './hooks/useHistory'

const DEFAULT_PARAMS = {
  product: 'LN',
  piece: 'Paywall',
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">Analizando el Key Visual...</p>
        <p className="text-xs text-gray-400 mt-1">Esto puede tardar unos segundos</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3 text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-2">
        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500">Los prompts generados aparecerán acá</p>
      <p className="text-xs text-gray-400 max-w-xs">
        Subí el Key Visual, seleccioná producto y pieza, y hacé clic en Generar
      </p>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('generate')
  const [image, setImage] = useState(null)
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const { history, addEntry, clearHistory } = useHistory()

  const handleGenerate = async () => {
    if (!image || loading) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const result = await generateDesign({ image, ...params })
      setReport(result)
      await addEntry(image, params, result)
    } catch (err) {
      const message =
        err?.error?.message ||
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        'Error inesperado. Abrí la consola del browser (F12) para ver el detalle.'
      setError(message)
      console.error('[generateDesign]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#001E62] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Generador de Piezas de Conversión</h1>
            <p className="text-xs text-blue-300 mt-0.5">Backgrounds y Modales · LA NACION</p>
          </div>
          <div className="flex gap-2">
            {['LN', 'CLN', 'Foodit'].map((p) => (
              <span key={p} className="text-xs px-2 py-1 rounded bg-white/10 text-blue-200 font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'generate', label: 'Generar' },
              { id: 'history', label: `Historial${history.length > 0 ? ` (${history.length})` : ''}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {activeTab === 'generate' && (
          <div className="grid grid-cols-[300px_1fr] gap-6">
            {/* Left panel */}
            <aside className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
                <ImageUploader
                  image={image}
                  onImageChange={(f) => { setImage(f); setReport(null) }}
                />
                <div className="border-t border-gray-100 pt-4">
                  <ParameterForm params={params} onChange={setParams} />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!image || loading}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                    !image || loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#001E62] hover:bg-[#003087] text-white shadow-sm hover:shadow'
                  }`}
                >
                  {loading ? 'Analizando Key Visual...' : 'Generar prompts'}
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cómo usar</p>
                <ol className="space-y-2">
                  {[
                    'Subí el Key Visual de la campaña',
                    'Seleccioná producto y pieza',
                    'Hacé clic en Generar prompts',
                    'Copiá el prompt del breakpoint que necesitás',
                    'Pegalo en ChatGPT',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-500">
                      <span className="w-4 h-4 rounded-full bg-[#001E62] text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            {/* Right panel */}
            <section className="min-h-[600px]">
              {loading && <LoadingSpinner />}

              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-2">
                  <p className="text-sm font-semibold text-red-700">Error al generar</p>
                  <p className="text-sm text-red-600 leading-relaxed">{error}</p>
                  <p className="text-xs text-red-400 pt-1">
                    Causas comunes: imagen demasiado grande, API key incorrecta, o problema de red.
                  </p>
                </div>
              )}

              {!loading && !error && !report && <EmptyState />}

              {!loading && !error && report && (
                <GenerationReport report={report} params={params} />
              )}
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryPanel history={history} onClear={clearHistory} />
        )}
      </main>
    </div>
  )
}
