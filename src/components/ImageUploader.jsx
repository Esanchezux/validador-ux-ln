import { useCallback, useState, useRef } from 'react'

export function ImageUploader({ image, onImageChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const previewUrl = image ? URL.createObjectURL(image) : null

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) onImageChange(file)
    },
    [onImageChange],
  )

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Key Visual de la campaña
      </p>
      <div
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : image
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {image && previewUrl ? (
          <div className="p-3">
            <img
              src={previewUrl}
              alt="Key Visual"
              className="w-full max-h-52 object-contain rounded-lg"
            />
            <p className="text-xs text-gray-400 text-center mt-2 truncate px-2">{image.name}</p>
            <p className="text-xs text-blue-500 text-center mt-1">Clic para cambiar</p>
          </div>
        ) : (
          <div className="py-10 px-4 text-center">
            <svg
              className="w-10 h-10 mx-auto text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="font-medium text-gray-600 text-sm">Subí el Key Visual de la campaña</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — hasta 10MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { if (e.target.files[0]) onImageChange(e.target.files[0]) }}
        />
      </div>
    </div>
  )
}
