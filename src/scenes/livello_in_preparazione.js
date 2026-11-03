import { LARGHEZZA, ALTEZZA, font as FONT } from "../config.js";
import { livello_sbloccato } from "../progressi.js";

export function crea_livello_in_preparazione(s, numero) {
  // Controllo anche nella scena, per impedire accessi fuori dalla mappa.
  if (!livello_sbloccato(numero)) {
    PP.scenes.start("mappa");
    return;
  }
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x202936", 1);
  PP.shapes.text_styled_add(s, LARGHEZZA / 2, 250,
    "Livello " + numero + " — in preparazione", 40,
    FONT, "normal", "0xFFFFFF", null, 0.5, 0.5);
  const bottone = PP.shapes.text_styled_add(s, LARGHEZZA / 2, 400,
    " Torna alla mappa ", 30, FONT, "normal", "0xFFFFFF", "0x344252", 0.5, 0.5);
  PP.interactive.mouse.add(bottone, "pointerdown", () => PP.scenes.start("mappa"));
}
