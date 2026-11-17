import { LARGHEZZA, ALTEZZA } from "../config.js";
import { COLORI } from "../gameplay/config.js";
import { testo, adatta_testo } from "../gameplay/grafica.js";

let esci_al_menu;
let chiusa = false;
let esc_rilasciato = false;

export function apri_pausa(esci) {
  if (PP.scenes.in_overlay_mode) return;
  esci_al_menu = esci;
  PP.scenes.start_overlay("pausa");
}

function chiudi(esci = false) {
  if (chiusa) return;
  chiusa = true;
  const azione = esci_al_menu;
  esci_al_menu = null;
  PP.scenes.stop_overlay();
  if (esci) azione();
}

function create(s) {
  chiusa = false;
  esc_rilasciato = false;
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x000000", 0.65);
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    460, 360, COLORI.sfondo, 1);
  testo(s, LARGHEZZA / 2, 250, "Pausa", 52);
  for (const [y, etichetta, esci] of [[355, "Riprendi", false], [455, "Esci", true]]) {
    const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, y,
      280, 70, COLORI.terreno, 1);
    adatta_testo(testo(s, LARGHEZZA / 2, y, etichetta, 30), 240, 40);
    PP.interactive.mouse.add(bottone, "pointerdown", () => chiudi(esci));
    PP.interactive.mouse.add(bottone, "pointerover", () => { bottone.visibility.alpha = 0.7; });
    PP.interactive.mouse.add(bottone, "pointerout", () => { bottone.visibility.alpha = 1; });
  }
}

function update(s) {
  if (!PP.interactive.kb.is_key_down(s, PP.key_codes.ESC)) esc_rilasciato = true;
  if (esc_rilasciato && PP.interactive.kb.is_key_just_down(s, PP.key_codes.ESC)) chiudi();
}

// Registrata dopo il livello affinché il pannello venga disegnato sopra il gioco.
export function registra_pausa() {
  PP.scenes.add("pausa", () => {}, create, update, () => {});
}
