import { LARGHEZZA, ALTEZZA, font as FONT } from "../config.js";
import { aggiungi_moneta, monete_totali, rimuovi_monete } from "../progressi.js";

const SPAZIO_INIZIALE = 600;
const LUNGHEZZA = 3600 + SPAZIO_INIZIALE;
const VELOCITA = 340;
const SALTO = 780;
const COOLDOWN_DOPPIO_SALTO = 2000;
let doppio_salto_usato = false;
let doppio_salto_pronto = true;
let ricarica_salto = COOLDOWN_DOPPIO_SALTO;
let barra_salto;
let etichetta_salto;
let elementi_hud = [];
let pannello_istruzioni;
const X_BARRA_SALTO = 48;
const L_BARRA_SALTO = 280;
const L_MEG = 40;
const A_MEG = 56;
const L_TOPO = 48;
const A_TOPO = 22;
const DIMENSIONE_MONETA = 16;
const VITA_TOPO = 1;
const VELOCITA_TOPO = VELOCITA * 1.2;
const MARGINE_BUCO_TOPO = 20;
const RIMBALZO_TOPO = 600;
// Posizioni iniziali delle pattuglie, una per ciascun tratto di terreno.
const PATTUGLIE_TOPI = [[760, 1040], [1980, 2170], [2920, 3100], [3750, 3990]];
const SUOLO = 620;
const VITE_MAX = 3;
const DISTANZA_ISTRUZIONI = 400 + SPAZIO_INIZIALE;
const COLORI = {
  sfondo: "0x1D2938", lontano: "0x293A4E", terreno: "0x65768A",
  piattaforma: "0x9AABBA", meg: "0x55DDE0", pericolo: "0xED6672",
  checkpoint: "0xE9BD68", moneta: "0xF2C94C",
  traguardo: "0x85DB9B", testo: "0xFFFFFF",
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
let game_over = false;
let m_rilasciato = true;
let topi = [];
let blocchi_solidi = [];
let piedi_meg_precedenti;
let testo_monete;
let monete_visibili;
// Rimane valido anche passando dalla mappa o dal mercato, fino al Game Over o all’arrivo.
let monete_tentativo = 0;
let immagine_cuore;
let immagine_mappa;
let immagine_moneta;
let immagine_topo;

function preload(s) {
  immagine_cuore = PP.assets.image.load(s, "assets/images/cuore.png");
  immagine_mappa = PP.assets.image.load(s, "assets/images/mappa.png");
  immagine_moneta = PP.assets.image.load(s, "assets/images/moneta.png");
  immagine_topo = PP.assets.image.load(s, "assets/images/topo.png");
}

function create(s) {
  doppio_salto_usato = false;
  doppio_salto_pronto = true;
  ricarica_salto = COOLDOWN_DOPPIO_SALTO;
  m_rilasciato = true;
  transizione = false;
  game_over = false;
  dialogo_attivo = false;
  pannello_dialogo = [];
  topi = [];
  blocchi_solidi = [];
  piedi_meg_precedenti = SUOLO;
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
  
  for (const x of CHECKPOINT) {
    const segnale = rettangolo_fisico(s, x, SUOLO - 90,
      18, 90, COLORI.checkpoint);
    segnale.visibility.alpha = x <= partenza ? 1 : 0.45;
    PP.physics.add_overlap_f(s, meg, segnale, () => {
      if (x > partenza) {
        partenza = x;
        segnale.visibility.alpha = 1;
      }
    });
  }
  const arrivo = rettangolo_fisico(s, 3480 + SPAZIO_INIZIALE, SUOLO - 120,
    48, 120, COLORI.traguardo);
  PP.physics.add_overlap_f(s, meg, arrivo, completa);
  testo(s, 3504 + SPAZIO_INIZIALE, SUOLO - 145, "Arrivo", 24);

  crea_topi(s);
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
  testo(s, 440, SUOLO - 90, "Venditrice", 24);
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
  blocchi_solidi.push(blocco);
}

function crea_topi(s) {
  for (const [inizio_pattuglia, fine_pattuglia] of PATTUGLIE_TOPI) {
    const posizione_iniziale = (inizio_pattuglia + fine_pattuglia) / 2;
    const terreno = TERRENI.find(([inizio, larghezza]) =>
      posizione_iniziale >= inizio && posizione_iniziale <= inizio + larghezza);
    if (!terreno) throw new Error("Pattuglia topo senza terreno sottostante.");
    const minimo = terreno[0] + L_TOPO / 2 + MARGINE_BUCO_TOPO;
    const massimo = terreno[0] + terreno[1] - L_TOPO / 2 - MARGINE_BUCO_TOPO;
    const corpo = PP.shapes.rectangle_add(s, posizione_iniziale,
      SUOLO - A_TOPO / 2, L_TOPO, A_TOPO, "0xBB8A78", 1);
    const skin = PP.assets.image.add(s, immagine_topo,
      corpo.geometry.x, corpo.geometry.y - A_TOPO / 2, 0.5, 0.5);
    skin.geometry.scale_x = L_TOPO / 1001;
    skin.geometry.scale_y = L_TOPO / 1001;
    corpo.visibility.alpha = 0;
    PP.physics.add(s, corpo, PP.physics.type.DYNAMIC);
    PP.physics.set_collision_rectangle(corpo, L_TOPO, A_TOPO, 0, 0);
    for (const blocco of blocchi_solidi) PP.physics.add_collider(s, corpo, blocco);
    const topo = {
      corpo, skin, minimo, massimo, direzione: 1, vita: VITA_TOPO, immune: false,
      fondo_barra: PP.shapes.rectangle_add(s, 0, 0, 48, 8, "0x392C35", 1),
      barra: PP.shapes.rectangle_add(s, 0, 0, 44, 4, "0x85DB9B", 1),
    };
    topi.push(topo);
    aggiorna_barra_topo(topo);
    PP.physics.set_velocity_x(corpo, VELOCITA_TOPO);
    PP.physics.add_overlap_f(s, meg, corpo, () => tocca_topo(s, topo));
  }
}

function aggiorna_barra_topo(topo) {
  const frazione = topo.vita / VITA_TOPO;
  const x = topo.corpo.geometry.x;
  const y = topo.corpo.geometry.y - A_TOPO / 2 - 12;
  topo.fondo_barra.geometry.x = x;
  topo.fondo_barra.geometry.y = y;
  topo.barra.geometry.scale_x = frazione;
  // La salute si svuota da destra mantenendo fisso il margine sinistro.
  topo.barra.geometry.x = x - 22 + 22 * frazione;
  topo.barra.geometry.y = y;
}

function aggiorna_topi() {
  for (const topo of topi) {
    if (topo.vita <= 0) continue;
    const x = topo.corpo.geometry.x;
    let cambia_direzione = false;
    if (topo.direzione > 0 && x >= topo.massimo) {
      topo.direzione = -1;
      cambia_direzione = true;
    } else if (topo.direzione < 0 && x <= topo.minimo) {
      topo.direzione = 1;
      cambia_direzione = true;
    }
    if (cambia_direzione) topo.skin.geometry.flip_x = topo.direzione > 0;
    PP.physics.set_velocity_x(topo.corpo,
      dialogo_attivo ? 0 : topo.direzione * VELOCITA_TOPO);
    topo.skin.geometry.x = topo.corpo.geometry.x;
    topo.skin.geometry.y = topo.corpo.geometry.y - A_TOPO / 2;
    aggiorna_barra_topo(topo);
  }
  piedi_meg_precedenti = meg.geometry.y + A_MEG / 2;
}

function tocca_topo(s, topo) {
  if (transizione || game_over || dialogo_attivo || topo.vita <= 0 || topo.immune) return;
  const sopra = topo.corpo.geometry.y - A_TOPO / 2;
  const schiacciato = PP.physics.get_velocity_y(meg) > 0
    && piedi_meg_precedenti <= sopra + 8
    && meg.geometry.y < sopra;
  if (!schiacciato) {
    riprova(s);
    return;
  }
  topo.vita -= 1;
  PP.physics.set_velocity_y(meg, -RIMBALZO_TOPO);
  if (topo.vita === 0) {
    const moneta = PP.shapes.rectangle_add(s, topo.corpo.geometry.x,
      topo.corpo.geometry.y - A_TOPO / 2 - DIMENSIONE_MONETA / 2,
      DIMENSIONE_MONETA, DIMENSIONE_MONETA, COLORI.moneta, 1);
    PP.physics.add(s, moneta, PP.physics.type.DYNAMIC);
    PP.physics.set_collision_rectangle(moneta,
      DIMENSIONE_MONETA, DIMENSIONE_MONETA, 0, 0);
    for (const blocco of blocchi_solidi) PP.physics.add_collider(s, moneta, blocco);
    PP.physics.add_overlap_f(s, meg, moneta, () => raccogli_moneta(moneta));
    PP.shapes.destroy(topo.corpo);
    PP.shapes.destroy(topo.skin);
    PP.shapes.destroy(topo.barra);
    PP.shapes.destroy(topo.fondo_barra);
    return;
  }
  aggiorna_barra_topo(topo);
  topo.immune = true;
  topo.skin.visibility.alpha = 0.5;
  // Evita danni multipli durante la stessa sovrapposizione.
  PP.timers.add_timer(s, 250, () => {
    topo.immune = false;
    topo.skin.visibility.alpha = 1;
  }, false);
}

function crea_hud(s) {
  elementi_hud = [];
  const pannello = PP.shapes.rectangle_add(s, 188, 68,
    328, 104, COLORI.sfondo, 0.94);
  const accento = PP.shapes.rectangle_add(s, 26, 68,
    4, 104, COLORI.meg, 1);
  const separatore = PP.shapes.rectangle_add(s, 192, 42,
    2, 30, COLORI.terreno, 0.6);
  const titolo = testo(s, LARGHEZZA / 2, 38, "Meg · Livello 1", 26);
  etichetta_salto = testo(s, 188, 76, "", 18);
  const fondo_salto = PP.shapes.rectangle_add(s, 188, 100,
    L_BARRA_SALTO + 4, 12, COLORI.terreno, 1);
  barra_salto = PP.shapes.rectangle_add(s, 188, 100,
    L_BARRA_SALTO, 8, COLORI.meg, 1);
  elementi_hud.push(pannello, accento, separatore, titolo,
    etichetta_salto, fondo_salto, barra_salto);
  aggiorna_barra_salto();
  // Il timer della scena si sospende insieme al livello quando si apre la mappa.
  PP.timers.add_timer(s, 50, () => {
    if (game_over || transizione) return;
    if (!doppio_salto_pronto) {
      ricarica_salto = Math.min(COOLDOWN_DOPPIO_SALTO, ricarica_salto + 50);
    }
    aggiorna_barra_salto();
  }, true);
  pannello_istruzioni = PP.shapes.rectangle_add(s, 524, 63,
    1000, 94, COLORI.sfondo, 0.94);
  istruzioni = testo(s, 524, 63,
    "← → / A D  Muovi     Spazio / ↑ / W  Doppio salto (2 s)\nR  Ricomincia     M  Apri / chiudi mappa", 23);
  fissa(pannello_istruzioni);
  fissa(istruzioni);
  cuori = [];
  for (let i = 0; i < VITE_MAX; i++) {
    const cuore = PP.assets.image.add(s, immagine_cuore,
      64 + i * 44, 42, 0.5, 0.5);
    cuore.geometry.scale_x = 0.032;
    cuore.geometry.scale_y = 0.032;
    cuori.push(cuore);
    elementi_hud.push(cuore);
  }
  // Il disegno occupa circa 280 px dei 1001 px del file: a questa scala
  // appare alto circa 31 px, come i cuori. Compensa anche i margini asimmetrici.
  const icona_moneta = PP.assets.image.add(s, immagine_moneta, 238, 45, 0.5, 0.5);
  icona_moneta.geometry.scale_x = 0.112;
  icona_moneta.geometry.scale_y = 0.112;
  testo_monete = testo(s, 290, 42, "", 30);
  elementi_hud.push(icona_moneta, testo_monete);
  for (const elemento of elementi_hud) fissa(elemento);
  aggiorna_visibilita_hud();
  monete_visibili = undefined;
  aggiorna_contatore_monete();
  aggiorna_cuori();
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA - 105, 45,
    170, 52, COLORI.terreno, 1);
  fissa(bottone);
  const icona_mappa = PP.assets.image.add(s, immagine_mappa,
    1135, 45, 0.5, 0.5);
  icona_mappa.geometry.scale_x = 0.09;
  icona_mappa.geometry.scale_y = 0.09;
  fissa(icona_mappa);
  fissa(testo(s, 1195, 45, "Mappa [M]", 21));
  PP.interactive.mouse.add(bottone, "pointerdown", torna_mappa);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}

function aggiorna_visibilita_hud() {
  istruzioni.visibility.hidden = !istruzioni_visibili;
  pannello_istruzioni.visibility.hidden = !istruzioni_visibili;
  for (const elemento of elementi_hud) {
    elemento.visibility.hidden = istruzioni_visibili;
  }
}

function raccogli_moneta(moneta) {
  if (transizione || game_over || moneta.raccolta) return;
  moneta.raccolta = true;
  aggiungi_moneta();
  monete_tentativo += 1;
  aggiorna_contatore_monete();
  PP.shapes.destroy(moneta);
}

function perdi_monete_tentativo() {
  rimuovi_monete(monete_tentativo);
  monete_tentativo = 0;
  aggiorna_contatore_monete();
}

function aggiorna_contatore_monete() {
  const monete = monete_totali();
  if (monete === monete_visibili) return;
  monete_visibili = monete;
  PP.shapes.text_change(testo_monete, String(monete));
}

function aggiorna_cuori() {
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
  if (transizione || game_over) return;
  aggiorna_contatore_monete();
  aggiorna_topi();
  if (istruzioni_visibili && meg.geometry.x >= 140 + DISTANZA_ISTRUZIONI) {
    istruzioni_visibili = false;
    aggiorna_visibilita_hud();
  }
  const tasti = PP.key_codes;
  const premuto = tasto => PP.interactive.kb.is_key_down(s, tasto);
  const appena = tasto => PP.interactive.kb.is_key_just_down(s, tasto);
  const m_premuto = appena(tasti.M);
  const apri_con_m = m_rilasciato && m_premuto;
  if (!m_rilasciato && !premuto(tasti.M)) m_rilasciato = true;
  if (apri_con_m || appena(tasti.ESC)) {
    torna_mappa();
    return;
  }
  if (appena(tasti.R)) {
    ricomincia();
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
  gestisci_salto(s, salto);
  if (meg.geometry.y > ALTEZZA + A_MEG) riprova(s);
}

function aggiorna_barra_salto() {
  const frazione = doppio_salto_pronto ? 1 : ricarica_salto / COOLDOWN_DOPPIO_SALTO;
  barra_salto.geometry.scale_x = frazione;
  barra_salto.geometry.x = X_BARRA_SALTO + L_BARRA_SALTO / 2 * frazione;
  const stato = doppio_salto_pronto
    ? (doppio_salto_usato ? "atterra" : "pronto")
    : ((COOLDOWN_DOPPIO_SALTO - ricarica_salto) / 1000).toFixed(1) + " s";
  PP.shapes.text_change(etichetta_salto, "Doppio salto: " + stato);
}

function gestisci_salto(s, salto) {
  const a_terra = PP.physics.is_on_ground(meg);
  if (a_terra) doppio_salto_usato = false;
  if (!salto) return;
  if (a_terra) {
    PP.physics.set_velocity_y(meg, -SALTO);
  } else if (!doppio_salto_usato && doppio_salto_pronto) {
    doppio_salto_usato = true;
    doppio_salto_pronto = false;
    ricarica_salto = 0;
    aggiorna_barra_salto();
    PP.physics.set_velocity_y(meg, -SALTO);
    PP.timers.add_timer(s, COOLDOWN_DOPPIO_SALTO, () => {
      doppio_salto_pronto = true;
      ricarica_salto = COOLDOWN_DOPPIO_SALTO;
      aggiorna_barra_salto();
    }, false);
  }
}

function riprova(s) {
  if (transizione || game_over) return;
  vite -= 1;
  if (vite === 0) {
    perdi_monete_tentativo();
    game_over = true;
    PP.physics.set_velocity_x(meg, 0);
    PP.physics.set_velocity_y(meg, 0);
    PP.physics.set_allow_gravity(meg, false);
    aggiorna_cuori();
    crea_game_over(s);
    return;
  }
  transizione = true;
  PP.scenes.start("livello1");
}

function crea_game_over(s) {
  const pannello = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    560, 260, COLORI.sfondo, 0.96);
  const titolo = testo(s, LARGHEZZA / 2, ALTEZZA / 2 - 60, "Game Over", 56);
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2 + 55,
    240, 64, COLORI.terreno, 1);
  const etichetta = testo(s, LARGHEZZA / 2, ALTEZZA / 2 + 55, "Ricomincia", 32);
  for (const elemento of [pannello, titolo, bottone, etichetta]) fissa(elemento);
  PP.interactive.mouse.add(bottone, "pointerdown", ricomincia);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}

function ricomincia() {
  if (transizione) return;
  partenza = 140;
  vite = VITE_MAX;
  istruzioni_visibili = true;
  dialogo_finito = false;
  game_over = false;
  transizione = true;
  PP.scenes.start("livello1");
}

function completa() {
  if (transizione || game_over) return;
  // Le monete del tentativo diventano definitive soltanto raggiungendo l'arrivo.
  monete_tentativo = 0;
  PP.game_state.set_variable("livello1_completato", true);
  transizione = true;
  PP.game_state.set_variable("mappa_da_partita", false);
  partenza = 140;
  vite = VITE_MAX;
  istruzioni_visibili = true;
  dialogo_finito = false;
  PP.scenes.start("mappa");
}

function torna_mappa() {
  if (transizione || PP.scenes.in_overlay_mode) return;
  // Ignora il tasto usato per chiudere la mappa finché non viene rilasciato.
  m_rilasciato = false;
  PP.game_state.set_variable("mappa_da_partita", true);
  // La libreria sospende il livello senza distruggerne posizione e stato.
  PP.scenes.start_overlay("mappa");
}

function destroy(s) {
}

PP.scenes.add("livello1", preload, create, update, destroy);
