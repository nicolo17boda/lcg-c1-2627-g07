import { L_TOPO, A_TOPO, VITA_TOPO, VELOCITA_TOPO, MARGINE_BUCO_TOPO,
  SPESSORE_BARRIERA_TOPI, DANNO_ATTACCO, COLORI } from "./config.js";
import { rettangolo_fisico } from "./grafica.js";

export function crea_nemici(s, { meg, pattuglie: PATTUGLIE_TOPI, terreni: TERRENI,
  suolo: SUOLO, immagine: immagine_topo, blocchi: blocchi_solidi,
  esclusi = new Set(), bloccato, on_contatto, on_morte }) {
  const topi = [];
  const per_id = new Map();
  function crea_topi(s) {
    for (const [id, [inizio_pattuglia, fine_pattuglia]] of PATTUGLIE_TOPI.entries()) {
      if (esclusi.has(id)) continue;
      const posizione_iniziale = (inizio_pattuglia + fine_pattuglia) / 2;
      const terreno = TERRENI.find(([inizio, larghezza]) =>
        posizione_iniziale >= inizio && posizione_iniziale <= inizio + larghezza);
      if (!terreno) throw new Error("Pattuglia topo senza terreno sottostante.");
      const minimo = Math.max(inizio_pattuglia,
        terreno[0] + L_TOPO / 2 + MARGINE_BUCO_TOPO);
      const massimo = Math.min(fine_pattuglia,
        terreno[0] + terreno[1] - L_TOPO / 2 - MARGINE_BUCO_TOPO);
      const corpo = PP.shapes.rectangle_add(s, posizione_iniziale,
        SUOLO - A_TOPO / 2, L_TOPO, A_TOPO, "0xBB8A78", 1);
      const skin = PP.assets.image.add(s, immagine_topo,
        corpo.geometry.x, corpo.geometry.y - A_TOPO / 2, 0.5, 0.5);
      skin.geometry.scale_x = L_TOPO / 1001;
      skin.geometry.scale_y = L_TOPO / 1001;
      corpo.visibility.alpha = 0;
      PP.physics.add(s, corpo, PP.physics.type.DYNAMIC);
      PP.physics.set_collision_rectangle(corpo, L_TOPO, A_TOPO, 0, 0);
      for (const blocco of blocchi_solidi) PP.physics.add_collider(s, corpo, blocco);
      const topo = {
        id, corpo, skin, minimo, massimo, direzione: 1, vita: VITA_TOPO, immune: false,
        fondo_barra: PP.shapes.rectangle_add(s, 0, 0, 48, 8, "0x392C35", 1),
        barra: PP.shapes.rectangle_add(s, 0, 0, 44, 4, "0x85DB9B", 1),
      };
      // Barriere dedicate ai topi: Meg e le monete possono attraversarle.
      for (const [x, direzione] of [
        [minimo - L_TOPO / 2 - SPESSORE_BARRIERA_TOPI, 1],
        [massimo + L_TOPO / 2, -1],
      ]) {
        const barriera = rettangolo_fisico(s, x, SUOLO - A_TOPO * 3,
          SPESSORE_BARRIERA_TOPI, A_TOPO * 3, COLORI.terreno);
        barriera.visibility.alpha = 0;
        PP.physics.add_collider_f(s, corpo, barriera, () => {
          topo.direzione = direzione;
          topo.skin.geometry.flip_x = direzione > 0;
        });
      }
      topi.push(topo);
      per_id.set(id, topo);
      aggiorna_barra_topo(topo);
      PP.physics.set_velocity_x(corpo, VELOCITA_TOPO);
      PP.physics.add_overlap_f(s, meg, corpo, () => on_contatto(topo));
    }
  }

  function aggiorna_barra_topo(topo) {
    const frazione = topo.vita / VITA_TOPO;
    const x = topo.corpo.geometry.x;
    const y = topo.corpo.geometry.y - A_TOPO / 2 - 12;
    topo.fondo_barra.geometry.x = x;
    topo.fondo_barra.geometry.y = y;
    topo.barra.geometry.scale_x = frazione;
    // La salute si svuota da destra mantenendo fisso il margine sinistro.
    topo.barra.geometry.x = x - 22 + 22 * frazione;
    topo.barra.geometry.y = y;
  }

  function aggiorna_topi() {
    for (const topo of topi) {
      if (topo.vita <= 0) continue;
      const x = topo.corpo.geometry.x;
      let cambia_direzione = false;
      if (topo.direzione > 0 && x >= topo.massimo) {
        topo.direzione = -1;
        cambia_direzione = true;
      } else if (topo.direzione < 0 && x <= topo.minimo) {
        topo.direzione = 1;
        cambia_direzione = true;
      }
      if (cambia_direzione) topo.skin.geometry.flip_x = topo.direzione > 0;
      PP.physics.set_velocity_x(topo.corpo,
        bloccato() ? 0 : topo.direzione * VELOCITA_TOPO);
      topo.skin.geometry.x = topo.corpo.geometry.x;
      topo.skin.geometry.y = topo.corpo.geometry.y - A_TOPO / 2;
      aggiorna_barra_topo(topo);
    }
  }

  function danneggia_topo(s, topo) {
    if (bloccato() || topo.vita <= 0 || topo.immune) return;
    topo.vita = Math.max(0, topo.vita - DANNO_ATTACCO);
    if (topo.vita === 0) {
      on_morte(topo);
      PP.shapes.destroy(topo.corpo);
      PP.shapes.destroy(topo.skin);
      PP.shapes.destroy(topo.barra);
      PP.shapes.destroy(topo.fondo_barra);
      return;
    }
    aggiorna_barra_topo(topo);
    topo.immune = true;
    topo.skin.visibility.alpha = 0.5;
    // Evita danni multipli durante la stessa sovrapposizione.
    PP.timers.add_timer(s, 250, () => {
      if (topo.vita <= 0) return;
      topo.immune = false;
      topo.skin.visibility.alpha = 1;
    }, false);
  }

  crea_topi(s);
  return { elenco: topi, per_id, aggiorna: aggiorna_topi,
    danneggia: topo => danneggia_topo(s, topo) };
}
