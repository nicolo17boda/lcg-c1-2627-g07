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

// Mantiene il rapporto del font entro lo spazio utile, senza deformare le lettere.
export function adatta_testo(etichetta, larghezza, altezza) {
  const scala = Math.min(1, larghezza / etichetta.geometry.display_width,
    altezza / etichetta.geometry.display_height);
  etichetta.geometry.scale_x *= scala;
  etichetta.geometry.scale_y *= scala;
  return etichetta;
}

// mappa.png ha margini trasparenti asimmetrici: misura il disegno, non il file.
export function icona_mappa(s, immagine, x, y, altezza) {
  const icona = PP.assets.image.add(s, immagine, x, y, 1082 / 2505, 1221.5 / 2505);
  icona.geometry.scale_x = altezza / 465;
  icona.geometry.scale_y = altezza / 465;
  return icona;
}
