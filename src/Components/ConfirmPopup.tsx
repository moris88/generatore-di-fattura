interface ConfirmPopupProps {
	isOpen: boolean
	title: string
	message: string
	onConfirm: () => void
	onCancel: () => void
	confirmText?: string
	confirmColor?: string
}

export default function ConfirmPopup({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = 'Conferma',
	confirmColor = 'bg-blue-600',
}: Readonly<ConfirmPopupProps>) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 z-250 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<div className="fade-in zoom-in w-full max-w-md animate-in rounded-2xl bg-white p-6 shadow-2xl duration-200">
				<h2 className="mb-2 font-black text-gray-800 text-xl uppercase tracking-tight">
					{title}
				</h2>
				<p className="mb-8 font-medium text-gray-600 text-sm">{message}</p>

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
						className={`rounded-xl ${confirmColor} px-8 py-3 font-bold text-sm text-white shadow-lg transition-all hover:brightness-110 active:scale-95`}
						onClick={onConfirm}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}
