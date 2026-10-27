import { LARGHEZZA, ALTEZZA, FONT } from "../config.js";
import { carica_astro, crea_astro, astro }
  from "../astro.js";
import { Y_TERRENO, crea_layer } from "../livello.js";
import { nuovo_livello } from "../partita.js";

const BIANCO = "0xFFFFFF";
const BLU = "0x0024B4";
const NERO = "0x000000";
const VEL_MENU = 5;
const VEL_NEVE = 2;

let img_montagne;
let img_colline;
let img_terreno;
let img_neve;

let colline;
let terreno;
let neve;

let bottone;
let bottone_storia;

function preload(s) {
  img_montagne = PP.assets.image.load(s,
    "assets/images/montagne.png");
  img_colline = PP.assets.image.load(s,
    "assets/images/colline.png");
  img_terreno = PP.assets.image.load(s,
    "assets/images/terreno.png");
  img_neve = PP.assets.image.load(s,
    "assets/images/neve.png");
  carica_astro(s);
}

function create(s) {
  crea_sfondo(s);
  crea_corridore(s);
  crea_velo(s);
  mostra_titolo(s);
  crea_bottone(s);
  crea_bottone_storia(s);
}

function crea_sfondo(s) {
  crea_layer(s, img_montagne);
  colline = crea_layer(s, img_colline);
  terreno = PP.assets.tilesprite.add(s, img_terreno,
    0, Y_TERRENO, LARGHEZZA, ALTEZZA - Y_TERRENO, 0, 0);
}

function crea_corridore(s) {
  crea_astro(s, LARGHEZZA / 2, Y_TERRENO);
  PP.physics.set_allow_gravity(astro, false);
  PP.assets.sprite.animation_play(astro, "corsa");
}

function crea_velo(s) {
  neve = crea_layer(s, img_neve);
  neve.visibility.alpha = 0.7;
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, NERO, 0.4);
}

function mostra_titolo(s) {
  PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, ALTEZZA / 3, "La Mamma dell'Ammazzadraghi",
    64, FONT, "normal", BIANCO, null, 0.5, 0.5);
}

function crea_bottone(s) {
  bottone = PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, ALTEZZA / 2, " GIOCA ",
    32, FONT, "normal", BIANCO, BLU, 0.5, 0.5);
  PP.interactive.mouse.add(bottone, "pointerdown", gioca);
  PP.interactive.mouse.add(bottone, "pointerover",
    evidenzia);
  PP.interactive.mouse.add(bottone, "pointerout", normale);
}

function crea_bottone_storia(s) {
  bottone_storia = PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, ALTEZZA / 2 + 80, " STORIA ",
    32, FONT, "normal", BIANCO, BLU, 0.5, 0.5);
  PP.interactive.mouse.add(bottone_storia, "pointerdown",
    racconta);
  PP.interactive.mouse.add(bottone_storia, "pointerover",
    evidenzia_storia);
  PP.interactive.mouse.add(bottone_storia, "pointerout",
    normale_storia);
}

function gioca(s) {
  nuovo_livello("neve");
}

function racconta(s) {
  PP.scenes.start("storia");
}

function evidenzia(s) {
  bottone.visibility.alpha = 0.7;
}

function normale(s) {
  bottone.visibility.alpha = 1;
}

function evidenzia_storia(s) {
  bottone_storia.visibility.alpha = 0.7;
}

function normale_storia(s) {
  bottone_storia.visibility.alpha = 1;
}

function update(s) {
  colline.tile_geometry.x += VEL_MENU / 2;
  terreno.tile_geometry.x += VEL_MENU;
  neve.tile_geometry.y -= VEL_NEVE;
}

function destroy(s) {}

PP.scenes.add("menu", preload, create, update, destroy);
