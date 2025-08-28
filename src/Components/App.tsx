import html2canvas from 'html2canvas'
import { ArrowLeft, Eye, SubmitDocument } from 'iconoir-react'
import { jsPDF } from 'jspdf'
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'

import FormFattura from './FormFattura'
import GeneraFattura from './GeneraFattura'
import Popup from './Popup'
import SignPad from './SignPad'

export default function App() {
  const [attachments, setAttachments] = useState<File[]>([])
  const [fatturaData, setFatturaData] = useState<any>(null)
  const [signature, setSignature] = useState<string>('')
  const [technicalSignature, setTechnicalSignature] = useState<string>('')
  const [generated, setGenerated] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [showPopup, setShowPopup] = useState<boolean>(false)

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
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-100 p-4">
      {showPopup && (
        <Popup
          isOpen={showPopup}
          onCancel={() => setShowPopup(false)}
          onConfirm={handleGeneratePDF}
        />
      )}
      <div className="flex flex-col items-start justify-center gap-4 p-6 lg:flex-row">
        <div className="w-full rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-center text-xl font-bold uppercase">
            Generatore di fattura
          </h1>

          <FormFattura
            onChange={(e) => {
              setGenerated(true)
              setFatturaData(e)
            }}
          />

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-2 lg:w-1/2">
              <label className="font-semibold">Firma digitale tecnico:</label>
              <SignPad
                value={technicalSignature}
                onChange={setTechnicalSignature}
              />
            </div>
            <div className="flex w-full flex-col gap-2 lg:w-1/2">
              <label className="font-semibold">Firma digitale cliente:</label>
              <SignPad value={signature} onChange={setSignature} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <label className="font-semibold">Allega file PDF:</label>
            <input
              multiple
              accept="application/pdf"
              type="file"
              onChange={handleAddAttachment}
            />
            <label className="font-semibold">Scatta o carica foto:</label>
            <input
              multiple
              accept="image/*"
              capture="environment"
              type="file"
              onChange={handleAddPhoto}
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              className="btn btn-primary"
              disabled={!setGenerated}
              onClick={() => setShowPreview(true)}
            >
              <Eye />
              Anteprima
            </button>
          </div>
        </div>
        {generated && showPreview && (
          <div className="flex flex-col items-center gap-2">
            <GeneraFattura
              fatturaData={fatturaData}
              signature={signature}
              technicalSignature={technicalSignature}
            />
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPreview(false)}
              >
                <ArrowLeft />
                Chiudi
              </button>
              <button
                className="btn btn-primary"
                disabled={!setGenerated}
                onClick={() => setShowPopup(true)}
              >
                <SubmitDocument />
                Genera PDF
              </button>
            </div>
          </div>
        )}
      </div>
      {/* <pre>{JSON.stringify(fatturaData, null, 3)}</pre> */}
    </div>
  )
}
