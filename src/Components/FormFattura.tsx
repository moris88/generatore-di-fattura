import { Plus, Trash } from 'iconoir-react'
import moment from 'moment'
import { useState } from 'react'

import type { FatturaData, Prodotto } from '@/types'

interface FormFatturaProps {
  onChange: (data: FatturaData) => void
}

function FormFattura({ onChange }: Readonly<FormFatturaProps>) {
  const [fattura, setFattura] = useState<FatturaData>({
    numero: '',
    data: new Date().toLocaleDateString(),
    luogo: '',
    cliente: {
      nome: '',
      indirizzo: '',
      email: '',
      telefono: '',
      partita_iva: '',
    },
    sconto: undefined,
    prodotti: [{ descrizione: 'prodotto 1', quantita: 0, prezzo_unitario: 0 }],
    totale_imponibile: 0,
    totale: 0,
    totale_scontato: 0,
    iva_percentuale: 22,
    note: '',
  })

  const handleChange = (field: string, value: any) => {
    let updated = { ...fattura, [field]: value }
    if (field === 'sconto') {
      const imponibileScontato = Math.max(
        fattura.totale_imponibile - (value ?? 0),
        0
      )
      const totale = imponibileScontato * (1 + fattura.iva_percentuale / 100)
      updated = {
        ...updated,
        totale_scontato: imponibileScontato,
        totale,
      }
    }
    setFattura(updated)
    onChange(updated)
  }

  const handleProdottoChange = (
    index: number,
    field: keyof Prodotto,
    value: any
  ) => {
    const updatedProducts = [...fattura.prodotti] as Prodotto[]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: field === 'descrizione' ? value : parseFloat(value),
    }

    const totaleImponibile = updatedProducts.reduce(
      (sum, p) => sum + p.quantita * p.prezzo_unitario,
      0
    )

    // Calcolo con sconto PRIMA dell’IVA
    const imponibileScontato = Math.max(
      totaleImponibile - (fattura.sconto ?? 0),
      0
    )
    const totale = imponibileScontato * (1 + fattura.iva_percentuale / 100)

    const updated = {
      ...fattura,
      prodotti: updatedProducts,
      totale_imponibile: totaleImponibile,
      totale,
      totale_scontato: imponibileScontato,
    }

    setFattura(updated)
    onChange(updated)
  }

  const addProdotto = () => {
    const updatedProducts = [
      ...fattura.prodotti,
      { descrizione: '', quantita: 1, prezzo_unitario: 0 },
    ]
    setFattura({ ...fattura, prodotti: updatedProducts })
    onChange({ ...fattura, prodotti: updatedProducts })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Inserisci dati fattura</h2>

      {/* Numero e Data */}
      <div className="flex flex-col gap-2 lg:flex-row">
        <div className="flex flex-col">
          <label htmlFor="numero">Numero</label>
          <input
            id="numero"
            placeholder="Numero"
            type="text"
            value={fattura.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="data">Data</label>
          <input
            id="data"
            placeholder="Data"
            type="date"
            value={
              fattura.data
                ? moment(fattura.data, 'DD/MM/YYYY').format('YYYY-MM-DD')
                : ''
            }
            onChange={(e) =>
              handleChange(
                'data',
                moment(e.target.value, 'YYYY-MM-DD').format('DD/MM/YYYY')
              )
            }
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="luogo">Luogo</label>
          <input
            id="luogo"
            placeholder="Luogo"
            type="text"
            value={fattura.luogo}
            onChange={(e) => handleChange('luogo', e.target.value)}
          />
        </div>
      </div>

      {/* Cliente */}
      <h3 className="mb-2 font-semibold">Cliente</h3>
      <div className="flex flex-col flex-wrap gap-2 lg:flex-row">
        <div className="flex flex-col">
          <label htmlFor="cliente-nome">Ragione sociale</label>
          <input
            id="cliente-nome"
            placeholder="Ragione sociale"
            type="text"
            value={fattura.cliente.nome}
            onChange={(e) =>
              handleChange('cliente', {
                ...fattura.cliente,
                nome: e.target.value,
              })
            }
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="cliente-indirizzo">Indirizzo</label>
          <input
            id="cliente-indirizzo"
            placeholder="Indirizzo"
            type="text"
            value={fattura.cliente.indirizzo}
            onChange={(e) =>
              handleChange('cliente', {
                ...fattura.cliente,
                indirizzo: e.target.value,
              })
            }
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="cliente-email">Email</label>
          <input
            id="cliente-email"
            placeholder="Email"
            type="email"
            value={fattura.cliente.email}
            onChange={(e) =>
              handleChange('cliente', {
                ...fattura.cliente,
                email: e.target.value,
              })
            }
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="cliente-telefono">Telefono</label>
          <input
            id="cliente-telefono"
            placeholder="Telefono"
            type="tel"
            value={fattura.cliente.telefono}
            onChange={(e) =>
              handleChange('cliente', {
                ...fattura.cliente,
                telefono: e.target.value,
              })
            }
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="cliente-piva">P.IVA</label>
          <input
            id="cliente-piva"
            placeholder="P.IVA"
            type="text"
            value={fattura.cliente.partita_iva}
            onChange={(e) =>
              handleChange('cliente', {
                ...fattura.cliente,
                partita_iva: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Prodotti */}
      <h3 className="mb-2 font-semibold">Prodotti/Servizi</h3>
      <div className="flex flex-col">
        {fattura.prodotti.length === 0 && (
          <p className="mb-2 text-sm text-gray-500">Nessun prodotto aggiunto</p>
        )}
        {fattura.prodotti.map((p, idx) => (
          <div key={idx} className="mb-2 flex flex-col gap-2 lg:flex-row">
            <div className="flex flex-col">
              <label htmlFor={`descrizione-${idx}`}>Descrizione</label>
              <input
                id={`descrizione-${idx}`}
                placeholder="Descrizione"
                type="text"
                value={p.descrizione}
                onChange={(e) =>
                  handleProdottoChange(idx, 'descrizione', e.target.value)
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor={`quantita-${idx}`}>Quantità</label>
              <input
                id={`quantita-${idx}`}
                min={0}
                placeholder="Quantità"
                step={1}
                type="number"
                value={p.quantita}
                onChange={(e) =>
                  handleProdottoChange(idx, 'quantita', e.target.value)
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor={`prezzo-${idx}`}>Prezzo Unitario</label>
              <input
                id={`prezzo-${idx}`}
                min={0}
                placeholder="Prezzo Unitario"
                step={0.01}
                type="number"
                value={p.prezzo_unitario}
                onChange={(e) =>
                  handleProdottoChange(idx, 'prezzo_unitario', e.target.value)
                }
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor={`quantita-${idx}`}>Tot.</label>
              <input
                disabled
                id={`quantita-${idx}`}
                type="number"
                value={p.quantita * p.prezzo_unitario}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  const updatedProducts = fattura.prodotti.filter(
                    (_, i) => i !== idx
                  )
                  const totaleImponibile = updatedProducts.reduce(
                    (sum, p) => sum + p.quantita * p.prezzo_unitario,
                    0
                  )
                  const imponibileScontato = Math.max(
                    totaleImponibile - (fattura.sconto ?? 0),
                    0
                  )
                  const totale =
                    imponibileScontato * (fattura.iva_percentuale / 100)
                  const updated = {
                    ...fattura,
                    prodotti: updatedProducts,
                    totale_imponibile: totaleImponibile,
                    totale_scontato: imponibileScontato,
                    totale: totale,
                  }
                  setFattura(updated)
                  onChange(updated)
                }}
              >
                <Trash />
                Rimuovi
              </button>
            </div>
          </div>
        ))}
        <div className="py-4">
          <div className="flex flex-col">
            <label htmlFor="sconto">Sconto</label>
            <input
              id="sconto"
              min={0}
              placeholder="Sconto"
              step={1}
              type="number"
              value={fattura.sconto}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : e.target.value
                handleChange('sconto', value && parseFloat(value))
              }}
            />
          </div>
          <p>SubTotale: €{fattura.totale_imponibile.toFixed(2)}</p>
          <p>SubTotale Scontato €{fattura.totale_scontato.toFixed(2)}</p>
          <p>
            IVA: €{fattura.totale_scontato * 0.22} ({fattura.iva_percentuale}%)
          </p>
          <p>
            <b>Totale: €{fattura.totale.toFixed(2)}</b>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={addProdotto}
          >
            <Plus />
            Aggiungi
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="flex w-full items-center gap-2">
        <div className="flex w-full flex-col">
          <label className="font-semibold" htmlFor="note">
            Note
          </label>
          <textarea
            className="w-full rounded border p-2"
            id="note"
            value={fattura.note}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default FormFattura
