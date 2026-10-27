import { ALTEZZA } from "./config.js";
import { astro } from "./astro.js";
import { Y_TERRENO, terreni, cassoni } from "./livello.js";
import { colpito } from "./partita.js";

const BIANCO = "0xFFFFFF";
const A_POLLO = 102;
const DISTANZA_PALLA = 350;

const VEL_POLLO = 120;
const VEL_RIMBALZO = 700;

let ss_pollo;
let ss_esplosione;
let img_palla;

let esplosione;

export function carica_nemici(s) {
  ss_pollo = PP.assets.sprite.load_spritesheet(s,
    "assets/images/pollo_spritesheet.png", 96, 102);
  ss_esplosione = PP.assets.sprite.load_spritesheet(s,
    "assets/images/esplosione_spritesheet.png", 72, 66);
  img_palla = PP.assets.image.load(s,
    "assets/images/palla.png");
}

export function crea_polli(s, x_polli) {
  for (let i = 0; i < x_polli.length; i++) {
    crea_pollo(s, x_polli[i]);
  }
}

function crea_pollo(s, x) {
  let p = PP.assets.sprite.add(s, ss_pollo,
    x, Y_TERRENO - A_POLLO / 2, 0.5, 0.5);
  PP.physics.add(s, p, PP.physics.type.DYNAMIC);
  PP.physics.set_velocity_x(p, VEL_POLLO);
  PP.physics.set_bounce_x(p, 1);
  for (let i = 0; i < terreni.length; i++) {
    PP.physics.add_collider(s, p, terreni[i]);
  }
  for (let i = 0; i < cassoni.length; i++) {
    PP.physics.add_collider_f(s, p, cassoni[i], gira);
  }
  PP.physics.add_overlap_f(s, astro, p, tocca_pollo);
  PP.assets.sprite.animation_add(p, "cammina",
    0, 13, 20, -1);
  PP.assets.sprite.animation_play(p, "cammina");
}

export function crea_trappole(s, x_trappole) {
  for (let i = 0; i < x_trappole.length; i++) {
    let t = PP.shapes.rectangle_add(s, x_trappole[i], 0,
      20, ALTEZZA * 2, BIANCO, 0);
    PP.physics.add(s, t, PP.physics.type.STATIC);
    PP.physics.add_overlap_f(s, astro, t, fai_cadere);
  }
}

export function crea_esplosione(s) {
  esplosione = PP.assets.sprite.add(s, ss_esplosione,
    0, 0, 0.5, 0.5);
  esplosione.visibility.hidden = true;
  PP.assets.sprite.animation_add(esplosione, "esplodi",
    0, 5, 15, 0);
}

function gira(s, a, b) {
  a.geometry.flip_x = PP.physics.get_velocity_x(a) < 0;
}

function tocca_pollo(s, a, b) {
  if (PP.physics.get_velocity_y(a) > 0) {
    esplodi(s, b);
    PP.physics.set_velocity_y(a, -VEL_RIMBALZO);
  } else {
    colpito(s);
  }
}

function esplodi(s, oggetto) {
  esplosione.geometry.x = oggetto.geometry.x;
  esplosione.geometry.y = oggetto.geometry.y;
  esplosione.visibility.hidden = false;
  PP.assets.sprite.animation_play(esplosione, "esplodi");
  PP.assets.destroy(oggetto);
  PP.timers.add_timer(s, 400, nascondi_esplosione, false);
}

function nascondi_esplosione(s) {
  esplosione.visibility.hidden = true;
}

function fai_cadere(s, a, b) {
  crea_palla(s, b.geometry.x + DISTANZA_PALLA);
  PP.shapes.destroy(b);
}

function crea_palla(s, x) {
  let p = PP.assets.image.add(s, img_palla,
    x, PP.camera.get_scroll_y(s), 0.5, 0.5);
  PP.physics.add(s, p, PP.physics.type.DYNAMIC);
  PP.physics.add_overlap_f(s, astro, p, tocca_palla);
  for (let i = 0; i < terreni.length; i++) {
    PP.physics.add_collider_f(s, p, terreni[i], schianta);
  }
}

function tocca_palla(s, a, b) {
  colpito(s);
}

function schianta(s, a, b) {
  esplodi(s, a);
}
