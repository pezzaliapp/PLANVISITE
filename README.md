# PLANVISITE
Pianificazione visite con esportazioni dati per my maps
# PWA Client Visits

**PWA Client Visits** è un'applicazione web progressiva (PWA) progettata per aiutare agenti, tecnici e professionisti a gestire, pianificare e ottimizzare le visite ai clienti in modo semplice ed efficiente.

## Caratteristiche principali

- **Gestione Clienti:** Carica clienti da file CSV o aggiungili manualmente.
- **Ricerca Clienti:** Filtra rapidamente i clienti per nome o città.
- **Pianificazione Visite:** Seleziona i clienti e assegna loro una data di visita.
- **Salvataggio Locale:** I dati vengono salvati nel browser tramite localStorage.
- **Esportazione CSV:** Esporta le visite pianificate in formato CSV.
- **PWA Ready:** Funziona su Windows, macOS, Android e iOS senza necessità di installazione.
- **Service Worker:** Supporto offline per un accesso continuo ai dati.

## Tecnologie Utilizzate

- **HTML, CSS, JavaScript** per la struttura e la logica dell'app.
- **LocalStorage** per il salvataggio persistente dei dati.
- **Service Worker** per il supporto offline.
- **PWA Manifest** per l'installazione su dispositivi mobili e desktop.

## Installazione e Utilizzo

1. **Apri l'app:** Visita [www.pezzaliAPP.com](https://www.pezzaliAPP.com) dal tuo browser preferito.
2. **Aggiungi Clienti:** Carica un file CSV o inserisci manualmente i dati.
3. **Pianifica Visite:** Seleziona i clienti e assegna loro una data.
4. **Esporta i dati:** Scarica l'elenco delle visite pianificate in CSV.
5. **Installa come PWA:** Su mobile o desktop, puoi aggiungere l'app alla schermata principale per un accesso rapido.

## Formato del file CSV

Se desideri caricare un elenco di clienti, utilizza un file CSV con il seguente formato:

```
Nome;Indirizzo;Città
Mario Rossi;Via Roma 10;Milano
Anna Bianchi;Corso Italia 5;Torino
Luca Verdi;Piazza Garibaldi 3;Napoli
```

## Service Worker e Supporto Offline

Questa applicazione utilizza un **Service Worker** per garantire l'accesso ai dati anche senza connessione internet. La registrazione avviene automaticamente quando l'app viene caricata.

## Esportazione delle Visite

Le visite pianificate possono essere esportate in formato CSV per l'archiviazione o la condivisione. Il file generato seguirà questo schema:

```
Data,Cliente,Indirizzo,Città
2025-02-10,"Mario Rossi","Via Roma 10","Milano"
2025-02-15,"Anna Bianchi","Corso Italia 5","Torino"
```

## Contributi e Segnalazioni

Se hai suggerimenti o vuoi contribuire allo sviluppo dell'app, visita il repository GitHub ufficiale o contattami tramite [www.pezzaliAPP.com](https://www.pezzaliAPP.com).

---
**© 2025 PWA Client Visits - Tutti i diritti riservati.**

