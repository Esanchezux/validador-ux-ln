import { useState } from 'react'

const STORAGE_KEY = 'validador-ln-history'
const MAX_ENTRIES = 30

async function makeThumbnail(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxW = 160
      const ratio = maxW / img.width
      canvas.width = maxW
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.55))
    }
    img.src = url
  })
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage lleno — conservar solo la mitad más reciente
    const trimmed = entries.slice(0, Math.floor(entries.length / 2))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }
}

export function useHistory() {
  const [history, setHistory] = useState(loadFromStorage)

  async function addEntry(file, params, report) {
    const thumbnail = await makeThumbnail(file)
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      thumbnail,
      params,
      report,
    }
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES)
      saveToStorage(updated)
      return updated
    })
    return entry
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }

  return { history, addEntry, clearHistory }
}
