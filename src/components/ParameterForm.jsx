import { PRODUCTS, PIECES } from '../constants/spec'

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ParameterForm({ params, onChange }) {
  return (
    <div className="space-y-3">
      <Select
        label="Producto"
        value={params.product}
        onChange={(v) => onChange({ ...params, product: v })}
        options={PRODUCTS}
      />
      <Select
        label="Pieza a generar"
        value={params.piece}
        onChange={(v) => onChange({ ...params, piece: v })}
        options={PIECES}
      />
    </div>
  )
}
