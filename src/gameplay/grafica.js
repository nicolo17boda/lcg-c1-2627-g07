import { font as FONT } from "../config.js";
import { COLORI } from "./config.js";

export function rettangolo_fisico(s, x, y, larghezza, altezza, colore) {
  const blocco = PP.shapes.rectangle_add(s,
    x + larghezza / 2, y + altezza / 2, larghezza, altezza, colore, 1);
  PP.physics.add(s, blocco, PP.physics.type.STATIC);
  return blocco;
}
export function fissa(oggetto) {
  oggetto.tile_geometry.scroll_factor_x = 0;
  oggetto.tile_geometry.scroll_factor_y = 0;
}
export function testo(s, x, y, contenuto, dimensione) {
  return PP.shapes.text_styled_add(s, x, y, contenuto,
    dimensione, FONT, "normal", COLORI.testo, null, 0.5, 0.5);
}

export function crea_barra(s, x, y, larghezza, colore = COLORI.meg) {
  const fondo = PP.shapes.rectangle_add(s, x + larghezza / 2, y,
    larghezza + 4, 12, COLORI.terreno, 1);
  const corpo = PP.shapes.rectangle_add(s, x + larghezza / 2, y,
    larghezza, 8, colore, 1);
  let precedente;
  return {
    elementi: [fondo, corpo],
    aggiorna(frazione) {
      const valore = Math.max(0, Math.min(1, frazione));
      if (valore === precedente) return;
      precedente = valore;
      corpo.geometry.scale_x = valore;
      corpo.geometry.x = x + larghezza / 2 * valore;
    },
  };
}
