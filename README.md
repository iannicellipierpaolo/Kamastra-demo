# Kamastra — demo del restyling

Landing statica, senza dipendenze, con quattro sezioni: sala e storia; cucina/menu; vini; Civita con indicazioni, recensioni e prenotazione.

## Aprire e modificare
Apri questa cartella in VS Code e avvia index.html con Live Server. Puoi anche aprire direttamente index.html nel browser. Non servono npm, compilazione o backend.

- index.html: testi, piatti, immagini e collegamenti. Le quattro sezioni sono commentate e identificate da sala, cucina, vini, civita.
- style.css: palette in :root, font locali, layout e regole responsive sotto 1050 e 760 px.
- script.js: navigazione mobile, categorie del menu, comparsa dei contenuti, gestione video.
- assets/: fotografie WebP, logo originale PNG, video MP4, font e relative licenze.

## Stile
Avorio #F4EBDD, vino #742C2A, ocra #CDA34F, bruno #30251F. Fraunces per i titoli e Source Sans 3 per i testi. Immagini autentiche, forme ad arco e animazioni leggere.

## Prestazioni
Nessuna libreria JavaScript o servizio esterno caricato automaticamente. Font locali. Foto secondarie lazy-loaded. Video 1280 px compresso senza audio, caricato soltanto quando visibile, con pausa e rispetto delle preferenze di movimento ridotto. Mappa e recensioni sono link esterni, non widget.

## Cosa è già funzionante
Menu mobile, schede del menu anche da tastiera, ancore di navigazione, pulsante di pausa video, telefono, email, indicazioni Google Maps, recensioni Tripadvisor e menu completo sul sito ufficiale.
La prenotazione apre il telefono: non invia una richiesta né conferma un tavolo. Le recensioni si leggono su Tripadvisor; non sono inventate o replicate nella demo. La selezione del menu è dimostrativa e senza prezzi: verificare i contenuti con il cliente prima del lancio definitivo.

## Pubblicazione sul tuo GitHub
Copia il contenuto di questa cartella nella radice del repository (fai prima una copia della versione precedente). index.html deve stare nella radice insieme a style.css, script.js e assets. Con GitHub Pages configurato su main / root, dopo commit e push la demo sarà pubblicata. Non sono incluse configurazioni private del servizio di anteprima.
La demo include noindex,nofollow e una discreta nota nel footer. Togli questi elementi quando il cliente approverà il sito definitivo. La protezione noindex non limita l'accesso: chi ha l'URL pubblico potrà vederlo.

## Materiali e font
Foto, logo e video forniti per il progetto. Il logo incluso è PNG, non un falso SVG: per un originale vettoriale sostituire il file e i due riferimenti nell'HTML. Conservato il watermark della foto del panorama. Font con licenze OFL incluse nella cartella fonts. Prima dell'uso definitivo confermare col proprietario i diritti dei materiali e i dati del locale.

Fonti dei contenuti: https://www.kamastra.net/ e https://www.kamastra.net/menu/
# Kamastra
