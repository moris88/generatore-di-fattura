import { Plus, Trash } from 'iconoir-react'
import moment from 'moment'
import { useState } from 'react'

import type { FatturaData, Prodotto } from '@/types'

import { generateUniqueID } from '../utils'

interface FormFatturaProps {
  onChange: (data: FatturaData) => void
  initialData?: FatturaData
  onValidationChange?: (isValid: boolean) => void
}

function FormFattura({
  onChange,
  initialData,
  onValidationChange,
}: Readonly<FormFatturaProps>) {
  const [fattura, setFattura] = useState<FatturaData>(
    initialData ?? {
      numero: generateUniqueID(),
      data: new Date().toLocaleDateString(),
      luogo: '',
      emittente: {
        nome: '',
        indirizzo: '',
        email: '',
        telefono: '',
        partita_iva: '',
        pec: '',
      },
      cliente: {
        nome: '',
        indirizzo: '',
        email: '',
        telefono: '',
        partita_iva: '',
      },
      sconto: undefined,
      prodotti: [
        { descrizione: '', quantita: 0, prezzo_unitario: 0, sconto: 0 },
      ],
      totale_imponibile: 0,
      totale: 0,
      totale_scontato: 0,
      iva_percentuale: 22,
      note: '',
    }
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: FatturaData) => {
    const newErrors: Record<string, string> = {}

    // Validazione Emittente
    if (!data.emittente.nome.trim())
      newErrors['emittente.nome'] = 'Ragione sociale obbligatoria'
    if (!data.emittente.partita_iva.trim())
      newErrors['emittente.partita_iva'] = 'P.IVA obbligatoria'
    if (!data.emittente.email.trim())
      newErrors['emittente.email'] = 'Email obbligatoria'

    // Validazione Cliente
    if (!data.cliente.nome.trim())
      newErrors['cliente.nome'] = 'Ragione sociale obbligatoria'
    if (!data.cliente.partita_iva.trim())
      newErrors['cliente.partita_iva'] = 'P.IVA obbligatoria'
    if (!data.cliente.email.trim())
      newErrors['cliente.email'] = 'Email obbligatoria'

    // Validazione Prodotti
    if (data.prodotti.length === 0) {
      newErrors['prodotti'] = 'Aggiungi almeno un prodotto'
    } else {
      data.prodotti.forEach((p, idx) => {
        if (!p.descrizione.trim())
          newErrors[`prodotti.${idx}.descrizione`] = 'Descrizione obbligatoria'
        if (p.quantita <= 0) newErrors[`prodotti.${idx}.quantita`] = 'Minimo 1'
        if (p.prezzo_unitario <= 0)
          newErrors[`prodotti.${idx}.prezzo`] = 'Maggiore di 0'
      })
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange?.(isValid)
    return isValid
  }

  const calculateTotals = (updatedFattura: FatturaData) => {
    const totaleImponibile = updatedFattura.prodotti.reduce(
      (sum, p) => sum + (p.quantita * p.prezzo_unitario - (p.sconto ?? 0)),
      0
    )

    const imponibileScontato = Math.max(
      totaleImponibile - (updatedFattura.sconto ?? 0),
      0
    )
    const totale =
      imponibileScontato * (1 + (updatedFattura.iva_percentuale || 0) / 100)

    const result = {
      ...updatedFattura,
      totale_imponibile: totaleImponibile,
      totale_scontato: imponibileScontato,
      totale: totale,
    }
    validate(result)
    return result
  }

  const handleChange = (field: string, value: any) => {
    const updated = calculateTotals({ ...fattura, [field]: value })
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
      [field]: field === 'descrizione' ? value : parseFloat(value || 0),
    }

    const updated = calculateTotals({ ...fattura, prodotti: updatedProducts })
    setFattura(updated)
    onChange(updated)
  }

  const addProdotto = () => {
    const updatedProducts = [
      ...fattura.prodotti,
      { descrizione: '', quantita: 1, prezzo_unitario: 0, sconto: 0 },
    ]
    const updated = calculateTotals({ ...fattura, prodotti: updatedProducts })
    setFattura(updated)
    onChange(updated)
  }

  const getErrorClass = (key: string) =>
    errors[key] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Inserisci dati fattura</h2>

      {/* Numero e Data */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-sm font-medium" htmlFor="numero">
            Numero Fattura (Automatico)
          </label>
          <input
            readOnly
            className="cursor-not-allowed rounded border border-gray-300 bg-gray-50 p-2 font-mono font-bold text-gray-500"
            id="numero"
            type="text"
            value={fattura.numero}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium" htmlFor="data">
            Data
          </label>
          <input
            className="rounded border border-gray-300 p-2"
            id="data"
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
          <label className="text-sm font-medium" htmlFor="luogo">
            Luogo
          </label>
          <input
            className="rounded border border-gray-300 p-2"
            id="luogo"
            placeholder="Luogo di emissione"
            type="text"
            value={fattura.luogo}
            onChange={(e) => handleChange('luogo', e.target.value)}
          />
        </div>
      </div>

      {/* Emittente (Intestatario) */}
      <div className="rounded-lg border border-gray-300 shadow-sm bg-gray-50 p-4">
        <h3 className="mb-4 font-semibold text-blue-700">
          Emittente (Intestatario) *
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="emittente-nome">
              Ragione sociale *
            </label>
            <input
              className={`rounded border p-2 ${getErrorClass('emittente.nome')}`}
              id="emittente-nome"
              placeholder="Nome azienda o professionista"
              type="text"
              value={fattura.emittente.nome}
              onChange={(e) =>
                handleChange('emittente', {
                  ...fattura.emittente,
                  nome: e.target.value,
                })
              }
            />
            {errors['emittente.nome'] && (
              <span className="mt-1 text-xs text-red-600">
                {errors['emittente.nome']}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              className="text-sm font-medium"
              htmlFor="emittente-indirizzo"
            >
              Indirizzo
            </label>
            <input
              className="rounded border border-gray-300 p-2"
              id="emittente-indirizzo"
              placeholder="Via, civico, città"
              type="text"
              value={fattura.emittente.indirizzo}
              onChange={(e) =>
                handleChange('emittente', {
                  ...fattura.emittente,
                  indirizzo: e.target.value,
                })
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="emittente-piva">
              P.IVA *
            </label>
            <input
              className={`rounded border p-2 ${getErrorClass('emittente.partita_iva')}`}
              id="emittente-piva"
              placeholder="Partita IVA"
              type="text"
              value={fattura.emittente.partita_iva}
              onChange={(e) =>
                handleChange('emittente', {
                  ...fattura.emittente,
                  partita_iva: e.target.value,
                })
              }
            />
            {errors['emittente.partita_iva'] && (
              <span className="mt-1 text-xs text-red-600">
                {errors['emittente.partita_iva']}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="emittente-email">
              Email *
            </label>
            <input
              className={`rounded border p-2 ${getErrorClass('emittente.email')}`}
              id="emittente-email"
              placeholder="Email aziendale"
              type="email"
              value={fattura.emittente.email}
              onChange={(e) =>
                handleChange('emittente', {
                  ...fattura.emittente,
                  email: e.target.value,
                })
              }
            />
            {errors['emittente.email'] && (
              <span className="mt-1 text-xs text-red-600">
                {errors['emittente.email']}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="emittente-pec">
              PEC
            </label>
            <input
              className="rounded border border-gray-300 p-2"
              id="emittente-pec"
              placeholder="Indirizzo PEC"
              type="text"
              value={fattura.emittente.pec}
              onChange={(e) =>
                handleChange('emittente', {
                  ...fattura.emittente,
                  pec: e.target.value,
                })
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="emittente-telefono">
              Telefono
            </label>
            <input
              className="rounded border border-gray-300 p-2"
              id="emittente-telefono"
              placeholder="Contatto telefonico"
              type="tel"
              value={fattura.emittente.telefono}
              onChange={(e) =>
                handleChange('emittente', {
                  ...fattura.emittente,
                  telefono: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Cliente */}
      <div className="rounded-lg border border-gray-300 shadow-sm bg-gray-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-700">Cliente *</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="cliente-nome">
              Ragione sociale *
            </label>
            <input
              className={`rounded border p-2 ${getErrorClass('cliente.nome')}`}
              id="cliente-nome"
              placeholder="Ragione sociale cliente"
              type="text"
              value={fattura.cliente.nome}
              onChange={(e) =>
                handleChange('cliente', {
                  ...fattura.cliente,
                  nome: e.target.value,
                })
              }
            />
            {errors['cliente.nome'] && (
              <span className="mt-1 text-xs text-red-600">
                {errors['cliente.nome']}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="cliente-indirizzo">
              Indirizzo
            </label>
            <input
              className="rounded border border-gray-300 p-2"
              id="cliente-indirizzo"
              placeholder="Indirizzo cliente"
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
            <label className="text-sm font-medium" htmlFor="cliente-piva">
              P.IVA *
            </label>
            <input
              className={`rounded border p-2 ${getErrorClass('cliente.partita_iva')}`}
              id="cliente-piva"
              placeholder="P.IVA cliente"
              type="text"
              value={fattura.cliente.partita_iva}
              onChange={(e) =>
                handleChange('cliente', {
                  ...fattura.cliente,
                  partita_iva: e.target.value,
                })
              }
            />
            {errors['cliente.partita_iva'] && (
              <span className="mt-1 text-xs text-red-600">
                {errors['cliente.partita_iva']}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="cliente-email">
              Email/PEC *
            </label>
            <input
              className={`rounded border p-2 ${getErrorClass('cliente.email')}`}
              id="cliente-email"
              placeholder="Email o PEC cliente"
              type="email"
              value={fattura.cliente.email}
              onChange={(e) =>
                handleChange('cliente', {
                  ...fattura.cliente,
                  email: e.target.value,
                })
              }
            />
            {errors['cliente.email'] && (
              <span className="mt-1 text-xs text-red-600">
                {errors['cliente.email']}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium" htmlFor="cliente-telefono">
              Telefono
            </label>
            <input
              className="rounded border border-gray-300 p-2"
              id="cliente-telefono"
              placeholder="Telefono cliente"
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
        </div>
      </div>

      {/* Prodotti */}
      <div>
        <h3 className="mb-4 font-semibold">Prodotti/Servizi *</h3>
        <div className="space-y-4">
          {fattura.prodotti.length === 0 && (
            <p className="font-medium text-sm text-red-500">
              Aggiungi almeno un prodotto per generare la fattura.
            </p>
          )}
          {fattura.prodotti.map((p, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-4 rounded-lg border border-gray-300 p-4 shadow-sm lg:flex-row lg:items-end ${errors[`prodotti.${idx}.descrizione`] || errors[`prodotti.${idx}.quantita`] || errors[`prodotti.${idx}.prezzo`] ? 'border-red-200 bg-red-50' : 'bg-white'}`}
            >
              <div className="flex-3 flex flex-col">
                <label
                  className="text-xs font-medium text-gray-500"
                  htmlFor={`descrizione-${idx}`}
                >
                  Descrizione *
                </label>
                <textarea
                  className={`rounded border p-2 min-h-10 resize-y ${getErrorClass(`prodotti.${idx}.descrizione`)}`}
                  id={`descrizione-${idx}`}
                  placeholder="Cosa stai fatturando?"
                  rows={1}
                  value={p.descrizione}
                  onChange={(e) =>
                    handleProdottoChange(idx, 'descrizione', e.target.value)
                  }
                />
                {errors[`prodotti.${idx}.descrizione`] && (
                  <span className="mt-0.5 text-[10px] text-red-600">
                    {errors[`prodotti.${idx}.descrizione`]}
                  </span>
                )}
              </div>
              <div className="grid flex-2 grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
                <div className="flex flex-col">
                  <label
                    className="text-xs font-medium text-gray-500"
                    htmlFor={`quantita-${idx}`}
                  >
                    Qtà *
                  </label>
                  <input
                    className={`rounded border ${getErrorClass(`prodotti.${idx}.quantita`)}`}
                    id={`quantita-${idx}`}
                    min={0}
                    placeholder="0"
                    step={1}
                    type="number"
                    value={p.quantita}
                    onChange={(e) =>
                      handleProdottoChange(idx, 'quantita', e.target.value)
                    }
                  />
                  {errors[`prodotti.${idx}.quantita`] && (
                    <span className="mt-0.5 text-[10px] text-red-600">
                      {errors[`prodotti.${idx}.quantita`]}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label
                    className="text-xs font-medium text-gray-500"
                    htmlFor={`prezzo-${idx}`}
                  >
                    Prezzo *
                  </label>
                  <input
                    className={`rounded border ${getErrorClass(`prodotti.${idx}.prezzo`)}`}
                    id={`prezzo-${idx}`}
                    min={0}
                    placeholder="0.0"
                    step={0.1}
                    type="number"
                    value={p.prezzo_unitario}
                    onChange={(e) =>
                      handleProdottoChange(
                        idx,
                        'prezzo_unitario',
                        e.target.value
                      )
                    }
                  />
                  {errors[`prodotti.${idx}.prezzo`] && (
                    <span className="mt-0.5 text-[10px] text-red-600">
                      {errors[`prodotti.${idx}.prezzo`]}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label
                    className="text-xs font-medium text-gray-500"
                    htmlFor={`sconto-prodotto-${idx}`}
                  >
                    Sconto
                  </label>
                  <input
                    className="rounded border border-gray-300"
                    id={`sconto-prodotto-${idx}`}
                    min={0}
                    placeholder="0"
                    step={1}
                    type="number"
                    value={p.sconto}
                    onChange={(e) =>
                      handleProdottoChange(idx, 'sconto', e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-500">
                    Tot.
                  </label>
                  <div className="flex h-10 items-center overflow-hidden whitespace-nowrap rounded border bg-gray-100 px-2 text-sm font-medium">
                    €
                    {(
                      p.quantita * p.prezzo_unitario -
                      (p.sconto ?? 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="flex h-10 items-center gap-1 rounded bg-red-50 px-3 text-red-600 transition-colors hover:bg-red-100"
                  type="button"
                  onClick={() => {
                    const updatedProducts = fattura.prodotti.filter(
                      (_, i) => i !== idx
                    )
                    const updated = calculateTotals({
                      ...fattura,
                      prodotti: updatedProducts,
                    })
                    setFattura(updated)
                    onChange(updated)
                  }}
                >
                  <Trash className="h-4 w-4" />
                  <span className="lg:hidden">Rimuovi</span>
                </button>
              </div>
            </div>
          ))}

          <button
            className="btn btn-secondary flex items-center gap-2"
            type="button"
            onClick={addProdotto}
          >
            <Plus className="h-5 w-5" />
            Aggiungi Prodotto
          </button>
        </div>
      </div>

      {/* Riepilogo Totali e IVA */}
      <div className="rounded-lg bg-gray-100 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="font-semibold" htmlFor="sconto">
              Sconto Generale (€)
            </label>
            <input
              className="rounded border border-gray-300 bg-white p-2"
              id="sconto"
              min={0}
              placeholder="0.00"
              step={1}
              type="number"
              value={fattura.sconto}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : e.target.value
                handleChange('sconto', value && parseFloat(value))
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold" htmlFor="iva">
              IVA (%)
            </label>
            <input
              className="rounded border border-gray-300 bg-white p-2"
              id="iva"
              min={0}
              placeholder="22"
              step={1}
              type="number"
              value={fattura.iva_percentuale}
              onChange={(e) =>
                handleChange('iva_percentuale', parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2 text-right md:col-span-2 lg:col-span-1">
            <div className="flex justify-between md:justify-end md:gap-8">
              <span className="text-gray-600">SubTotale Imponibile:</span>
              <span className="font-medium">
                €{fattura.totale_imponibile.toFixed(2)}
              </span>
            </div>
            {fattura.sconto && (
              <div className="flex justify-between md:justify-end md:gap-8">
                <span className="text-gray-600">Sconto Generale:</span>
                <span className="font-medium text-red-600">
                  -€{fattura.sconto.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between md:justify-end md:gap-8">
              <span className="text-gray-600">
                IVA ({fattura.iva_percentuale}%):
              </span>
              <span className="font-medium">
                €
                {(
                  fattura.totale_scontato *
                  (fattura.iva_percentuale / 100)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-xl font-bold md:justify-end md:gap-8">
              <span>Totale:</span>
              <span className="text-blue-700">€{fattura.totale.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="flex w-full flex-col gap-2">
        <label className="font-semibold" htmlFor="note">
          Note (Facoltative)
        </label>
        <textarea
          className="w-full rounded border border-gray-300 p-3"
          id="note"
          placeholder="Aggiungi eventuali note..."
          rows={3}
          value={fattura.note}
          onChange={(e) => handleChange('note', e.target.value)}
        />
      </div>
    </div>
  )
}

export default FormFattura
