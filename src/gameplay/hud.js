import { LARGHEZZA, ALTEZZA } from "../config.js";
import { COLORI, VITE_MAX } from "./config.js";
import { testo, fissa, crea_barra } from "./grafica.js";

export function crea_hud(s, { numero, immagini, torna_mappa }) {
  const { cuore: immagine_cuore, moneta: immagine_moneta, mappa: immagine_mappa } = immagini;
  let elementi_hud = [], cuori = [];
  let pannello_istruzioni, istruzioni, testo_monete, monete_visibili;
  let vite_precedenti, istruzioni_visibili;
  let barra_salto, barra_padella;
  function crea_elementi(s) {
    elementi_hud = [];
    const pannello = PP.shapes.rectangle_add(s, 188, 88,
      328, 144, COLORI.sfondo, 0.94);
    const accento = PP.shapes.rectangle_add(s, 26, 88,
      4, 144, COLORI.meg, 1);
    const separatore = PP.shapes.rectangle_add(s, 192, 42,
      2, 30, COLORI.terreno, 0.6);
    const titolo = testo(s, LARGHEZZA / 2, 38, "Meg · Livello " + numero, 26);
    const etichetta_salto = testo(s, 188, 76, "Doppio salto", 18);
    barra_salto = crea_barra(s, 48, 100, 280);
    const etichetta_padella = testo(s, 188, 120, "Lancio padella", 18);
    barra_padella = crea_barra(s, 48, 144, 280);
    elementi_hud.push(pannello, accento, separatore, titolo,
      etichetta_salto, etichetta_padella, ...barra_salto.elementi, ...barra_padella.elementi);
    pannello_istruzioni = PP.shapes.rectangle_add(s, 524, 63,
      1000, 94, COLORI.sfondo, 0.94);
    istruzioni = testo(s, 524, 63,
      "← → / A D  Muovi     Spazio / ↑ / W  Doppio salto\nJ  Padella    K  Lancio    R  Ricomincia    M  Mappa", 23);
    fissa(pannello_istruzioni);
    fissa(istruzioni);
    cuori = [];
    for (let i = 0; i < VITE_MAX; i++) {
      const cuore = PP.assets.image.add(s, immagine_cuore,
        64 + i * 44, 42, 0.5, 0.5);
      cuore.geometry.scale_x = 0.032;
      cuore.geometry.scale_y = 0.032;
      cuori.push(cuore);
      elementi_hud.push(cuore);
    }
    // Il disegno occupa circa 280 px dei 1001 px del file: a questa scala
    // appare alto circa 31 px, come i cuori. Compensa anche i margini asimmetrici.
    const icona_moneta = PP.assets.image.add(s, immagine_moneta, 238, 45, 0.5, 0.5);
    icona_moneta.geometry.scale_x = 0.112;
    icona_moneta.geometry.scale_y = 0.112;
    testo_monete = testo(s, 290, 42, "", 30);
    elementi_hud.push(icona_moneta, testo_monete);
    for (const elemento of elementi_hud) fissa(elemento);
    const bottone = PP.shapes.rectangle_add(s, LARGHEZZA - 105, 45,
      170, 52, COLORI.terreno, 1);
    fissa(bottone);
    const icona_mappa = PP.assets.image.add(s, immagine_mappa,
      1135, 45, 0.5, 0.5);
    icona_mappa.geometry.scale_x = 0.09;
    icona_mappa.geometry.scale_y = 0.09;
    fissa(icona_mappa);
    fissa(testo(s, 1195, 45, "Mappa [M]", 21));
    PP.interactive.mouse.add(bottone, "pointerdown", torna_mappa);
    PP.interactive.mouse.add(bottone, "pointerover", () => {
      bottone.visibility.alpha = 0.7;
    });
    PP.interactive.mouse.add(bottone, "pointerout", () => {
      bottone.visibility.alpha = 1;
    });
  }

  function mostra_istruzioni(visibili) {
    if (istruzioni_visibili === visibili) return;
    istruzioni_visibili = visibili;
    istruzioni.visibility.hidden = !istruzioni_visibili;
    pannello_istruzioni.visibility.hidden = !istruzioni_visibili;
    for (const elemento of elementi_hud) {
      elemento.visibility.hidden = istruzioni_visibili;
    }
  }

  crea_elementi(s);
  return {
    mostra_istruzioni,
    aggiorna({ vite, monete, salto, lancio }) {
      if (monete !== monete_visibili) {
        monete_visibili = monete;
        PP.shapes.text_change(testo_monete, String(monete));
      }
      if (vite !== vite_precedenti) {
        vite_precedenti = vite;
        cuori.forEach((cuore, i) => { cuore.visibility.alpha = i < vite ? 1 : 0.2; });
      }
      barra_salto.aggiorna(salto);
      barra_padella.aggiorna(lancio);
    },
  };
}

export function crea_game_over(s, ricomincia) {
  const pannello = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    560, 260, COLORI.sfondo, 0.96);
  const titolo = testo(s, LARGHEZZA / 2, ALTEZZA / 2 - 60, "Game Over", 56);
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2 + 55,
    240, 64, COLORI.terreno, 1);
  const etichetta = testo(s, LARGHEZZA / 2, ALTEZZA / 2 + 55, "Ricomincia", 32);
  for (const elemento of [pannello, titolo, bottone, etichetta]) fissa(elemento);
  PP.interactive.mouse.add(bottone, "pointerdown", ricomincia);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}
