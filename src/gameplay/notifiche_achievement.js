import { LARGHEZZA } from "../config.js";
import { prossima_notifica_achievement } from "../achievement.js";
import { testo, fissa } from "./grafica.js";
import { COLORI } from "./config.js";

export function crea_notifiche_achievement(s) {
  const DURATA = 4000;
  let elementi = [];
  let restante = 0;

  function chiudi() {
    for (const elemento of elementi) PP.shapes.destroy(elemento);
    elementi = [];
  }

  return {
    aggiorna(delta) {
      if (elementi.length) {
        restante -= delta;
        if (restante > 0) return;
        chiudi();
      }
      const achievement = prossima_notifica_achievement();
      if (!achievement) return;
      restante = DURATA;
      const x = LARGHEZZA / 2;
      elementi = [
        PP.shapes.rectangle_add(s, x, 206, 456, 112, COLORI.sfondo, 0.98),
        PP.shapes.rectangle_add(s, x - 226, 206, 4, 112, COLORI.moneta, 1),
        testo(s, x, 171, "Achievement sbloccato!", 20),
        testo(s, x, 205, achievement.nome, 30),
        testo(s, x, 239, achievement.descrizione, 20),
      ];
      for (const elemento of elementi) fissa(elemento);
    },
    distruggi: chiudi,
  };
}
