// components/SignPad.tsx
import { Trash } from 'iconoir-react'
import { useEffect, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { twMerge } from 'tailwind-merge'

export interface SignPadProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export default function SignPad({
  value,
  onChange,
  className,
}: Readonly<SignPadProps>) {
  const sigRef = useRef<SignatureCanvas>(null)

  // Aggiorna il valore quando cambia
  const updateSignature = () => {
    if (!sigRef.current) return
    const dataUrl = sigRef.current.toDataURL('image/png')
    onChange?.(dataUrl)
  }

  // Gestione aggiornamento esterno del valore
  useEffect(() => {
    if (!sigRef.current) return
    if (!value) {
      sigRef.current.clear()
      return
    }
    const current = sigRef.current.toDataURL('image/png')
    if (current === value) return
    const canvas = sigRef.current.getCanvas()
    sigRef.current.clear()
    sigRef.current.fromDataURL(value, {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    })
  }, [value])

  return (
    <div className={twMerge('relative', 'h-20', className)}>
      <SignatureCanvas
        ref={sigRef}
        canvasProps={{
          className: 'w-full h-full',
          style: { touchAction: 'none' }, // blocca scroll su mobile
          onMouseUp: updateSignature,
          onTouchEnd: updateSignature,
        }}
        penColor="black"
        throttle={1}
        onEnd={updateSignature} // fallback desktop
      />
      <div className="absolute right-2 bottom-2">
        <button
          className="cursor-pointer hover:text-red-500"
          type="button"
          onClick={() => {
            sigRef.current?.clear()
            onChange?.('')
          }}
        >
          <Trash className="h-6 w-6 md:h-4 md:w-4" />
        </button>
      </div>
    </div>
  )
}
