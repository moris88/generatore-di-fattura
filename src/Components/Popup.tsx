import { useState } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message?: string
  defaultFilename?: string
  onConfirm: (filename: string) => void
  onCancel: () => void
}

function Popup({
  isOpen,
  title = 'Conferma Generazione PDF',
  message = 'Inserisci il nome del file per il salvataggio:',
  defaultFilename = 'fattura',
  onConfirm,
  onCancel,
}: Readonly<ConfirmModalProps>) {
  const [filename, setFilename] = useState(defaultFilename)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h2 className="mb-2 text-xl font-black text-gray-800 uppercase tracking-tight">{title}</h2>
        <p className="mb-6 text-sm text-gray-600 font-medium">{message}</p>
        
        <div className="mb-8">
          <label htmlFor="filename" className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome File (.pdf)</label>
          <div className="flex items-center gap-2 rounded-lg border-2 border-blue-100 bg-blue-50 p-1 focus-within:border-blue-500 transition-colors">
            <input 
              id="filename"
              type="text" 
              className="flex-1 bg-transparent px-3 py-2 font-bold text-blue-700 outline-none placeholder:text-blue-200"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onConfirm(filename)}
            />
            <span className="pr-3 font-black text-blue-300">.pdf</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            className="rounded-xl px-6 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100" 
            onClick={onCancel}
          >
            Annulla
          </button>
          <button 
            className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95" 
            onClick={() => onConfirm(filename)}
          >
            Scarica Documento
          </button>
        </div>
      </div>
    </div>
  )
}

export default Popup
