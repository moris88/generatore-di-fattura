export interface Prodotto {
  descrizione: string
  quantita: number
  prezzo_unitario: number
}

export interface FatturaData {
  numero: string
  data: string
  luogo: string
  cliente: {
    nome: string
    indirizzo: string
    email: string
    telefono: string
    partita_iva: string
  }
  prodotti: Prodotto[]
  sconto?: number
  totale_imponibile: number
  totale: number
  totale_scontato: number
  iva_percentuale: number
  note?: string
}
