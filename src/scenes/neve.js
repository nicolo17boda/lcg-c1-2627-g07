import { LARGHEZZA, ALTEZZA } from "../config.js";
import { carica_astro, crea_astro, muovi_astro, scivola }
  from "../astro.js";
import { Y_TERRENO, carica_livello, crea_layer,
  crea_terreno, crea_attrito, crea_cassoni,
  crea_piattaforme, crea_kiwi, crea_trofeo, crea_bandiere,
  crea_camera, muovi_piattaforme } from "../livello.js";
import { carica_nemici, crea_polli, crea_trappole,
  crea_esplosione } from "../nemici.js";
import { partita_finita, carica_partita, crea_partita,
  aggiorna_partita, nuovo_livello } from "../partita.js";

const X_TERRENO = [0, 1900, 3400, 3550, 3700, 3850, 4150,
  4300, 4450, 4600, 5100, 5200, 5300, 5400, 5500];
const L_TERRENO = [1700, 1100, 150, 150, 150, 150, 150,
  150, 150, 500, 100, 100, 100, 100, 260];
const ALZATE = [0, 0, 0, 100, 200, 300, 300,
  200, 100, 0, 100, 200, 300, 400, 0];
const X_CASSONI = [900, 1400, 2300, 2800];
const X_POLLI = [1150, 2550];
const X_KIWI = [400, 460, 520, 1090, 1150, 1210,
  2490, 2550, 2610, 4790, 4850, 4910];
const X_PIATTAFORME = [3200];
const Y_PIATTAFORME = [520];
const A_ABETE = 141;
const X_ABETI = [250, 1600, 2950, 5000];
const X_BANDIERE = [2000, 4650];
const X_TRAPPOLE = [500, 4750];

const VEL_NEVE = 2;

let img_montagne;
let img_colline;
let img_terreno;
let img_neve;
let img_abete;

let neve;
let layer_neve;

function preload(s) {
  carica_astro(s);
  carica_livello(s);
  carica_nemici(s);
  carica_partita(s);
  img_montagne = PP.assets.image.load(s,
    "assets/images/montagne.png");
  img_colline = PP.assets.image.load(s,
    "assets/images/colline.png");
  img_terreno = PP.assets.image.load(s,
    "assets/images/terreno.png");
  img_neve = PP.assets.image.load(s,
    "assets/images/neve.png");
  img_abete = PP.assets.image.load(s,
    "assets/images/abete.png");
}

function create(s) {
  crea_partita(s);
  crea_sfondo(s);
  crea_terreno(s, img_terreno, X_TERRENO, L_TERRENO,
    ALZATE);
  crea_abeti(s);
  crea_astro(s, PP.game_state.get_variable("checkpoint"),
    Y_TERRENO);
  crea_attrito(s, scivola);
  crea_cassoni(s, X_CASSONI);
  crea_piattaforme(s, X_PIATTAFORME, Y_PIATTAFORME);
  crea_polli(s, X_POLLI);
  crea_kiwi(s, X_KIWI);
  crea_trofeo(s, vittoria);
  crea_bandiere(s, X_BANDIERE);
  crea_trappole(s, X_TRAPPOLE);
  crea_neve(s);
  crea_camera(s);
  crea_esplosione(s);
}

function crea_sfondo(s) {
  crea_layer(s, img_montagne);
  crea_layer(s, img_colline);
}

function crea_abeti(s) {
  for (let i = 0; i < X_ABETI.length; i++) {
    PP.assets.image.add(s, img_abete,
      X_ABETI[i], Y_TERRENO - A_ABETE / 2, 0.5, 0.5);
  }
}

function crea_neve(s) {
  neve = PP.assets.tilesprite.add(s, img_neve,
    0, 0, LARGHEZZA, ALTEZZA, 0, 0);
  neve.tile_geometry.scroll_factor_x = 0;
  neve.tile_geometry.scroll_factor_y = 0;
  neve.visibility.alpha = 0.7;
  layer_neve = PP.layers.create(s);
  PP.layers.set_z_index(layer_neve, 1);
  PP.layers.add_to_layer(layer_neve, neve);
}

function update(s) {
  if (partita_finita) {
    return;
  }
  muovi_astro(s);
  aggiorna_partita(s);
  muovi_piattaforme();
  muovi_neve(s);
}

function muovi_neve(s) {
  neve.tile_geometry.x = PP.camera.get_scroll_x(s);
  neve.tile_geometry.y -= VEL_NEVE;
}

function vittoria(s, a, b) {
  nuovo_livello("bosco");
}

function destroy(s) {}

PP.scenes.add("neve", preload, create, update, destroy);
