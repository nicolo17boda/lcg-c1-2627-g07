import { LARGHEZZA, ALTEZZA, font as FONT } from "../config.js";

let esc_rilasciato;
let uscita;

function preload(s) {}

function create(s) {
  uscita = false;
  esc_rilasciato = false;
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x000000", 0.65);
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    660, 280, "0x292438", 1);
  testo(s, 290, "Vuoi entrare al mercato?", 32);
  for (const [x, etichetta, azione] of [
    [LARGHEZZA / 2 - 140, "Sì", () => crea_bancarelle(s)],
    [LARGHEZZA / 2 + 140, "No", esci],
  ]) {
    const bottone = PP.shapes.rectangle_add(s, x, 410, 220, 64, "0x66518A", 1);
    PP.shapes.text_styled_add(s, x, 410, etichetta, 30,
      FONT, "normal", "0xFFFFFF", null, 0.5, 0.5);
    PP.interactive.mouse.add(bottone, "pointerdown", azione);
    PP.interactive.mouse.add(bottone, "pointerover", () => { bottone.visibility.alpha = 0.7; });
    PP.interactive.mouse.add(bottone, "pointerout", () => { bottone.visibility.alpha = 1; });
  }
}

function crea_bancarelle(s) {
  s.children.removeAll(true);
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
  testo(s, 570, "Torna al livello", 28);
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
  PP.scenes.stop_overlay();
}

function update(s) {
  if (!PP.interactive.kb.is_key_down(s, PP.key_codes.ESC)) esc_rilasciato = true;
  if (esc_rilasciato && PP.interactive.kb.is_key_just_down(s, PP.key_codes.ESC)) esci();
}

function destroy(s) {}

PP.scenes.add("mercato", preload, create, update, destroy);
