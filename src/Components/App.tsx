import html2canvas from 'html2canvas'
import { ArrowLeft, Camera, Eye, NavArrowDown, NavArrowUp, SubmitDocument, Trash, Xmark } from 'iconoir-react'
import { jsPDF } from 'jspdf'
import { degrees, PDFDocument } from 'pdf-lib'
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
  const [previewFile, setPreviewFile] = useState<{ url: string, type: string, name: string } | null>(null)
  const [showAttachmentList, setShowAttachmentList] = useState(true)
  const [attachmentPreviews, setAttachmentPreviews] = useState<{url: string, type: string, name: string}[]>([])

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

  // Gestione anteprime allegati per la sezione "Anteprima Fattura"
  useEffect(() => {
    const urls = attachments.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name
    }))
    setAttachmentPreviews(urls)
    return () => urls.forEach(item => URL.revokeObjectURL(item.url))
  }, [attachments])

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

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const openPreview = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreviewFile({ url, type: file.type, name: file.name })
  }

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.url)
      setPreviewFile(null)
    }
  }

  const handleGeneratePDF = async (customFilename: string) => {
    // 1️⃣ Converti la fattura HTML in PDF (prima pagina)
    const fatturaElement = document.getElementById('fatturaDiv')
    if (!fatturaElement) {
      setShowPopup(false)
      return alert('Fattura non trovata')
    }

    // 2️⃣ Assicurati che le immagini siano caricate prima
    const images = fatturaElement.querySelectorAll('img')
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })
    }))

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

    // 3️⃣ Converti il PDF jsPDF in Uint8Array
    const jsPdfBytes = pdf.output('arraybuffer')

    // 4️⃣ Crea un PDF-lib document e copia la prima pagina
    const finalPdf = await PDFDocument.create()
    const srcPdf = await PDFDocument.load(jsPdfBytes)
    const pages = await finalPdf.copyPages(srcPdf, srcPdf.getPageIndices())
    pages.forEach((page) => finalPdf.addPage(page))

    // 5️⃣ Aggiungi allegati
    for (const file of attachments) {
      if (file.type === 'application/pdf') {
        const fileBytes = await file.arrayBuffer()
        const attachmentPdf = await PDFDocument.load(fileBytes)
        const attachmentPages = await finalPdf.copyPages(
          attachmentPdf,
          attachmentPdf.getPageIndices()
        )
        
        attachmentPages.forEach((page) => {
          const { width, height } = page.getSize()
          // Se la pagina è in orientamento orizzontale (width > height), ruotala di 90 gradi
          if (width > height) {
            page.setRotation(degrees(90))
          }
          finalPdf.addPage(page)
        })
      } else if (file.type.startsWith('image/')) {
        const fileBytes = await file.arrayBuffer()
        let image
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await finalPdf.embedJpg(fileBytes)
        } else {
          image = await finalPdf.embedPng(fileBytes)
        }
        
        // Crea una pagina A4 (595.28 x 841.89 pt)
        const page = finalPdf.addPage([595.28, 841.89])
        const { width: imgWidth, height: imgHeight } = image.scale(1)
        
        // Calcola la scala per adattare l'immagine alla pagina A4 lasciando un piccolo margine (20pt)
        const margin = 40
        const maxWidth = 595.28 - margin
        const maxHeight = 841.89 - margin
        
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
        const finalWidth = imgWidth * scale
        const finalHeight = imgHeight * scale
        
        // Centra l'immagine nella pagina
        page.drawImage(image, {
          x: (595.28 - finalWidth) / 2,
          y: (841.89 - finalHeight) / 2,
          width: finalWidth,
          height: finalHeight,
        })
      }
    }

    // 6️⃣ Salva e scarica il PDF finale
    const finalBytes = await finalPdf.save()
    const blob = new Blob([new Uint8Array(finalBytes)], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    // Pulisci il nome file se l'utente ha aggiunto .pdf
    const cleanFilename = customFilename.replace(/\.pdf$/i, '')
    a.download = `${cleanFilename || 'fattura'}.pdf`
    
    a.click()
    URL.revokeObjectURL(url)
    setShowPopup(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gray-100 p-2 sm:p-4">
      {showPopup && (
        <Popup
          isOpen={showPopup}
          defaultFilename={`Fattura_${fatturaData?.numero || 'Generica'}`}
          onCancel={() => setShowPopup(false)}
          onConfirm={handleGeneratePDF}
        />
      )}
      <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-8 lg:p-6">
        <div className="w-full rounded-2xl bg-white p-4 shadow-md sm:p-6">
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

            {/* Lista Allegati */}
            {attachments.length > 0 && (
              <div className="mt-4 rounded-xl border bg-gray-50 overflow-hidden">
                <button 
                  onClick={() => setShowAttachmentList(!showAttachmentList)}
                  className="flex w-full items-center justify-between bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700"
                >
                  <span>ALLEGATI ({attachments.length})</span>
                  {showAttachmentList ? <NavArrowUp /> : <NavArrowDown />}
                </button>
                
                {showAttachmentList && (
                  <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm border border-gray-200">
                        <div className="flex flex-col overflow-hidden mr-2">
                          <span className="truncate text-xs font-bold text-gray-800">{file.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase">{file.type.split('/')[1]} • {(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => openPreview(file)}
                            className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100"
                          >
                            VEDI
                          </button>
                          <button 
                            onClick={() => removeAttachment(idx)}
                            className="rounded-md bg-red-50 p-1 text-red-600 hover:bg-red-100"
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              className={`btn btn-primary flex w-full items-center justify-center gap-2 py-4 sm:w-auto sm:px-12 transition-all duration-300 ${!isFormValid ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105'}`}
              disabled={!isFormValid}
              onClick={() => {
                setShowPreview(true)
                // Scroll to preview with a small delay to ensure the DOM element is rendered
                setTimeout(() => {
                  document
                    .getElementById('preview-section')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
              }}
            >
              <Eye />
              {isFormValid ? 'Anteprima Fattura' : 'Compila i campi obbligatori'}
            </button>
          </div>
        </div>

        {generated && showPreview && (
          <div
            className="flex w-full flex-col items-center gap-6"
            id="preview-section"
          >
            <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-blue-700">
              <Eye className="h-4 w-4" />
              ANTEPRIMA DOCUMENTO
            </div>
            
            {/* Anteprima Documento Main */}
            <div className="w-full overflow-x-auto rounded-xl bg-white p-2 shadow-2xl sm:p-8">
              <GeneraFattura
                fatturaData={fatturaData}
                signature={signature}
                technicalSignature={technicalSignature}
              />
            </div>

            {/* Anteprima Allegati in coda al documento */}
            {attachmentPreviews.length > 0 && (
              <div className="w-full space-y-8">
                <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-xs font-bold text-green-700 w-fit mx-auto">
                  ANTEPRIMA ALLEGATI
                </div>
                {attachmentPreviews.map((preview, idx) => (
                  <div key={idx} className="w-full overflow-hidden rounded-xl bg-white shadow-xl border border-gray-200">
                    <div className="bg-gray-50 px-4 py-2 border-b text-[10px] font-bold text-gray-500 uppercase flex justify-between">
                      <span>Allegato {idx + 1}: {preview.name}</span>
                      <span>{preview.type}</span>
                    </div>
                    <div className="p-2 sm:p-4 bg-gray-100 flex items-center justify-center">
                      {preview.type.startsWith('image/') ? (
                        <img src={preview.url} alt={`Allegato ${idx + 1}`} className="max-h-[800px] object-contain shadow-sm bg-white" />
                      ) : (
                        <div className="flex flex-col items-center gap-4 py-12">
                          <div className="h-20 w-16 bg-red-100 rounded-lg flex items-center justify-center border-2 border-red-200 shadow-sm">
                            <span className="font-black text-red-600">PDF</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600 text-center">
                            Il PDF verrà allegato come pagina aggiuntiva<br/>
                            <span className="text-xs font-normal">(Non visualizzabile direttamente in questa anteprima)</span>
                          </p>
                          <button 
                            onClick={() => setPreviewFile(preview)}
                            className="text-xs font-bold text-blue-600 underline"
                          >
                            Clicca qui per vederlo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 sm:flex-row pb-12">
              <button
                className="btn btn-secondary flex w-full items-center justify-center gap-2 sm:w-auto px-8"
                onClick={() => {
                  setShowPreview(false)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <ArrowLeft />
                Torna a Modifica
              </button>
              <button
                className="btn btn-primary flex w-full items-center justify-center gap-2 sm:w-auto px-12 py-4"
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

      {/* Anteprima File Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-800 truncate max-w-xs sm:max-w-md">{previewFile.name}</h3>
                <span className="text-[10px] text-gray-500 uppercase">{previewFile.type}</span>
              </div>
              <button
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                onClick={closePreview}
              >
                <Xmark className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden bg-gray-200">
              {previewFile.type.startsWith('image/') ? (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <img src={previewFile.url} alt="Anteprima" className="max-h-full max-w-full object-contain shadow-lg" />
                </div>
              ) : (
                <iframe src={previewFile.url} className="h-full w-full border-0" title="PDF Preview" />
              )}
            </div>
            
            <div className="flex items-center justify-center p-4 border-t">
              <button 
                onClick={closePreview}
                className="btn btn-secondary px-8"
              >
                Chiudi Anteprima
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
