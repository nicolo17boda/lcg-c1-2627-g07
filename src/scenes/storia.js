import { LARGHEZZA, FONT } from "../config.js";
import { nuovo_livello } from "../partita.js";

const BIANCO = "0xFFFFFF";
const TASTO_SPAZIO = PP.key_codes.SPACE;
const TASTO_INVIO = PP.key_codes.ENTER;
const TESTI = [
  "Per tutta l'estate Astro raccoglie kiwi nel bosco.",
  "I polli, invece, passano l'estate a ballare.",
  "Arriva l'inverno. Astro ha i suoi kiwi, i polli no.",
  "I polli guardano i kiwi di Astro. Che invidia!",
  "Così li rubano tutti e scappano nel bosco.",
  "Astro parte all'inseguimento: rivuole i suoi kiwi!",
];

let img_vignette;

let vignette;
let testo;

let numero;

function preload(s) {
  img_vignette = [];
  for (let i = 0; i < TESTI.length; i++) {
    let img = PP.assets.image.load(s,
      "assets/images/vignetta_" + i + ".png");
    img_vignette.push(img);
  }
}

function create(s) {
  numero = 0;
  vignette = [];
  crea_vignette(s);
  crea_testi(s);
  mostra_vignetta();
}

function crea_vignette(s) {
  for (let i = 0; i < img_vignette.length; i++) {
    let v = PP.assets.image.add(s, img_vignette[i],
      LARGHEZZA / 2, 300, 0.5, 0.5);
    v.visibility.hidden = true;
    vignette.push(v);
  }
}

function crea_testi(s) {
  testo = PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, 625, "",
    20, FONT, "normal", BIANCO, null, 0.5, 0.5);
  PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, 685, "SPAZIO PER CONTINUARE",
    12, FONT, "normal", BIANCO, null, 0.5, 0.5);
}

function mostra_vignetta() {
  vignette[numero].visibility.hidden = false;
  PP.shapes.text_change(testo, TESTI[numero]);
}

function update(s) {
  if (PP.interactive.kb.is_key_just_down(s, TASTO_SPAZIO)) {
    avanti(s);
  } else if (PP.interactive.kb.is_key_just_down(s, TASTO_INVIO)) {
    avanti(s);
  }
}

function avanti(s) {
  if (numero >= TESTI.length) {
    return;
  }
  vignette[numero].visibility.hidden = true;
  numero += 1;
  if (numero < TESTI.length) {
    mostra_vignetta();
  } else {
    nuovo_livello("neve");
  }
}

function destroy(s) {}

PP.scenes.add("storia", preload, create, update, destroy);
