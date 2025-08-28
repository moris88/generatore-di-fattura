interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

function Popup({
  isOpen,
  title = 'Conferma',
  message = 'Sei sicuro di procedere?',
  onConfirm,
  onCancel,
}: Readonly<ConfirmModalProps>) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onCancel}>
            Annulla
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}

export default Popup
