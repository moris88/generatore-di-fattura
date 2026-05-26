export const STORAGE_KEY = 'ultima_fattura_data'
export const SIGNATURES_KEY = 'ultima_fattura_firme'
export const ATTACHMENTS_KEY = 'ultima_fattura_allegati'

/**
 * Converte un oggetto File in una stringa Base64
 */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

/**
 * Converte una stringa Base64 in un oggetto File
 */
export const base64ToFile = async (
  base64: string,
  filename: string,
  type: string
): Promise<File> => {
  const res = await fetch(base64)
  const blob = await res.blob()
  return new File([blob], filename, { type })
}

/**
 * Recupera i dati della fattura dal localStorage in modo sincrono
 */
export const getSavedFatturaData = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Errore parsing dati salvati', e)
    }
  }
  return null
}

/**
 * Recupera le firme dal localStorage in modo sincrono
 */
export const getSavedSignatures = () => {
  const saved = localStorage.getItem(SIGNATURES_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Errore parsing firme salvate', e)
    }
  }
  return { technical: '', client: '' }
}

/**
 * Genera un ID univoco per la fattura
 * Formato: YYYYMMDD-XXXX (dove XXXX è una stringa casuale)
 */
export const generateUniqueID = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${date}-${random}`
}
