import html2canvas from 'html2canvas'
import { ArrowLeft, Camera, Eye, SubmitDocument } from 'iconoir-react'
import { jsPDF } from 'jspdf'
import { PDFDocument } from 'pdf-lib'
import { useEffect, useState } from 'react'

import FormFattura from './FormFattura'
import GeneraFattura from './GeneraFattura'
import Popup from './Popup'
import SignPad from './SignPad'
import WebcamCapture from './WebcamCapture'

const STORAGE_KEY = 'ultima_fattura_data'

export default function App() {
  const [attachments, setAttachments] = useState<File[]>([])
  const [fatturaData, setFatturaData] = useState<any>(null)
  const [signature, setSignature] = useState<string>('')
  const [technicalSignature, setTechnicalSignature] = useState<string>('')
  const [generated, setGenerated] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const [showWebcam, setShowWebcam] = useState<boolean>(false)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  // Carica i dati dal localStorage all'avvio
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFatturaData(parsed)
        setGenerated(true)
      } catch (e) {
        console.error('Errore nel caricamento dei dati salvati', e)
      }
    }
  }, [])

  // Salva i dati nel localStorage ogni volta che cambiano
  useEffect(() => {
    if (fatturaData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fatturaData))
    }
  }, [fatturaData])

  // Aggiungi allegati PDF
  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  // Aggiungi foto dalla fotocamera
  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((f) => f)
      setAttachments([...attachments, ...files])
    }
  }

  const handleGeneratePDF = async () => {
    // 1️⃣ Converti la fattura HTML in PDF (prima pagina)
    const fatturaElement = document.getElementById('fatturaDiv')
    if (!fatturaElement) {
      setShowPopup(false)
      return alert('Fattura non trovata')
    }

    // 2️⃣ Assicurati che l'immagine sia caricata prima
    const signatureImg = fatturaElement.querySelector(
      'img[alt="Firma Cliente"]'
    ) as HTMLImageElement | null
    if (signatureImg && !signatureImg.complete) {
      await new Promise<void>((resolve) => {
        signatureImg.onload = () => resolve()
        signatureImg.onerror = () => resolve()
      })
    }

    const technicalSignatureImg = fatturaElement.querySelector(
      'img[alt="Firma Cliente"]'
    ) as HTMLImageElement | null
    if (technicalSignatureImg && !technicalSignatureImg.complete) {
      await new Promise<void>((resolve) => {
        technicalSignatureImg.onload = () => resolve()
        technicalSignatureImg.onerror = () => resolve()
      })
    }

    const canvas = await html2canvas(fatturaElement, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'pt', 'a4')
    const pdfWidth = 595
    const pdfHeight = 842

    const imgProps = pdf.getImageProperties(imgData)
    const imgWidth = imgProps.width
    const imgHeight = imgProps.height

    const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

    const x = (pdfWidth - imgWidth * scale) / 2
    const y = 0

    pdf.addImage(imgData, 'PNG', x, y, imgWidth * scale, imgHeight * scale)

    // 3️⃣ Converti il PDF jsPDF in ArrayBuffer
    const jsPdfBytes = pdf.output('arraybuffer')

    // 4️⃣ Crea un PDF-lib document e copia la prima pagina (fattura + firma)
    const finalPdf = await PDFDocument.create()
    const srcPdf = await PDFDocument.load(jsPdfBytes)
    const pages = await finalPdf.copyPages(srcPdf, srcPdf.getPageIndices())
    pages.forEach((page) => finalPdf.addPage(page))

    // 5️⃣ Aggiungi allegati PDF
    for (const file of attachments) {
      if (file.type === 'application/pdf') {
        const fileBytes = await file.arrayBuffer()
        const attachmentPdf = await PDFDocument.load(fileBytes)
        const attachmentPages = await finalPdf.copyPages(
          attachmentPdf,
          attachmentPdf.getPageIndices()
        )
        attachmentPages.forEach((page) => finalPdf.addPage(page))
      } else if (file.type.startsWith('image/')) {
        // Se è immagine, aggiungi come pagina singola
        const imgDataUrl = await fileToDataURL(file)
        const tempCanvas = document.createElement('canvas')
        const img = new Image()
        img.src = imgDataUrl
        await new Promise((res) => (img.onload = res))
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        const ctx = tempCanvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const imgBytes = tempCanvas.toDataURL('image/png')
        const tempPdf = new jsPDF('p', 'pt', 'a4')
        tempPdf.addImage(imgBytes, 'PNG', 0, 0, 595, 842)
        const tempPdfBytes = tempPdf.output('arraybuffer')
        const tempPdfDoc = await PDFDocument.load(tempPdfBytes)
        const imgPages = await finalPdf.copyPages(
          tempPdfDoc,
          tempPdfDoc.getPageIndices()
        )
        imgPages.forEach((page) => finalPdf.addPage(page))
      }
    }

    // 6️⃣ Salva il PDF finale
    const finalBytes = await finalPdf.saveAsBase64()
    const blob = new Blob(
      [Uint8Array.from(atob(finalBytes), (c) => c.charCodeAt(0))],
      { type: 'application/pdf' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'documento.pdf'
    a.click()
    URL.revokeObjectURL(url)
    setShowPopup(false)
  }

  const fileToDataURL = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.onerror = rej
      reader.readAsDataURL(file)
    })

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-100 p-2 sm:p-4">
      {showPopup && (
        <Popup
          isOpen={showPopup}
          onCancel={() => setShowPopup(false)}
          onConfirm={handleGeneratePDF}
        />
      )}
      <div className="flex w-full max-w-7xl flex-col items-start justify-center gap-4 lg:flex-row lg:p-6">
        <div className="w-full flex-1 rounded-2xl bg-white p-4 shadow-md sm:p-6">
          <h1 className="mb-6 text-center text-xl font-black uppercase tracking-tight text-blue-700 sm:text-2xl">
            Generatore di fattura
          </h1>

          <FormFattura
            initialData={fatturaData}
            onChange={(e) => {
              setGenerated(true)
              setFatturaData(e)
            }}
            onValidationChange={setIsFormValid}
          />

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase text-gray-700">
                Firma digitale tecnico:
              </label>
              <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <SignPad
                  value={technicalSignature}
                  onChange={setTechnicalSignature}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase text-gray-700">
                Firma digitale cliente:
              </label>
              <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <SignPad value={signature} onChange={setSignature} />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Allega file PDF:</label>
                <input
                  multiple
                  accept="application/pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  type="file"
                  onChange={handleAddAttachment}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Foto e Allegati Immagine:
                </label>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <input
                    multiple
                    accept="image/*"
                    className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                    type="file"
                    onChange={handleAddPhoto}
                  />
                  <button
                    className="flex items-center justify-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    onClick={() => setShowWebcam(true)}
                  >
                    <Camera className="h-4 w-4" />
                    Usa Webcam/Fotocamera
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              className={`btn btn-primary flex w-full items-center justify-center gap-2 py-4 sm:w-auto sm:px-12 transition-all duration-300 ${!isFormValid ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105'}`}
              disabled={!isFormValid}
              onClick={() => {
                setShowPreview(true)
                // Scroll to preview on mobile
                if (window.innerWidth < 1024) {
                  setTimeout(() => {
                    document
                      .getElementById('preview-section')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }
              }}
            >
              <Eye />
              {isFormValid ? 'Anteprima Fattura' : 'Compila i campi obbligatori'}
            </button>
          </div>
        </div>

        {generated && showPreview && (
          <div
            className="flex w-full flex-col items-center gap-4 lg:w-auto"
            id="preview-section"
          >
            <div className="w-full overflow-x-auto rounded-xl bg-white p-2 shadow-xl sm:p-4">
              <GeneraFattura
                fatturaData={fatturaData}
                signature={signature}
                technicalSignature={technicalSignature}
              />
            </div>
            <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="btn btn-secondary flex w-full items-center justify-center gap-2 sm:w-auto"
                onClick={() => setShowPreview(false)}
              >
                <ArrowLeft />
                Modifica Dati
              </button>
              <button
                className="btn btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
                disabled={!isFormValid}
                onClick={() => setShowPopup(true)}
              >
                <SubmitDocument />
                Scarica PDF Finale
              </button>
            </div>
          </div>
        )}
      </div>

      {showWebcam && (
        <WebcamCapture
          onCapture={(file) => setAttachments([...attachments, file])}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  )
}
