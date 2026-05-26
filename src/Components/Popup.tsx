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
		<div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<div className="fade-in zoom-in w-full max-w-md animate-in rounded-2xl bg-white p-6 shadow-2xl duration-200">
				<h2 className="mb-2 font-black text-gray-800 text-xl uppercase tracking-tight">
					{title}
				</h2>
				<p className="mb-6 font-medium text-gray-600 text-sm">{message}</p>

				<div className="mb-8">
					<label
						htmlFor="filename"
						className="mb-2 block font-bold text-gray-400 text-xs uppercase"
					>
						Nome File (.pdf)
					</label>
					<div className="flex items-center gap-2 rounded-lg border-2 border-blue-100 bg-blue-50 p-1 transition-colors focus-within:border-blue-500">
						<input
							id="filename"
							type="text"
							className="flex-1 bg-transparent px-3 py-2 font-bold text-blue-700 outline-none placeholder:text-blue-200"
							value={filename}
							onChange={(e) => setFilename(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && onConfirm(filename)}
						/>
						<span className="pr-3 font-black text-blue-300">.pdf</span>
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						className="rounded-xl px-6 py-3 font-bold text-gray-500 text-sm transition-colors hover:bg-gray-100"
						onClick={onCancel}
					>
						Annulla
					</button>
					<button
						type="button"
						className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-sm text-white shadow-blue-200 shadow-lg transition-all hover:bg-blue-700 active:scale-95"
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
