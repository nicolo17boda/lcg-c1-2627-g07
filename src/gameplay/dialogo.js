import { LARGHEZZA } from "../config.js";
import { COLORI } from "./config.js";
import { testo, fissa } from "./grafica.js";

export function crea_dialogo(s, { battute: BATTUTE, on_apri, on_chiudi }) {
  let dialogo_attivo = false;
  let indice_battuta = 0;
  let spazio_rilasciato = false;
  let pannello_dialogo = [];
  let nome_dialogo, testo_dialogo, invito_dialogo;
  function crea_pannello(s) {
    const pannello = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 230,
      1060, 220, COLORI.sfondo, 0.98);
    nome_dialogo = testo(s, LARGHEZZA / 2, 157, "", 30);
    testo_dialogo = testo(s, LARGHEZZA / 2, 225, "", 26);
    invito_dialogo = testo(s, LARGHEZZA / 2, 300, "", 22);
    pannello_dialogo = [pannello, nome_dialogo, testo_dialogo, invito_dialogo];
    for (const elemento of pannello_dialogo) {
      fissa(elemento);
      elemento.visibility.hidden = true;
    }
  }

  function mostra_battuta() {
    const [nome, battuta] = BATTUTE[indice_battuta];
    PP.shapes.text_change(nome_dialogo, nome);
    PP.shapes.text_change(testo_dialogo, battuta);
    PP.shapes.text_change(invito_dialogo,
      "Spazio: " + (indice_battuta === BATTUTE.length - 1 ? "chiudi" : "continua")
      + "   ·   " + (indice_battuta + 1) + "/" + BATTUTE.length);
  }

  function aggiorna_dialogo(s) {
    // Occorre rilasciare Spazio: il salto di ingresso non salta una battuta.
    if (PP.interactive.kb.is_key_up(s, PP.key_codes.SPACE)) spazio_rilasciato = true;
    if (!spazio_rilasciato ||
        !PP.interactive.kb.is_key_just_down(s, PP.key_codes.SPACE)) return;
    spazio_rilasciato = false;
    indice_battuta += 1;
    if (indice_battuta < BATTUTE.length) {
      mostra_battuta();
    } else {
      dialogo_attivo = false;
      for (const elemento of pannello_dialogo) elemento.visibility.hidden = true;
      on_chiudi();
    }
  }

  crea_pannello(s);
  return {
    get attivo() { return dialogo_attivo; },
    apri() {
      if (dialogo_attivo || !BATTUTE.length) return;
      dialogo_attivo = true;
      indice_battuta = 0;
      spazio_rilasciato = false;
      on_apri();
      for (const elemento of pannello_dialogo) elemento.visibility.hidden = false;
      mostra_battuta();
    },
    aggiorna() { if (dialogo_attivo) aggiorna_dialogo(s); },
  };
}
