import { carica_astro, crea_astro, muovi_astro, frena }
  from "../astro.js";
import { Y_TERRENO, carica_livello, crea_layer,
  crea_terreno, crea_attrito, crea_cassoni,
  crea_piattaforme, crea_kiwi, crea_trofeo, crea_bandiere,
  crea_camera, muovi_piattaforme } from "../livello.js";
import { carica_nemici, crea_polli, crea_trappole,
  crea_esplosione } from "../nemici.js";
import { partita_finita, carica_partita, crea_partita,
  aggiorna_partita, termina } from "../partita.js";

const X_TERRENO = [0, 1150, 1900, 3000, 3700, 4300, 4450,
  4800, 4950, 5100];
const L_TERRENO = [900, 400, 700, 300, 600, 150, 150,
  150, 150, 660];
const ALZATE = [0, 100, 0, 200, 0, 100, 200, 200, 100, 0];
const X_CASSONI = [2150, 2500, 3900, 4250];
const X_POLLI = [2325, 4075];
const X_KIWI = [400, 460, 520, 2265, 2325, 2385,
  4015, 4075, 4135, 5300, 5360, 5420];
const X_PIATTAFORME = [1725, 2800, 3500];
const Y_PIATTAFORME = [450, 500, 380];
const X_BANDIERE = [1950, 3750];
const X_TRAPPOLE = [250, 3800];

let img_bosco;
let img_erba;

function preload(s) {
  carica_astro(s);
  carica_livello(s);
  carica_nemici(s);
  carica_partita(s);
  img_bosco = PP.assets.image.load(s,
    "assets/images/bosco.png");
  img_erba = PP.assets.image.load(s,
    "assets/images/erba.png");
}

function create(s) {
  crea_partita(s);
  crea_layer(s, img_bosco);
  crea_terreno(s, img_erba, X_TERRENO, L_TERRENO,
    ALZATE);
  crea_astro(s, PP.game_state.get_variable("checkpoint"),
    Y_TERRENO);
  crea_attrito(s, frena);
  crea_cassoni(s, X_CASSONI);
  crea_piattaforme(s, X_PIATTAFORME, Y_PIATTAFORME);
  crea_polli(s, X_POLLI);
  crea_kiwi(s, X_KIWI);
  crea_trofeo(s, vittoria);
  crea_bandiere(s, X_BANDIERE);
  crea_trappole(s, X_TRAPPOLE);
  crea_camera(s);
  crea_esplosione(s);
}

function update(s) {
  if (partita_finita) {
    return;
  }
  muovi_astro(s);
  aggiorna_partita(s);
  muovi_piattaforme();
}

function vittoria(s, a, b) {
  termina("LIVELLO COMPLETATO");
}

function destroy(s) {}

PP.scenes.add("bosco", preload, create, update, destroy);
