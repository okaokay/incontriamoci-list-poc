# Prova tecnica — Componente List

Prototipo funzionante del componente "List" (elenco compatto di risultati),
riferimento Figma: node `344:4594` ("Detailed List") per la versione
desktop, node `409:3773` ("ProfileCard") per la versione mobile/tablet. Vedi
`Incontriamoci_Documentazione_Funzionalita.docx` per il contesto generale del
progetto.

**Componente separato** dagli altri (repo/cartella dedicata): come da
indicazione del cliente, ogni componente ha la propria cartella e il proprio
push, così il senior può montarli sullo staging uno alla volta senza
dipendenze incrociate nel repository.

Stessa metodologia già usata per la card TopList (vedi POC
`incontriamoci-toplist-card-poc`): **HTML statico**, non generato da JS — il
plugin jQuery si limita ad agganciare l'unica interattività prevista (il
cuoricino preferiti) a un markup già pronto in pagina.

Stack: **Bootstrap 3.4.1** (solo CSS, per il grid) + **jQuery 3.7.1**. 100%
offline, nessun CDN.

## Come aprirlo

Pacchetto autonomo, nessuna installazione: apri `index.html` nel browser (o
con "Live Server" in VS Code). Non serve un server Node/PHP.

## Struttura del pacchetto

```
incontriamoci-list-poc/
├── index.html                 → pagina di prova con la sezione lista
├── css/
│   ├── bootstrap.min.css      → Bootstrap 3.4.1 originale, non modificato (solo grid)
│   └── style.css              → componente List, commentato riga per riga
├── js/
│   ├── jquery.min.js
│   └── list.js                → plugin jQuery leggero: solo il toggle preferiti
├── img/mock/                  → foto finte locali (photo-1/2/3.svg) usate nei
│                                  risultati di prova, 100% offline
└── README.md                  → questo file
```

## Cosa fa il componente

- **Sezione List**: titolo "LIST SECTION" + elenco verticale di risultati.
- **Ogni risultato**: nome, età, contatore video/foto, foto di anteprima
  (singola, non un carosello), titolo e descrizione troncati, cuoricino
  preferiti.
- **Due template per ogni risultato**, come nella card TopList: uno
  desktop (riga orizzontale compatta) e uno mobile/tablet (card verticale
  con badge a pillola), mostrati/nascosti via CSS in base alla larghezza —
  nessun ricalcolo lato JS al resize.

## HTML statico + plugin jQuery leggero (contratto per Blade)

Come la card TopList, `list.js` **non genera l'HTML** dei risultati: il
markup è scritto direttamente in `index.html` (a mano in questo POC,
stampato da Blade in produzione), documentato per esteso nel commento in
cima al file ("QUESTO È IL CONTRATTO HTML PER BLADE"). Il plugin si limita
ad agganciare il toggle del cuoricino preferiti.

**Riepilogo del contratto** — per ogni risultato, un
`.list-item-container[data-listing-id]` che contiene due template
affiancati nel DOM (solo uno visibile alla volta via CSS):

- `.list-item` (desktop) e `.list-item-mobile` (mobile/tablet).
- Una singola `<img>` di anteprima (non un array `data-images` come nella
  card TopList: qui basta una foto sola) — se l'annuncio non ne ha ancora
  una, Blade non stampa il tag `<img>` e resta visibile solo il
  placeholder sotto di esso (`.list-item__photo-placeholder` /
  `.list-item-mobile__photo-placeholder`, sempre presente nel markup).
- Titolo e descrizione troncati **via CSS** (`text-overflow:ellipsis` sul
  titolo desktop a 1 riga, `-webkit-line-clamp` sulla descrizione a 3
  righe desktop / 4 righe mobile, titolo mobile fino a 3 righe) — Blade
  stampa il testo intero, è il CSS a tagliarlo alla lunghezza giusta per
  ogni breakpoint, non serve troncarlo lato server.

## Perché niente carosello né modali di dettaglio

A differenza della card TopList, questo componente è pensato per un
**elenco compatto di risultati** (una lista di ricerca), non per il
dettaglio completo di un annuncio: una sola foto di anteprima (non una
galleria), click su titolo/descrizione porta all'intera pagina profilo
(non apre nessuna modale di statistiche). Per questo `list.js` non ha
bisogno di `stat-detail-modal.js` né di nessuna logica di lazy-load
carosello.

## Cuoricino preferiti — stesso pattern della card TopList

Click = toggle di una classe CSS (`is-active`), stato solo visivo/locale al
browser in questo POC (non persiste al reload, non chiama nessun endpoint —
la vera persistenza è lato Laravel, fuori scope). Come nella card TopList,
ogni risultato esiste in due copie nel DOM (desktop + mobile): il click
aggiorna **tutti** i cuoricini con lo stesso `data-listing-id`, non solo
quello cliccato, così lo stato resta sincronizzato ridimensionando la
finestra.

Le icone dei due template sono diverse per costruzione (il node Figma
desktop esporta un cuore "a riempimento", quello mobile un cuore
"a contorno"): il toggle quindi non scambia due icone come nella card
TopList (che aveva due SVG — contorno/pieno — già pronti nel markup), ma
cambia semplicemente colore/riempimento via CSS sull'unica icona
disponibile per ciascun template.

## Card mobile mostrata anche su tablet — stessa soglia della card TopList

Su richiesta esplicita del cliente (stessa regola già applicata alla card
TopList), la versione tablet deve essere identica alla mobile: sotto i
**992px** (soglia standard del breakpoint "tablet" di Bootstrap 3, dove
inizia `.col-md-*`) si mostra `.list-item-mobile`, sopra quella soglia
`.list-item`.

## Note per l'integrazione futura in Laravel

- Il markup di `index.html` dentro `.list-items` può diventare un Blade
  component (`<x-list-item :annuncio="$annuncio" />`), passando l'annuncio
  reale al posto dei dati scritti a mano in questo POC.
- Nessuna dipendenza oltre jQuery: `list.js` può essere incluso così com'è
  in `public/js/`.
- Le foto sono già gestite come singolo `<img src="...">`: basta che Blade
  stampi lì l'URL reale della foto scelta come anteprima dell'annuncio,
  nessuna modifica richiesta al plugin.
