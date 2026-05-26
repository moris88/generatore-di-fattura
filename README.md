# Generatore di Fattura

Questo progetto è un'applicazione web per la generazione di fatture in formato PDF.

## Funzionalità

* Creazione di fatture tramite un modulo interattivo.
* Aggiunta di una firma digitale alla fattura.
* Download della fattura in formato PDF.

## Stack Tecnologico

* **Frontend:** React, TypeScript, Tailwind CSS
* **Librerie PDF:** jspdf, pdf-lib, html2canvas
* **Build Tool:** Vite

## Primi Passi

Per eseguire il progetto in locale, segui questi passaggi:

1. **Installare le dipendenze:**

    ```bash
    pnpm install
    ```

2. **Avviare il server di sviluppo:**

    ```bash
    pnpm dev
    ```

    L'applicazione sarà disponibile all'indirizzo `http://localhost:3000`.

## Utilizzo

1. Compila il modulo con i dati della fattura.
2. Aggiungi una firma nel riquadro apposito.
3. Clicca sul pulsante "Genera Fattura" per creare e scaricare il PDF.

## Componenti

* `App`: Il componente principale che gestisce il layout dell'applicazione.
* `FormFattura`: Il modulo per l'inserimento dei dati della fattura.
* `GeneraFattura`: Gestisce la logica per la creazione del PDF.
* `SignPad`: Il componente per la firma digitale.
* `Popup`: Un componente per la visualizzazione di messaggi o anteprime.
