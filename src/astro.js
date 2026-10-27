const L_ASTRO = 96;
const A_ASTRO = 96;
const VEL_SALTO = 1000;
const SALTI_MAX = 2;
const VEL_CORSA = 500;
const ATTRITO_NEVE = 600;
const ATTRITO_NORMALE = 3000;

const TASTO_SX = PP.key_codes.LEFT;
const TASTO_DX = PP.key_codes.RIGHT;
const TASTO_SALTO = PP.key_codes.SPACE;

let ss_astro;

export let astro;

let animazione;
let salti;

export function carica_astro(s) {
  ss_astro = PP.assets.sprite.load_spritesheet(s,
    "assets/images/astro_spritesheet.png",
    L_ASTRO, A_ASTRO);
}

export function crea_astro(s, x, y) {
  animazione = "";
  salti = 0;
  astro = PP.assets.sprite.add(s, ss_astro,
    x, y - A_ASTRO / 2, 0.5, 0.5);
  PP.physics.add(s, astro, PP.physics.type.DYNAMIC);
  PP.physics.set_collide_world_bounds(astro, true);
  PP.physics.set_collision_rectangle(astro, 54, 72, 21, 24);
  PP.physics.set_drag_x(astro, ATTRITO_NORMALE);
  PP.assets.sprite.animation_add(astro, "fermo",
    0, 0, 1, 0);
  PP.assets.sprite.animation_add(astro, "corsa",
    1, 12, 20, -1);
  PP.assets.sprite.animation_add(astro, "salto",
    19, 19, 1, 0);
  PP.assets.sprite.animation_add(astro, "doppio",
    13, 18, 15, -1);
}

export function muovi_astro(s) {
  cammina(s);
  salta(s);
  anima_astro();
}

function cammina(s) {
  if (PP.interactive.kb.is_key_down(s, TASTO_SX)) {
    PP.physics.set_velocity_x(astro, -VEL_CORSA);
    astro.geometry.flip_x = true;
  } else if (PP.interactive.kb.is_key_down(s, TASTO_DX)) {
    PP.physics.set_velocity_x(astro, VEL_CORSA);
    astro.geometry.flip_x = false;
  }
}

function salta(s) {
  if (PP.physics.is_on_ground(astro)) {
    salti = 0;
  }
  if (PP.interactive.kb.is_key_just_down(s, TASTO_SALTO)
      && salti < SALTI_MAX) {
    PP.physics.set_velocity_y(astro, -VEL_SALTO);
    salti += 1;
  }
}

function anima_astro() {
  let nuova = "fermo";
  if (salti === SALTI_MAX) {
    nuova = "doppio";
  } else if (!PP.physics.is_on_ground(astro)) {
    nuova = "salto";
  } else if (PP.physics.get_velocity_x(astro) !== 0) {
    nuova = "corsa";
  }
  if (nuova !== animazione) {
    animazione = nuova;
    PP.assets.sprite.animation_play(astro, animazione);
  }
}

export function scivola(s, a, b) {
  PP.physics.set_drag_x(a, ATTRITO_NEVE);
}

export function frena(s, a, b) {
  PP.physics.set_drag_x(a, ATTRITO_NORMALE);
}
