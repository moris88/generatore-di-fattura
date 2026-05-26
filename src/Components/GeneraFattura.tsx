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
      <header style={{ textAlign: 'left', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: 0 }}>FATTURA</h1>
        <h2 style={{ fontSize: 11, fontWeight: 'normal', margin: 0 }}>
          {fatturaData.emittente.nome} | Partita IVA {fatturaData.emittente.partita_iva} | PEC {fatturaData.emittente.pec}
        </h2>
        <h2 style={{ fontSize: 11, fontWeight: 'normal', margin: 0 }}>
          Sede legale: {fatturaData.emittente.indirizzo}, Tel. {fatturaData.emittente.telefono}
        </h2>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 'normal',
            marginTop: 5,
            textAlign: 'right',
          }}
        >
          Numero Fattura: {fatturaData.numero}
        </h3>
      </header>

      {/* Informazioni Fornitore / Cliente */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'end',
          marginBottom: 20,
        }}
      >
        <div style={{ textAlign: 'right', fontStyle: 'italic' }}>
          <h3 style={{ marginBottom: 5 }}>Cliente</h3>
          <p style={{ margin: 0 }}>
            <b>{fatturaData.cliente.nome}</b>
            <br />
            {fatturaData.cliente.indirizzo}
            <br />
            Email: {fatturaData.cliente.email}
            <br />
            Tel: {fatturaData.cliente.telefono}
            <br />
            P.IVA: {fatturaData.cliente.partita_iva}
          </p>
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
      <section style={{ textAlign: 'right', marginBottom: 30 }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          <b>SubTotale:</b> €{fatturaData.totale_imponibile.toFixed(2)}{' '}
          &nbsp;|&nbsp; <b>Sconto Generale:</b> €
          {(fatturaData.sconto || 0).toFixed(2)}
          <br />
          <b>Totale:</b> €{fatturaData.totale.toFixed(2)} &nbsp;|&nbsp;{' '}
          <b>IVA:</b> €{(fatturaData.totale_scontato * (fatturaData.iva_percentuale / 100)).toFixed(2)} (
          {fatturaData.iva_percentuale}%)
        </p>
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
