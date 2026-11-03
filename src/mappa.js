import { LARGHEZZA, ALTEZZA, font as FONT } from "./config.js";

const SFONDO = "0x202936";
const PANNELLO = "0x344252";
const SPAZIO_ICONA = "0x253140";
const TESTO = "0xFFFFFF";
const PERCORSO = "0x8498AA";
const ACCENTO = "0xEAC478";
const LATO = 106;
const LATO_ICONA = 68;

// Inserire il percorso di un'immagine in icona per personalizzare un nodo.
const LIVELLI = [
  { nome: "Livello 1", scena: "livello1", x: 230, y: 205, icona: null },
  { nome: "Livello 2", scena: "livello2", x: 740, y: 335, icona: null },
  { nome: "Livello 3", scena: "livello3", x: 230, y: 465, icona: null },
  { nome: "Livello 4", scena: "livello4", x: 740, y: 595, icona: null },
];
const MERCATO = {
  nome: "Mercato", scena: "mercato", x: 1110, y: 595, icona: null,
};

let messaggio;

function preload(s) {
  for (const nodo of [...LIVELLI, MERCATO]) {
    nodo.immagine = nodo.icona ? PP.assets.image.load(s, nodo.icona) : null;
  }
}

function create(s) {
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, SFONDO, 1);
  testo(s, LARGHEZZA / 2, 52, "MAPPA DEI LIVELLI", 44);
  testo(s, LARGHEZZA / 2, 100, "Scegli la tua prossima tappa", 24);

  // Il percorso collega soltanto i quattro livelli, in ordine.
  for (let i = 0; i < LIVELLI.length - 1; i++) {
    crea_collegamento(s, LIVELLI[i], LIVELLI[i + 1]);
  }
  for (const nodo of LIVELLI) {
    crea_nodo(s, nodo);
  }
  crea_nodo(s, MERCATO);
  messaggio = testo(s, LARGHEZZA / 2, ALTEZZA - 24, "", 22);
}

function crea_collegamento(s, partenza, arrivo) {
  // La curva rallenta in orizzontale alle estremità, formando la serpentina.
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    const curva = (1 - Math.cos(Math.PI * t)) / 2;
    const x = partenza.x + (arrivo.x - partenza.x) * curva;
    const y = partenza.y + (arrivo.y - partenza.y) * t;
    PP.shapes.arc_add(s, x, y, 4, 0, 360, false, PERCORSO, 1);
  }
}

function crea_nodo(s, nodo) {
  const bordo = PP.shapes.rectangle_add(s, nodo.x, nodo.y,
    LATO + 6, LATO + 6, ACCENTO, 1);
  bordo.visibility.alpha = 0.45;
  const bottone = PP.shapes.rectangle_add(s, nodo.x, nodo.y,
    LATO, LATO, PANNELLO, 1);
  PP.shapes.rectangle_add(s, nodo.x, nodo.y,
    LATO_ICONA, LATO_ICONA, SPAZIO_ICONA, 1);

  if (nodo.immagine) {
    const icona = PP.assets.image.add(s, nodo.immagine,
      nodo.x, nodo.y, 0.5, 0.5);
    const scala = Math.min(LATO_ICONA / icona.geometry.display_width,
      LATO_ICONA / icona.geometry.display_height);
    icona.geometry.scale_x = scala;
    icona.geometry.scale_y = scala;
  }
  testo(s, nodo.x, nodo.y + LATO / 2 + 20, nodo.nome, 26);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bordo.visibility.alpha = 1;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bordo.visibility.alpha = 0.45;
  });
  PP.interactive.mouse.add(bottone, "pointerdown", () => {
    if (PP.scenes.list_names.includes(nodo.scena)) {
      PP.scenes.start(nodo.scena);
    } else {
      PP.shapes.text_change(messaggio, nodo.nome + " — in preparazione");
    }
  });
}

function testo(s, x, y, contenuto, dimensione) {
  return PP.shapes.text_styled_add(s, x, y, contenuto,
    dimensione, FONT, "normal", TESTO, null, 0.5, 0.5);
}

function update(s) {}
function destroy(s) {}

PP.scenes.add("mappa", preload, create, update, destroy);
