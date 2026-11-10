import { VELOCITA, SALTO, COOLDOWN_DOPPIO_SALTO, L_TOPO, A_TOPO,
  COOLDOWN_LANCIO, COOLDOWN_MELEE, DURATA_MELEE, VELOCITA_PADELLA,
  DURATA_LANCIO, COLORI } from "./config.js";

export function crea_abilita_meg(s, { meg, topi, ostacoli, bloccato, danneggia }) {
  let direzione_meg = 1;
  let recupero_melee = 0;
  let recupero_lancio = 0;
  let recupero_salto = 0;
  let doppio_salto_usato = false;
  let colpo_melee = null;
  let padella_lanciata = null;
  function colpisce_melee(topo) {
    if (!colpo_melee || colpo_melee.colpiti.has(topo.id)) return false;
    const x = meg.geometry.x + colpo_melee.direzione * 48;
    return Math.abs(topo.corpo.geometry.x - x) < 32 + L_TOPO / 2
      && Math.abs(topo.corpo.geometry.y - (meg.geometry.y + 10)) < 23 + A_TOPO / 2;
  }

  function attacca_melee(s) {
    if (recupero_melee > 0 || bloccato()) return;
    recupero_melee = COOLDOWN_MELEE;
    const attacco = {
      corpo: PP.shapes.rectangle_add(s, meg.geometry.x + direzione_meg * 48,
        meg.geometry.y + 10, 64, 46, COLORI.checkpoint, 0.8),
      direzione: direzione_meg, colpiti: new Set(), restante: DURATA_MELEE,
    };
    colpo_melee = attacco;
  }

  function termina_lancio() {
    if (!padella_lanciata) return;
    for (const collisione of padella_lanciata.collisioni) {
      PP.physics.remove_collider_or_overlap(s, collisione);
    }
    PP.shapes.destroy(padella_lanciata.corpo);
    padella_lanciata = null;
  }

  function termina_attacchi() {
    if (colpo_melee) PP.shapes.destroy(colpo_melee.corpo);
    colpo_melee = null;
    termina_lancio();
  }

  function lancia_padella(s) {
    if (recupero_lancio > 0 || padella_lanciata || bloccato()) return;
    recupero_lancio = COOLDOWN_LANCIO;
    const corpo = PP.shapes.rectangle_add(s, meg.geometry.x + direzione_meg * 30,
      meg.geometry.y + 10, 30, 24, COLORI.moneta, 1);
    PP.physics.add(s, corpo, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(corpo, false);
    PP.physics.set_velocity_x(corpo, direzione_meg * VELOCITA_PADELLA);
    const lancio = { corpo, colpiti: new Set(), restante: DURATA_LANCIO, collisioni: [] };
    padella_lanciata = lancio;
    // Attraversa i nemici, ma viene fermata da terreno, soffitti e cancelli chiusi.
    for (const blocco of ostacoli()) {
      lancio.collisioni.push(PP.physics.add_collider_f(s, corpo, blocco, () => {
        if (padella_lanciata === lancio) termina_lancio();
      }));
    }
    for (const topo of topi) {
      if (topo.vita <= 0) continue;
      lancio.collisioni.push(PP.physics.add_overlap_f(s, corpo, topo.corpo, () => {
        if (padella_lanciata !== lancio || lancio.colpiti.has(topo.id)
            || bloccato()) return;
        lancio.colpiti.add(topo.id);
        danneggia(topo);
      }));
    }
  }

  function aggiorna_melee(s) {
    if (!colpo_melee) return;
    colpo_melee.corpo.geometry.x = meg.geometry.x + colpo_melee.direzione * 48;
    colpo_melee.corpo.geometry.y = meg.geometry.y + 10;
    for (const topo of topi) {
      if (topo.vita <= 0 || !colpisce_melee(topo)) continue;
      colpo_melee.colpiti.add(topo.id);
      danneggia(topo);
    }
  }

  function colpisci_melee(topo) {
    if (bloccato() || !colpisce_melee(topo)) return false;
    colpo_melee.colpiti.add(topo.id);
    danneggia(topo);
    return true;
  }

  function salta(premuto) {
    const a_terra = PP.physics.is_on_ground(meg);
    if (a_terra) doppio_salto_usato = false;
    if (!premuto) return;
    if (a_terra) PP.physics.set_velocity_y(meg, -SALTO);
    else if (!doppio_salto_usato && recupero_salto === 0) {
      doppio_salto_usato = true;
      recupero_salto = COOLDOWN_DOPPIO_SALTO;
      PP.physics.set_velocity_y(meg, -SALTO);
    }
  }

  return {
    termina: termina_attacchi,
    colpisci_melee,
    get frazione_salto() { return 1 - recupero_salto / COOLDOWN_DOPPIO_SALTO; },
    get frazione_lancio() { return 1 - recupero_lancio / COOLDOWN_LANCIO; },
    aggiorna(delta, comandi) {
      if (bloccato()) return;
      recupero_melee = Math.max(0, recupero_melee - delta);
      recupero_lancio = Math.max(0, recupero_lancio - delta);
      recupero_salto = Math.max(0, recupero_salto - delta);
      if (colpo_melee && (colpo_melee.restante -= delta) <= 0) {
        PP.shapes.destroy(colpo_melee.corpo);
        colpo_melee = null;
      }
      if (padella_lanciata && (padella_lanciata.restante -= delta) <= 0) termina_lancio();
      const { sinistra, destra, salto, melee, lancio } = comandi;
      PP.physics.set_velocity_x(meg, (Number(destra) - Number(sinistra)) * VELOCITA);
      if (sinistra !== destra) direzione_meg = destra ? 1 : -1;
      if (melee) attacca_melee(s);
      if (lancio) lancia_padella(s);
      aggiorna_melee(s);
      salta(salto);
    },
  };
}
