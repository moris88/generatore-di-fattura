import { Camera, Xmark } from 'iconoir-react'
import { useEffect, useRef, useState } from 'react'

interface WebcamCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function WebcamCapture({ onCapture, onClose }: Readonly<WebcamCaptureProps>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setLoading(false)
      } catch (err) {
        console.error('Errore accesso webcam:', err)
        setError('Impossibile accedere alla webcam. Assicurati di aver dato i permessi.')
        setLoading(false)
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' })
            onCapture(file)
            onClose()
          }
        }, 'image/png')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-bold text-gray-800">Scatta una foto</h3>
          <button
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            onClick={onClose}
          >
            <Xmark className="h-6 w-6" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          {loading && (
            <div className="flex h-full items-center justify-center text-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-3">Avvio fotocamera...</span>
            </div>
          )}

          {error && (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-red-500">
              <p>{error}</p>
              <button
                className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                onClick={onClose}
              >
                Chiudi
              </button>
            </div>
          )}

          <video
            autoPlay
            muted
            playsInline
            ref={videoRef}
            className={`h-full w-full object-cover ${loading || error ? 'hidden' : 'block'}`}
          />
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {!loading && !error && (
          <div className="flex items-center justify-center p-6">
            <button
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              onClick={capturePhoto}
              title="Scatta foto"
            >
              <Camera className="h-8 w-8" />
            </button>
          </div>
        )}
        
        <div className="bg-gray-50 p-3 text-center text-xs text-gray-500">
          La foto verrà aggiunta automaticamente agli allegati della fattura.
        </div>
      </div>
    </div>
  )
}
