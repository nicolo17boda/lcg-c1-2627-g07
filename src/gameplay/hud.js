import { LARGHEZZA, ALTEZZA } from "../config.js";
import { COLORI, VITE_MAX } from "./config.js";
import { testo, fissa, adatta_testo } from "./grafica.js";

// Una profondità esplicita mantiene l’HUD sopra gli oggetti creati anche in seguito.
function fissa_hud(elemento, profondita = 100) {
  fissa(elemento);
  elemento.ph_obj.setDepth(profondita);
}

function crea_indicatore_ricarica(s, x, y, icona) {
  const fondo = PP.shapes.arc_add(s, x, y, 19, 0, 360, false, COLORI.terreno, 0.45);
  const angolo_iniziale = -Math.PI / 2;
  const punti_sfondo = [];
  const punti = Array.from({ length: 12 }, (_, indice) => {
    const angolo = angolo_iniziale + indice / 12 * Math.PI * 2;
    const punto_sfondo = PP.shapes.arc_add(s,
      x + Math.cos(angolo) * 24, y + Math.sin(angolo) * 24,
      2, 0, 360, false, COLORI.terreno, 0.55);
    const punto = PP.shapes.arc_add(s,
      x + Math.cos(angolo) * 24, y + Math.sin(angolo) * 24,
      2, 0, 360, false, COLORI.meg, 1);
    punti_sfondo.push(punto_sfondo);
    return punto;
  });
  const immagine = icona ? PP.assets.image.add(s, icona, x, y, 0.5, 0.5) : null;
  if (immagine) {
    immagine.geometry.scale_x = 0.03;
    immagine.geometry.scale_y = 0.03;
    immagine.geometry.angle = 45;
  }
  // Un simbolo geometrico resta leggibile anche senza un font con le frecce.
  const simbolo = [];
  if (!immagine) {
    for (const offset of [-5, 5]) {
      for (const lato of [-1, 1]) {
        const tratto = PP.shapes.rectangle_add(s, x + lato * 4, y + offset,
          12, 3, COLORI.testo, 1);
        tratto.geometry.angle = lato * 45;
        simbolo.push(tratto);
      }
    }
  }
  const elementi = [fondo, ...punti_sfondo, ...punti, ...simbolo,
    ...(immagine ? [immagine] : [])];
  for (const elemento of elementi) fissa_hud(elemento);
  let precedente;

  return {
    elementi,
    aggiorna(frazione) {
      const valore = Math.max(0, Math.min(1, frazione));
      if (valore === precedente) return;
      precedente = valore;
      punti.forEach((punto, indice) => {
        punto.visibility.alpha = 0.2 + 0.8 * Math.max(0, Math.min(1, valore * punti.length - indice));
      });
    },
  };
}

export function crea_hud(s, { immagini }) {
  const { cuore: immagine_cuore, moneta: immagine_moneta,
    "padella-24": immagine_padella } = immagini;
  let elementi_hud = [], cuori = [];
  let pannello_istruzioni, istruzioni, testo_monete, monete_visibili;
  let vite_precedenti, istruzioni_visibili;
  let ricarica_salto, ricarica_padella;
  let testo_coordinate, coordinate_precedenti;
  function crea_elementi(s) {
    elementi_hud = [];
    // Risorse, abilità e una riga compatta dedicata alle coordinate.
    const pannello = PP.shapes.rectangle_add(s, 172, 108,
      312, 184, COLORI.sfondo, 0.96);
    const accento = PP.shapes.rectangle_add(s, 18, 108,
      4, 184, COLORI.meg, 1);
    const separatore = PP.shapes.rectangle_add(s, 174, 42,
      1, 26, COLORI.terreno, 0.8);
    const divisore = PP.shapes.rectangle_add(s, 174, 68,
      272, 1, COLORI.terreno, 0.8);
    const titolo = testo(s, LARGHEZZA / 2, 40, "Meg", 22);
    const etichetta_salto = testo(s, 96, 140, "Doppio salto", 13);
    ricarica_salto = crea_indicatore_ricarica(s, 96, 102);
    const etichetta_padella = testo(s, 248, 140, "Lancio padella", 13);
    ricarica_padella = crea_indicatore_ricarica(s, 248, 102, immagine_padella);
    elementi_hud.push(pannello, accento, separatore, divisore, titolo,
      etichetta_salto, etichetta_padella,
      ...ricarica_salto.elementi, ...ricarica_padella.elementi);
    pannello_istruzioni = PP.shapes.rectangle_add(s, 524, 63,
      1000, 94, COLORI.sfondo, 0.96);
    istruzioni = testo(s, 524, 63,
      "← → / A D  Muovi     Spazio / ↑ / W  Doppio salto\nC  Melee padella    V  Lancio padella    R  Ricomincia    Esc  Pausa", 17);
    fissa_hud(pannello_istruzioni);
    fissa_hud(istruzioni);
    cuori = [];
    for (let i = 0; i < VITE_MAX; i++) {
      const cuore = PP.assets.image.add(s, immagine_cuore,
        55 + i * 38, 42, 0.5, 0.5);
      cuore.geometry.scale_x = 0.028;
      cuore.geometry.scale_y = 0.028;
      cuori.push(cuore);
      elementi_hud.push(cuore);
    }
    // Il disegno occupa circa 280 px dei 1001 px del file: a questa scala
    // appare alto circa 28 px, come i cuori. Compensa anche i margini asimmetrici.
    const icona_moneta = PP.assets.image.add(s, immagine_moneta, 209, 42, 448 / 1001, 473.5 / 1001);
    icona_moneta.geometry.scale_x = 0.1;
    icona_moneta.geometry.scale_y = 0.1;
    testo_monete = testo(s, 270, 42, "", 24);
    elementi_hud.push(icona_moneta, testo_monete);
    const divisore_coordinate = PP.shapes.rectangle_add(s, 174, 164,
      272, 1, COLORI.terreno, 0.8);
    testo_coordinate = testo(s, 172, 182, "", 13);
    elementi_hud.push(divisore_coordinate, testo_coordinate);
    for (const elemento of elementi_hud) fissa_hud(elemento);
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
    aggiorna_coordinate(x, y) {
      const coordinate = `X: ${Math.round(x)}   Y: ${Math.round(y)}`;
      if (coordinate === coordinate_precedenti) return;
      coordinate_precedenti = coordinate;
      PP.shapes.text_change(testo_coordinate, coordinate);
    },
    aggiorna({ vite, monete, salto, lancio }) {
      if (monete !== monete_visibili) {
        monete_visibili = monete;
        PP.shapes.text_change(testo_monete, String(monete));
      }
      if (vite !== vite_precedenti) {
        vite_precedenti = vite;
        cuori.forEach((cuore, i) => { cuore.visibility.alpha = i < vite ? 1 : 0.2; });
      }
      ricarica_salto.aggiorna(salto);
      ricarica_padella.aggiorna(lancio);
    },
  };
}

export function crea_game_over(s, ricomincia) {
  const pannello = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    560, 260, COLORI.sfondo, 0.96);
  const titolo = testo(s, LARGHEZZA / 2, ALTEZZA / 2 - 60, "Game Over", 56);
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2 + 55,
    240, 64, COLORI.terreno, 1);
  const etichetta = adatta_testo(
    testo(s, LARGHEZZA / 2, ALTEZZA / 2 + 55, "Ricomincia", 28), 200, 32);
  for (const elemento of [pannello, titolo, bottone, etichetta]) fissa_hud(elemento, 200);
  PP.interactive.mouse.add(bottone, "pointerdown", ricomincia);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}
