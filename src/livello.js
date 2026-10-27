import { LARGHEZZA, ALTEZZA } from "./config.js";
import { astro, frena } from "./astro.js";

export const Y_TERRENO = 592;
const L_LIVELLO = 5760;
const A_CASSONE = 180;
const Y_KIWI = 540;
const ESCURSIONE = 120;
const A_TROFEO = 132;
const X_TROFEO = L_LIVELLO - 100;
const A_BANDIERA = 138;

const VEL_PIATTAFORMA = 100;
const ANTICIPO_CAMERA = 200;

let img_cassone;
let img_piattaforma;
let img_trofeo;
let ss_kiwi;
let ss_bandiera;

export let terreni;
export let cassoni;
let piattaforme;
let x_partenze;

export function carica_livello(s) {
  img_cassone = PP.assets.image.load(s,
    "assets/images/cassone.png");
  img_piattaforma = PP.assets.image.load(s,
    "assets/images/piattaforma.png");
  img_trofeo = PP.assets.image.load(s,
    "assets/images/trofeo.png");
  ss_kiwi = PP.assets.sprite.load_spritesheet(s,
    "assets/images/kiwi_spritesheet.png", 54, 48);
  ss_bandiera = PP.assets.sprite.load_spritesheet(s,
    "assets/images/bandiera_spritesheet.png", 96, 138);
}

export function crea_layer(s, img) {
  let layer = PP.assets.tilesprite.add(s, img,
    0, 0, LARGHEZZA, ALTEZZA, 0, 0);
  layer.tile_geometry.scroll_factor_x = 0;
  layer.tile_geometry.scroll_factor_y = 0;
  return layer;
}

export function crea_terreno(s, img, x_terreno, l_terreno,
    alzate) {
  terreni = [];
  for (let i = 0; i < x_terreno.length; i++) {
    let y = Y_TERRENO - alzate[i];
    let t = PP.assets.tilesprite.add(s, img,
      x_terreno[i], y, l_terreno[i], ALTEZZA - y, 0, 0);
    PP.physics.add(s, t, PP.physics.type.STATIC);
    terreni.push(t);
  }
}

export function crea_attrito(s, attrito) {
  for (let i = 0; i < terreni.length; i++) {
    PP.physics.add_collider_f(s, astro, terreni[i],
      attrito);
  }
}

export function crea_cassoni(s, x_cassoni) {
  cassoni = [];
  for (let i = 0; i < x_cassoni.length; i++) {
    let c = PP.assets.image.add(s, img_cassone,
      x_cassoni[i], Y_TERRENO - A_CASSONE / 2, 0.5, 0.5);
    PP.physics.add(s, c, PP.physics.type.STATIC);
    PP.physics.add_collider_f(s, astro, c, frena);
    cassoni.push(c);
  }
}

export function crea_piattaforme(s, x_piattaforme,
    y_piattaforme) {
  piattaforme = [];
  x_partenze = x_piattaforme;
  for (let i = 0; i < x_piattaforme.length; i++) {
    let p = PP.assets.image.add(s, img_piattaforma,
      x_piattaforme[i], y_piattaforme[i], 0.5, 0.5);
    PP.physics.add(s, p, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(p, false);
    PP.physics.set_immovable(p, true);
    PP.physics.set_velocity_x(p, VEL_PIATTAFORMA);
    PP.physics.add_collider_f(s, astro, p, frena);
    piattaforme.push(p);
  }
}

export function crea_kiwi(s, x_kiwi) {
  for (let i = 0; i < x_kiwi.length; i++) {
    let k = PP.assets.sprite.add(s, ss_kiwi,
      x_kiwi[i], Y_KIWI, 0.5, 0.5);
    PP.physics.add(s, k, PP.physics.type.STATIC);
    PP.physics.add_overlap_f(s, astro, k, raccogli);
    PP.assets.sprite.animation_add(k, "gira",
      0, 16, 20, -1);
    PP.assets.sprite.animation_play(k, "gira");
  }
}

export function crea_trofeo(s, vittoria) {
  let trofeo = PP.assets.image.add(s, img_trofeo,
    X_TROFEO, Y_TERRENO - A_TROFEO / 2, 0.5, 0.5);
  PP.physics.add(s, trofeo, PP.physics.type.STATIC);
  PP.physics.add_overlap_f(s, astro, trofeo, vittoria);
}

export function crea_bandiere(s, x_bandiere) {
  for (let i = 0; i < x_bandiere.length; i++) {
    crea_bandiera(s, x_bandiere[i]);
  }
}

function crea_bandiera(s, x) {
  let b = PP.assets.sprite.add(s, ss_bandiera,
    x, Y_TERRENO - A_BANDIERA / 2, 0.5, 0.5);
  PP.physics.add(s, b, PP.physics.type.STATIC);
  PP.physics.add_overlap_f(s, astro, b, tocca_bandiera);
  PP.assets.sprite.animation_add(b, "sventola",
    1, 10, 15, -1);
  if (x <= PP.game_state.get_variable("checkpoint")) {
    PP.assets.sprite.animation_play(b, "sventola");
  }
}

export function crea_camera(s) {
  PP.physics.set_world_bounds(s, 0, -ALTEZZA, L_LIVELLO,
    ALTEZZA * 3);
  PP.camera.set_bounds(s, 0, -ALTEZZA, L_LIVELLO,
    ALTEZZA * 2);
  PP.camera.start_follow(s, astro, -ANTICIPO_CAMERA, 0);
  PP.camera.set_deadzone(s, 0, 300);
}

export function muovi_piattaforme() {
  for (let i = 0; i < piattaforme.length; i++) {
    let p = piattaforme[i];
    if (p.geometry.x > x_partenze[i] + ESCURSIONE) {
      PP.physics.set_velocity_x(p, -VEL_PIATTAFORMA);
    }
    if (p.geometry.x < x_partenze[i] - ESCURSIONE) {
      PP.physics.set_velocity_x(p, VEL_PIATTAFORMA);
    }
  }
}

function raccogli(s, a, b) {
  PP.assets.destroy(b);
}

function tocca_bandiera(s, a, b) {
  let checkpoint = PP.game_state.get_variable("checkpoint");
  if (b.geometry.x > checkpoint) {
    PP.game_state.set_variable("checkpoint", b.geometry.x);
    PP.assets.sprite.animation_play(b, "sventola");
  }
}
