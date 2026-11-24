import { LARGHEZZA, ALTEZZA, font as FONT } from "../config.js";
import {
  acquista_padella_argentata, COSTO_PADELLA_ARGENTATA,
  monete_totali, padella_argentata_acquistata,
} from "../progressi.js?v=padella-argentata-1";
import {
  BONUS_DANNO_PADELLA_ARGENTATA, BONUS_VELOCITA_RIENTRO_PADELLA_ARGENTATA,
} from "../gameplay/config.js?v=padella-argentata-1";

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

function crea_bancarelle(s, messaggio = "") {
  s.children.removeAll(true);
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x292438", 1);
  testo(s, 120, "Mercato", 52);
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, 350,
    680, 330, "0x66518A", 1);
  testo(s, 245, "Padella argentata", 36);
  const bonus_danno = Math.round(BONUS_DANNO_PADELLA_ARGENTATA * 100);
  const bonus_ritorno = Math.round(BONUS_VELOCITA_RIENTRO_PADELLA_ARGENTATA * 100);
  testo(s, 305, `+${bonus_danno}% danni · +${bonus_ritorno}% velocità di ritorno`, 21);
  testo(s, 355, `Monete disponibili: ${monete_totali()}`, 22);
  if (messaggio) testo(s, 400, messaggio, 19);

  const acquistata = padella_argentata_acquistata();
  const etichetta = acquistata
    ? "Acquistata"
    : `Acquista · ${COSTO_PADELLA_ARGENTATA} monete`;
  const bottone_acquisto = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 460,
    340, 64, acquistata ? "0x47574F" : "0x8065A8", 1);
  testo(s, 460, etichetta, 24);
  if (!acquistata) {
    PP.interactive.mouse.add(bottone_acquisto, "pointerdown", () => {
      if (acquista_padella_argentata()) {
        crea_bancarelle(s, "Acquisto completato!");
      } else {
        const messaggio_errore = padella_argentata_acquistata()
          ? "Padella argentata già acquistata."
          : "Monete insufficienti.";
        crea_bancarelle(s, messaggio_errore);
      }
    });
    PP.interactive.mouse.add(bottone_acquisto, "pointerover", () => {
      bottone_acquisto.visibility.alpha = 0.7;
    });
    PP.interactive.mouse.add(bottone_acquisto, "pointerout", () => {
      bottone_acquisto.visibility.alpha = 1;
    });
  }

  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 600,
    300, 64, "0x66518A", 1);
  testo(s, 600, "Torna al livello", 28);
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
