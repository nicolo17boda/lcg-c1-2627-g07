import { LARGHEZZA, ALTEZZA, font as FONT } from "../config.js";

let ritorno;
let uscita;

function preload(s) {}

function create(s) {
  ritorno = PP.game_state.get_variable("ritorno_mercato") || "mappa";
  PP.game_state.set_variable("ritorno_mercato", null);
  uscita = false;
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x292438", 1);
  testo(s, 160, "Mercato", 52);
  testo(s, 250, "Le bancarelle apriranno prossimamente.", 28);
  // Bancarelle provvisorie composte soltanto da blocchi.
  for (const x of [360, 640, 920]) {
    PP.shapes.rectangle_add(s, x, 410, 190, 100, "0x66518A", 1);
    PP.shapes.rectangle_add(s, x, 350, 220, 24, "0xB59AE8", 1);
  }
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 570,
    300, 64, "0x66518A", 1);
  testo(s, 570, ritorno === "livello1" ? "Torna al livello" : "Torna alla mappa", 28);
  PP.interactive.mouse.add(bottone, "pointerdown", esci);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}

function testo(s, y, contenuto, dimensione) {
  PP.shapes.text_styled_add(s, LARGHEZZA / 2, y, contenuto,
    dimensione, FONT, "normal", "0xFFFFFF", null, 0.5, 0.5);
}

function esci() {
  if (uscita) return;
  uscita = true;
  PP.scenes.start(ritorno);
}

function update(s) {
  if (PP.interactive.kb.is_key_just_down(s, PP.key_codes.ESC)) esci();
}

function destroy(s) {}

PP.scenes.add("mercato", preload, create, update, destroy);
