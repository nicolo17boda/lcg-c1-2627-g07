import { LARGHEZZA, ALTEZZA, FONT } from "../config.js";
import { nuovo_livello } from "../partita.js";

const BIANCO = "0xFFFFFF";
const BLU = "0x0024B4";
const Y_TERRENO = 592;
const A_ASTRO = 96;
const A_POLLO = 102;
const A_TROFEO = 132;
const X_TROFEO = 890;
const X_POLLI = [400, 520, 760, 880];
const RIGHE_KIWI = 5;

let img_terreno;
let img_trofeo;
let ss_astro;
let ss_pollo;
let ss_kiwi;

let polli;

function preload(s) {
  img_terreno = PP.assets.image.load(s,
    "assets/images/terreno.png");
  img_trofeo = PP.assets.image.load(s,
    "assets/images/trofeo.png");
  ss_astro = PP.assets.sprite.load_spritesheet(s,
    "assets/images/astro_spritesheet.png", 96, 96);
  ss_pollo = PP.assets.sprite.load_spritesheet(s,
    "assets/images/pollo_spritesheet.png", 96, 102);
  ss_kiwi = PP.assets.sprite.load_spritesheet(s,
    "assets/images/kiwi_spritesheet.png", 54, 48);
}

function create(s) {
  let messaggio = PP.game_state.get_variable("messaggio");
  polli = [];
  crea_terreno(s);
  if (messaggio === "LIVELLO COMPLETATO") {
    crea_festa(s);
  } else {
    crea_sconfitta(s);
  }
  mostra_messaggio(s);
  mostra_rigioca(s);
  PP.timers.add_timer(s, 400, gira_polli, true);
}

function crea_terreno(s) {
  PP.assets.tilesprite.add(s, img_terreno,
    0, Y_TERRENO, LARGHEZZA, ALTEZZA - Y_TERRENO, 0, 0);
}

function crea_festa(s) {
  crea_montagna(s);
  let y = Y_TERRENO - RIGHE_KIWI * 32 - A_ASTRO / 2;
  let astro = PP.assets.sprite.add(s, ss_astro,
    LARGHEZZA / 2, y, 0.5, 0.5);
  PP.assets.sprite.animation_add(astro, "doppio",
    13, 18, 15, -1);
  PP.assets.sprite.animation_play(astro, "doppio");
  PP.assets.image.add(s, img_trofeo,
    X_TROFEO, Y_TERRENO - A_TROFEO / 2, 0.5, 0.5);
}

function crea_montagna(s) {
  for (let riga = 0; riga < RIGHE_KIWI; riga++) {
    let n = RIGHE_KIWI - riga;
    let x = LARGHEZZA / 2 - (n - 1) * 22;
    for (let i = 0; i < n; i++) {
      crea_kiwi(s, x + i * 44, Y_TERRENO - 24 - riga * 32);
    }
  }
}

function crea_kiwi(s, x, y) {
  let k = PP.assets.sprite.add(s, ss_kiwi, x, y, 0.5, 0.5);
  PP.assets.sprite.animation_add(k, "gira", 0, 16, 20, -1);
  PP.assets.sprite.animation_play(k, "gira");
}

function crea_sconfitta(s) {
  let astro = PP.assets.sprite.add(s, ss_astro,
    LARGHEZZA / 2, Y_TERRENO - A_ASTRO / 2, 0.5, 0.5);
  astro.geometry.angle = -90;
  for (let i = 0; i < X_POLLI.length; i++) {
    crea_pollo(s, X_POLLI[i]);
  }
}

function crea_pollo(s, x) {
  let p = PP.assets.sprite.add(s, ss_pollo,
    x, Y_TERRENO - A_POLLO / 2, 0.5, 0.5);
  PP.assets.sprite.animation_add(p, "cammina",
    0, 13, 20, -1);
  PP.assets.sprite.animation_play(p, "cammina");
  polli.push(p);
}

function gira_polli(s) {
  for (let i = 0; i < polli.length; i++) {
    polli[i].geometry.flip_x = !polli[i].geometry.flip_x;
  }
}

function mostra_messaggio(s) {
  let messaggio = PP.game_state.get_variable("messaggio");
  PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, 120, messaggio,
    40, FONT, "normal", BIANCO, null, 0.5, 0.5);
}

function mostra_rigioca(s) {
  let bottone = PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, 210, " RIGIOCA ",
    32, FONT, "normal", BIANCO, BLU, 0.5, 0.5);
  PP.interactive.mouse.add(bottone, "pointerdown", rigioca);
}

function rigioca(s) {
  let messaggio = PP.game_state.get_variable("messaggio");
  if (messaggio === "LIVELLO COMPLETATO") {
    nuovo_livello("neve");
  } else {
    PP.scenes.start(PP.game_state.get_variable("livello"));
  }
}

function update(s) {}

function destroy(s) {}

PP.scenes.add("fine", preload, create, update, destroy);
