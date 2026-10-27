import { LARGHEZZA, ALTEZZA, FONT } from "../config.js";
const NERO = "0x000000";
const BIANCO = "0xFFFFFF";
const TASTO_PAUSA = PP.key_codes.P;

function preload(s) {}

function create(s) {
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, NERO, 0.5);
  PP.shapes.text_styled_add(s,
    LARGHEZZA / 2, ALTEZZA / 2, "PAUSA",
    48, FONT, "normal", BIANCO, null, 0.5, 0.5);
}

function update(s) {
  if (PP.interactive.kb.is_key_just_down(s, TASTO_PAUSA)) {
    PP.scenes.stop_overlay();
  }
}

function destroy(s) {}

PP.scenes.add("pausa", preload, create, update, destroy);
