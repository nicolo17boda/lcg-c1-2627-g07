import { LARGHEZZA, ALTEZZA, font as FONT } from "../config.js";

const SPAZIO_INIZIALE = 600;
const LUNGHEZZA = 3600 + SPAZIO_INIZIALE;
const VELOCITA = 340;
const SALTO = 780;
const L_MEG = 40;
const A_MEG = 56;
const SUOLO = 620;
const VITE_MAX = 3;
const DISTANZA_ISTRUZIONI = 400 + SPAZIO_INIZIALE;
const COLORI = {
  sfondo: "0x1D2938", lontano: "0x293A4E", terreno: "0x65768A",
  piattaforma: "0x9AABBA", meg: "0x55DDE0", pericolo: "0xED6672",
  checkpoint: "0xE9BD68", traguardo: "0x85DB9B", testo: "0xFFFFFF",
};

// Tutti gli elementi sono rettangoli: nessun asset grafico da caricare.
const TERRENI = [
  [0, 780 + SPAZIO_INIZIALE],
  [960 + SPAZIO_INIZIALE, 700],
  [1840 + SPAZIO_INIZIALE, 720],
  [2740 + SPAZIO_INIZIALE, 860],
];
const PIATTAFORME = [
  [380, 510, 140], [600, 415, 130], [840, 525, 100],
  [1170, 505, 150], [1400, 410, 150], [1720, 525, 100],
  [2070, 510, 150], [2310, 410, 140], [2620, 525, 100],
  [2950, 510, 150], [3180, 410, 140],
];
const PERICOLI = [[530, 60], [1250, 70], [2170, 80], [3010, 80]];
const CHECKPOINT = [1060, 1940, 2840].map(x => x + SPAZIO_INIZIALE);
const BATTUTE = [
  ["Amico", "Ehi Meg! Hai visto passare una nuvola quadrata?"],
  ["Meg", "No, ma ho trovato tre sassolini che raccontano barzellette."],
  ["Amico", "Allora sei sulla strada giusta! Il ponte oggi profuma di biscotti."],
  ["Meg", "Perfetto. Salto le briciole e vado a cercare il traguardo!"],
  ["Amico", "Buon viaggio! E saluta il vento da parte mia."],
];
let dialogo_finito = false;
let dialogo_attivo = false;
let indice_battuta = 0;
let spazio_rilasciato = false;
let pannello_dialogo = [];
let nome_dialogo;
let testo_dialogo;
let invito_dialogo;

export let meg;
let partenza = 140;
let vite = VITE_MAX;
let istruzioni_visibili = true;
let istruzioni;
let cuori = [];
let transizione = false;
let testo_stato;

function preload(s) {}

function create(s) {
  transizione = false;
  dialogo_attivo = false;
  pannello_dialogo = [];
  crea_sfondo(s);
  meg = PP.shapes.rectangle_add(s, partenza, SUOLO - A_MEG / 2,
    L_MEG, A_MEG, COLORI.meg, 1);
  PP.physics.add(s, meg, PP.physics.type.DYNAMIC);
  // Il limite inferiore resta sotto lo schermo per consentire la caduta nei vuoti.
  PP.physics.set_world_bounds(s, 0, -400, LUNGHEZZA, ALTEZZA + 900);
  PP.physics.set_collide_world_bounds(meg, true);

  for (const [x, larghezza] of TERRENI) {
    crea_blocco(s, x, SUOLO, larghezza, ALTEZZA - SUOLO, COLORI.terreno);
  }
  for (const [x, y, larghezza] of PIATTAFORME) {
    crea_blocco(s, x + SPAZIO_INIZIALE, y, larghezza, 24, COLORI.piattaforma);
  }
  for (const [x, larghezza] of PERICOLI) {
    const ostacolo = rettangolo_fisico(s, x + SPAZIO_INIZIALE, SUOLO - 30,
      larghezza, 30, COLORI.pericolo);
    PP.physics.add_overlap_f(s, meg, ostacolo, riprova);
  }
  for (const x of CHECKPOINT) {
    const segnale = rettangolo_fisico(s, x, SUOLO - 90,
      18, 90, COLORI.checkpoint);
    segnale.visibility.alpha = x <= partenza ? 1 : 0.45;
    PP.physics.add_overlap_f(s, meg, segnale, () => {
      if (x > partenza) {
        partenza = x;
        segnale.visibility.alpha = 1;
        aggiorna_stato();
      }
    });
  }
  const arrivo = rettangolo_fisico(s, 3480 + SPAZIO_INIZIALE, SUOLO - 120,
    48, 120, COLORI.traguardo);
  PP.physics.add_overlap_f(s, meg, arrivo, completa);
  testo(s, 3504 + SPAZIO_INIZIALE, SUOLO - 145, "Arrivo", 24);

  PP.camera.set_bounds(s, 0, 0, LUNGHEZZA, ALTEZZA);
  PP.camera.start_follow(s, meg, -180, 0);
  crea_portale_mercato(s);
  crea_amico(s);
  crea_hud(s);
  crea_dialogo(s);
}

function crea_portale_mercato(s) {
  // Meg nasce a x = 140: il portale termina a x = 88, senza sovrapporsi.
  PP.shapes.rectangle_add(s, 60, SUOLO - 56,
    68, 120, "0xB59AE8", 1);
  const portale = rettangolo_fisico(s, 32, SUOLO - 110,
    56, 110, "0x66518A");
  testo(s, 65, SUOLO - 140, "Mercato", 22);
  PP.physics.add_overlap_f(s, meg, portale, () => {
    if (transizione || dialogo_attivo) return;
    transizione = true;
    PP.game_state.set_variable("ritorno_mercato", "livello1");
    PP.scenes.start("mercato");
  });
}

function crea_amico(s) {
  PP.shapes.rectangle_add(s, 440, SUOLO - 32,
    44, 64, COLORI.checkpoint, 1);
  testo(s, 440, SUOLO - 90, "Amico", 24);
  const zona = rettangolo_fisico(s, 310, SUOLO - 240,
    250, 240, COLORI.checkpoint);
  zona.visibility.alpha = 0;
  PP.physics.add_overlap_f(s, meg, zona, () => {
    if (dialogo_finito || dialogo_attivo || transizione) return;
    dialogo_attivo = true;
    indice_battuta = 0;
    spazio_rilasciato = false;
    PP.physics.set_velocity_x(meg, 0);
    PP.physics.set_velocity_y(meg, 0);
    PP.physics.set_allow_gravity(meg, false);
    for (const elemento of pannello_dialogo) elemento.visibility.hidden = false;
    mostra_battuta();
  });
}

function crea_dialogo(s) {
  const pannello = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 230,
    1060, 220, COLORI.sfondo, 0.98);
  nome_dialogo = testo(s, LARGHEZZA / 2, 157, "", 30);
  testo_dialogo = testo(s, LARGHEZZA / 2, 225, "", 26);
  invito_dialogo = testo(s, LARGHEZZA / 2, 300, "", 22);
  pannello_dialogo = [pannello, nome_dialogo, testo_dialogo, invito_dialogo];
  for (const elemento of pannello_dialogo) {
    fissa(elemento);
    elemento.visibility.hidden = true;
  }
}

function mostra_battuta() {
  const [nome, battuta] = BATTUTE[indice_battuta];
  PP.shapes.text_change(nome_dialogo, nome);
  PP.shapes.text_change(testo_dialogo, battuta);
  PP.shapes.text_change(invito_dialogo,
    "Spazio: " + (indice_battuta === BATTUTE.length - 1 ? "chiudi" : "continua")
    + "   ·   " + (indice_battuta + 1) + "/" + BATTUTE.length);
}

function aggiorna_dialogo(s) {
  // Occorre rilasciare Spazio: il salto di ingresso non salta una battuta.
  if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE)) spazio_rilasciato = true;
  if (!spazio_rilasciato ||
      !PP.interactive.kb.is_key_just_down(s, PP.key_codes.SPACE)) return;
  spazio_rilasciato = false;
  indice_battuta += 1;
  if (indice_battuta < BATTUTE.length) {
    mostra_battuta();
  } else {
    dialogo_attivo = false;
    dialogo_finito = true;
    for (const elemento of pannello_dialogo) elemento.visibility.hidden = true;
    PP.physics.set_allow_gravity(meg, true);
  }
}

function crea_sfondo(s) {
  const cielo = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, COLORI.sfondo, 1);
  fissa(cielo);
  // Sagome decorative geometriche, senza collisioni né texture.
  for (let i = 0; i < Math.ceil(LUNGHEZZA / 280); i++) {
    const altezza = 140 + (i % 4) * 50;
    PP.shapes.rectangle_add(s, i * 280, SUOLO - altezza / 2,
      180, altezza, COLORI.lontano, 1);
  }
}

function rettangolo_fisico(s, x, y, larghezza, altezza, colore) {
  const blocco = PP.shapes.rectangle_add(s,
    x + larghezza / 2, y + altezza / 2, larghezza, altezza, colore, 1);
  PP.physics.add(s, blocco, PP.physics.type.STATIC);
  return blocco;
}

function crea_blocco(s, x, y, larghezza, altezza, colore) {
  const blocco = rettangolo_fisico(s, x, y, larghezza, altezza, colore);
  PP.physics.add_collider(s, meg, blocco);
}

function crea_hud(s) {
  const fascia = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 48,
    LARGHEZZA, 96, COLORI.sfondo, 0.95);
  fissa(fascia);
  fissa(testo(s, 215, 25, "Meg · Livello 1", 30));
  istruzioni = testo(s, 485, 65,
    "← → / A D: muovi   ·   Spazio / ↑ / W: salta   ·   R: ricomincia", 23);
  fissa(istruzioni);
  istruzioni.visibility.hidden = !istruzioni_visibili;
  testo_stato = testo(s, 640, 25, "", 23);
  fissa(testo_stato);
  cuori = [];
  // Cuori geometrici: nessuna immagine o font speciale necessario.
  const punti = [16, 7, 10, 0, 4, 0, 0, 6, 0, 14,
    16, 30, 32, 14, 32, 6, 28, 0, 22, 0];
  for (let i = 0; i < VITE_MAX; i++) {
    const cuore = PP.shapes.polygon_add(s, 850 + i * 44, 28,
      punti, COLORI.pericolo, 1);
    fissa(cuore);
    cuori.push(cuore);
  }
  aggiorna_stato();
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA - 105, 45,
    170, 52, COLORI.terreno, 1);
  fissa(bottone);
  fissa(testo(s, LARGHEZZA - 105, 45, "Alla mappa", 25));
  PP.interactive.mouse.add(bottone, "pointerdown", torna_mappa);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}

function aggiorna_stato() {
  const raggiunti = CHECKPOINT.filter(x => x <= partenza).length;
  PP.shapes.text_change(testo_stato,
    "Checkpoint " + raggiunti + "/3");
  for (let i = 0; i < cuori.length; i++) {
    cuori[i].visibility.alpha = i < vite ? 1 : 0.2;
  }
}

function fissa(oggetto) {
  oggetto.tile_geometry.scroll_factor_x = 0;
  oggetto.tile_geometry.scroll_factor_y = 0;
}

function testo(s, x, y, contenuto, dimensione) {
  return PP.shapes.text_styled_add(s, x, y, contenuto,
    dimensione, FONT, "normal", COLORI.testo, null, 0.5, 0.5);
}

function update(s) {
  if (transizione) return;
  if (istruzioni_visibili && meg.geometry.x >= 140 + DISTANZA_ISTRUZIONI) {
    istruzioni_visibili = false;
    istruzioni.visibility.hidden = true;
  }
  const tasti = PP.key_codes;
  const premuto = tasto => PP.interactive.kb.is_key_down(s, tasto);
  const appena = tasto => PP.interactive.kb.is_key_just_down(s, tasto);
  if (appena(tasti.ESC)) {
    torna_mappa();
    return;
  }
  if (appena(tasti.R)) {
    partenza = 140;
    vite = VITE_MAX;
    istruzioni_visibili = true;
    dialogo_finito = false;
    transizione = true;
    PP.scenes.start("livello1");
    return;
  }
  if (dialogo_attivo) {
    aggiorna_dialogo(s);
    return;
  }
  const sinistra = premuto(tasti.LEFT) || premuto(tasti.A);
  const destra = premuto(tasti.RIGHT) || premuto(tasti.D);
  PP.physics.set_velocity_x(meg, (Number(destra) - Number(sinistra)) * VELOCITA);
  const salto = appena(tasti.SPACE) || appena(tasti.UP) || appena(tasti.W);
  if (salto && PP.physics.is_on_ground(meg)) {
    PP.physics.set_velocity_y(meg, -SALTO);
  }
  if (meg.geometry.y > ALTEZZA + A_MEG) riprova();
}

function riprova() {
  if (transizione) return;
  transizione = true;
  vite -= 1;
  if (vite === 0) {
    partenza = 140;
    vite = VITE_MAX;
    istruzioni_visibili = true;
    dialogo_finito = false;
  }
  PP.scenes.start("livello1");
}

function completa() {
  if (transizione) return;
  PP.game_state.set_variable("livello1_completato", true);
  torna_mappa();
}

function torna_mappa() {
  if (transizione) return;
  transizione = true;
  PP.game_state.set_variable("mappa_da_partita", true);
  partenza = 140;
  vite = VITE_MAX;
  istruzioni_visibili = true;
  dialogo_finito = false;
  PP.scenes.start("mappa");
}

function destroy(s) {
}

PP.scenes.add("livello1", preload, create, update, destroy);
