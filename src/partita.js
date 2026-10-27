import { ALTEZZA, FONT } from "./config.js";
import { astro } from "./astro.js";

const BIANCO = "0xFFFFFF";
const X_PARTENZA = 200;
const TEMPO_MAX = 120;
const VITE = 3;
const DURATA_INVULNERABILE = 2000;

const TASTO_PAUSA = PP.key_codes.P;

let img_cuore;

let testo_tempo;
let cuori;
let layer_hud;

export let partita_finita;
let secondi;
let vite;
let invulnerabile;

export function carica_partita(s) {
  img_cuore = PP.assets.image.load(s,
    "assets/images/cuore.png");
}

export function crea_partita(s) {
  partita_finita = false;
  secondi = 0;
  vite = VITE;
  invulnerabile = false;
  cuori = [];
  crea_tempo(s);
  crea_cuori(s);
  crea_hud(s);
  PP.timers.add_timer(s, 1000, conta_secondo, true);
  PP.timers.add_timer(s, 100, lampeggia, true);
}

function crea_tempo(s) {
  testo_tempo = PP.shapes.text_styled_add(s,
    30, 30, "", 24, FONT, "normal", BIANCO, null, 0, 0);
  testo_tempo.tile_geometry.scroll_factor_x = 0;
  testo_tempo.tile_geometry.scroll_factor_y = 0;
  aggiorna_tempo();
}

function crea_cuori(s) {
  for (let i = 0; i < VITE; i++) {
    let c = PP.assets.image.add(s, img_cuore,
      30 + i * 55, 80, 0, 0);
    c.tile_geometry.scroll_factor_x = 0;
    c.tile_geometry.scroll_factor_y = 0;
    cuori.push(c);
  }
}

function crea_hud(s) {
  layer_hud = PP.layers.create(s);
  PP.layers.set_z_index(layer_hud, 2);
  PP.layers.add_to_layer(layer_hud, testo_tempo);
  for (let i = 0; i < cuori.length; i++) {
    PP.layers.add_to_layer(layer_hud, cuori[i]);
  }
}

export function aggiorna_partita(s) {
  if (partita_finita) {
    return;
  }
  if (astro.geometry.y > ALTEZZA) {
    termina("GAME OVER");
    return;
  }
  if (PP.interactive.kb.is_key_just_down(s, TASTO_PAUSA)) {
    PP.scenes.start_overlay("pausa");
  }
}

export function colpito(s) {
  if (partita_finita || invulnerabile) {
    return;
  }
  vite -= 1;
  cuori[vite].visibility.hidden = true;
  invulnerabile = true;
  PP.timers.add_timer(s, DURATA_INVULNERABILE,
    fine_invulnerabile, false);
  if (vite === 0) {
    termina("GAME OVER");
  }
}

function fine_invulnerabile(s) {
  invulnerabile = false;
}

function lampeggia(s) {
  if (invulnerabile && astro.visibility.alpha === 1) {
    astro.visibility.alpha = 0.3;
  } else {
    astro.visibility.alpha = 1;
  }
}

function conta_secondo(s) {
  if (partita_finita) {
    return;
  }
  secondi += 1;
  aggiorna_tempo();
  if (secondi === TEMPO_MAX) {
    termina("TEMPO SCADUTO");
  }
}

function aggiorna_tempo() {
  PP.shapes.text_change(testo_tempo,
    "TEMPO " + (TEMPO_MAX - secondi));
}

export function termina(messaggio) {
  if (partita_finita) {
    return;
  }
  partita_finita = true;
  PP.game_state.set_variable("messaggio", messaggio);
  PP.scenes.start("fine");
}

export function nuovo_livello(livello) {
  partita_finita = true;
  PP.game_state.set_variable("livello", livello);
  PP.game_state.set_variable("checkpoint", X_PARTENZA);
  PP.scenes.start(livello);
}
