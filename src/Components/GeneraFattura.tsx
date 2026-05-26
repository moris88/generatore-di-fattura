import type { FatturaData } from '@/types'

interface FatturaProps {
  fatturaData: FatturaData
  signature?: string
  technicalSignature?: string
}

function GeneraFattura({
  fatturaData,
  signature,
  technicalSignature,
}: Readonly<FatturaProps>) {
  if (!fatturaData) return null

  const formatValue = (value: string | undefined | null) => {
    return value && value.trim() !== '' ? value : 'N/A'
  }

  return (
    <div
      id="fatturaDiv"
      style={{
        fontFamily: "'Arial', sans-serif",
        fontSize: 12,
        color: '#333',
        padding: '30px',
        lineHeight: 1.4,
        maxWidth: 800,
        margin: '0 auto',
        backgroundColor: '#fff',
      }}
    >
      {/* Intestazione */}
      <header style={{ textAlign: 'left', marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'black', margin: '0 0 15px 0', color: '#1d4ed8' }}>FATTURA</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 11, lineHeight: 1.5 }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5 }}>{formatValue(fatturaData.emittente.nome)}</div>
            <div>{formatValue(fatturaData.emittente.indirizzo)}</div>
            <div>P.IVA: {formatValue(fatturaData.emittente.partita_iva)}</div>
            <div>Email: {formatValue(fatturaData.emittente.email)}</div>
            {fatturaData.emittente.pec && <div>PEC: {fatturaData.emittente.pec}</div>}
            {fatturaData.emittente.telefono && <div>Tel: {fatturaData.emittente.telefono}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>n. {formatValue(fatturaData.numero)}</h3>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>del {formatValue(fatturaData.data)}</p>
          </div>
        </div>
      </header>

      {/* Informazioni Fornitore / Cliente */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 30,
        }}
      >
        <div style={{ textAlign: 'right', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6', minWidth: '200px' }}>
          <h3 style={{ fontSize: 10, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 5, letterSpacing: '0.05em' }}>Destinatario</h3>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>{formatValue(fatturaData.cliente.nome)}</div>
          <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>
            {formatValue(fatturaData.cliente.indirizzo)}<br />
            P.IVA: {formatValue(fatturaData.cliente.partita_iva)}<br />
            {formatValue(fatturaData.cliente.email)}
          </div>
        </div>
      </section>

      {/* Tabella Prodotti */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          marginBottom: 20,
          fontSize: 12,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#eff6ff' }}>
            <th
              style={{
                padding: '8px 6px',
                textAlign: 'left',
                width: '45%',
              }}
            >
              Descrizione
            </th>
            <th
              style={{
                padding: 10,
                textAlign: 'right',
                width: '10%',
              }}
            >
              Qtà
            </th>
            <th
              style={{
                padding: 10,
                textAlign: 'right',
                width: '15%',
              }}
            >
              Prezzo
            </th>
            <th
              style={{
                padding: 10,
                textAlign: 'right',
                width: '15%',
              }}
            >
              Sconto
            </th>
            <th
              style={{
                padding: 10,
                textAlign: 'right',
                width: '15%',
              }}
            >
              Totale
            </th>
          </tr>
        </thead>
        <tbody>
          {fatturaData.prodotti.map((p: any, idx: number) => (
            <tr key={idx}>
              <td style={{ padding: 8, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{p.descrizione}</td>
              <td
                style={{
                  padding: 8,
                  textAlign: 'right',
                  verticalAlign: 'top',
                }}
              >
                {p.quantita}
              </td>
              <td
                style={{
                  padding: 8,
                  textAlign: 'right',
                  verticalAlign: 'top',
                }}
              >
                €{p.prezzo_unitario.toFixed(2)}
              </td>
              <td
                style={{
                  padding: 8,
                  textAlign: 'right',
                  verticalAlign: 'top',
                }}
              >
                €{(p.sconto || 0).toFixed(2)}
              </td>
              <td
                style={{
                  padding: 8,
                  textAlign: 'right',
                  verticalAlign: 'top',
                }}
              >
                €{(p.quantita * p.prezzo_unitario - (p.sconto || 0)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totali */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 30 }}>
        <div style={{ width: '280px', borderTop: '2px solid #1d4ed8', paddingTop: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: '#6b7280' }}>SubTotale Imponibile:</span>
            <span style={{ fontWeight: 'semibold' }}>€{fatturaData.totale_imponibile.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: '#6b7280' }}>Sconto Generale:</span>
            <span style={{ fontWeight: 'semibold', color: '#dc2626' }}>-€{(fatturaData.sconto || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: '#6b7280' }}>IVA ({fatturaData.iva_percentuale}%):</span>
            <span style={{ fontWeight: 'semibold' }}>€{(fatturaData.totale_scontato * (fatturaData.iva_percentuale / 100)).toFixed(2)}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 12, 
            paddingTop: 12, 
            borderTop: '1px solid #e5e7eb',
            fontSize: 20,
            fontWeight: 'black'
          }}>
            <span style={{ color: '#111827' }}>TOTALE:</span>
            <span style={{ color: '#1d4ed8' }}>€{fatturaData.totale.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Note */}
      {fatturaData.note && (
        <section style={{ marginBottom: 50 }}>
          <h4 style={{ marginBottom: 5 }}>Note</h4>
          <p style={{ margin: 0 }}>{fatturaData.note}</p>
        </section>
      )}

      {/* Firma */}
      <section style={{ textAlign: 'left' }}>
        <p style={{ margin: '0 0 5px 0' }}>
          {fatturaData.luogo}, {fatturaData.data}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', // sempre 2 colonne uguali
            gap: 16,
            marginTop: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                fontWeight: 'bold',
                textWrap: 'nowrap',
              }}
            >
              Firma Cliente:
            </p>
            {signature ? (
              <img
                alt="Firma Cliente"
                src={signature}
                style={{
                  minWidth: 200,
                  height: 80,
                  borderBottom: '1px solid #333',
                }}
              />
            ) : (
              <div
                style={{
                  minWidth: 200,
                  height: 80,
                  borderBottom: '1px solid #333',
                }}
              />
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'end',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                fontWeight: 'bold',
                textWrap: 'nowrap',
              }}
            >
              Firma Responsabile:
            </p>
            {technicalSignature ? (
              <img
                alt="Firma Tecnico"
                src={technicalSignature}
                style={{
                  minWidth: 200,
                  height: 80,
                  borderBottom: '1px solid #333',
                }}
              />
            ) : (
              <div
                style={{
                  minWidth: 200,
                  height: 80,
                  borderBottom: '1px solid #333',
                }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default GeneraFattura
