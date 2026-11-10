import { LARGHEZZA, ALTEZZA } from "../config.js";
import { VELOCITA, SALTO, COOLDOWN_DOPPIO_SALTO,
  COOLDOWN_LANCIO, COOLDOWN_MELEE, DURATA_MELEE, VELOCITA_PADELLA,
  DURATA_RIENTRO_PADELLA, COLORI } from "./config.js";

export function crea_abilita_meg(s, { meg, topi, ostacoli, bloccato, danneggia, immagine_padella }) {
  let direzione_meg = 1;
  let recupero_melee = 0;
  let recupero_lancio = 0;
  let recupero_salto = 0;
  let doppio_salto_usato = false;
  let colpo_melee = null;
  let padella_lanciata = null;
  function crea_skin_padella(x, y, lunghezza, direzione) {
    const skin = PP.assets.image.add(s, immagine_padella, x, y, 0.5, 0.5);
    // Il disegno misura circa 990 px in verticale: ruotato, il manico
    // punta verso Meg e la testa della padella verso il bersaglio.
    skin.geometry.scale_x = lunghezza / 990;
    skin.geometry.scale_y = lunghezza / 990;
    skin.geometry.angle = direzione > 0 ? 90 : 270;
    return skin;
  }

  const padella_in_mano = crea_skin_padella(meg.geometry.x + 34, meg.geometry.y + 10, 40, 1);
  let distrutta = false;

  function aggiorna_skin() {
    if (distrutta) return;
    padella_in_mano.visibility.hidden = Boolean(padella_lanciata);
    const direzione = colpo_melee ? colpo_melee.direzione : direzione_meg;
    const lunghezza = colpo_melee ? 64 : 40;
    padella_in_mano.geometry.x = meg.geometry.x + direzione * (colpo_melee ? 48 : 34);
    padella_in_mano.geometry.y = meg.geometry.y + 10;
    padella_in_mano.geometry.scale_x = lunghezza / 990;
    padella_in_mano.geometry.scale_y = lunghezza / 990;
    padella_in_mano.geometry.angle = direzione > 0 ? 90 : 270;
  }

  function colpisce_melee(topo) {
    if (padella_lanciata || !colpo_melee || colpo_melee.colpiti.has(topo.id)) return false;
    const x = meg.geometry.x + colpo_melee.direzione * 48;
    return Math.abs(topo.corpo.geometry.x - x) < 32 + topo.larghezza / 2
      && Math.abs(topo.corpo.geometry.y - (meg.geometry.y + 10)) < 23 + topo.altezza / 2;
  }

  function attacca_melee(s) {
    if (padella_lanciata || recupero_melee > 0 || bloccato()) return;
    recupero_melee = COOLDOWN_MELEE;
    const attacco = {
      corpo: padella_in_mano,
      direzione: direzione_meg, colpiti: new Set(), restante: DURATA_MELEE,
    };
    colpo_melee = attacco;
  }

  function limiti_schermo() {
    const x = PP.camera.get_scroll_x(s);
    const y = PP.camera.get_scroll_y(s);
    return { sinistra: x, destra: x + LARGHEZZA, sopra: y, sotto: y + ALTEZZA };
  }

  function visibile(oggetto) {
    const vista = limiti_schermo();
    const { x, y } = oggetto.geometry;
    return x >= vista.sinistra && x <= vista.destra && y >= vista.sopra && y <= vista.sotto;
  }

  // Dopo l'andata rimane solo lo sprite: il ritorno non ha hitbox né danno.
  function rimuovi_corpo_lancio(lancio) {
    for (const collisione of lancio.collisioni) {
      PP.physics.remove_collider_or_overlap(s, collisione);
    }
    lancio.collisioni = [];
    if (lancio.corpo) PP.shapes.destroy(lancio.corpo);
    lancio.corpo = null;
  }

  function attendi_rientro(lancio) {
    if (padella_lanciata !== lancio || lancio.fase !== "andata") return;
    rimuovi_corpo_lancio(lancio);
    lancio.fase = "attesa";
    lancio.skin.visibility.hidden = true;
  }

  function termina_lancio() {
    if (!padella_lanciata) return;
    rimuovi_corpo_lancio(padella_lanciata);
    PP.shapes.destroy(padella_lanciata.skin);
    padella_lanciata = null;
  }

  function termina_attacchi() {
    colpo_melee = null;
    termina_lancio();
    recupero_lancio = 0;
    aggiorna_skin();
  }

  function aggiorna_lancio(delta) {
    const lancio = padella_lanciata;
    if (!lancio) return;
    if (lancio.fase === "andata") {
      PP.physics.set_velocity_x(lancio.corpo, lancio.direzione * VELOCITA_PADELLA);
      lancio.skin.geometry.x = lancio.corpo.geometry.x;
      lancio.skin.geometry.y = lancio.corpo.geometry.y;
      if (!visibile(lancio.corpo)) attendi_rientro(lancio);
    }
    if (recupero_lancio <= DURATA_RIENTRO_PADELLA && lancio.fase !== "ritorno") {
      attendi_rientro(lancio);
      lancio.fase = "ritorno";
      const vista = limiti_schermo();
      // Rientra dal bordo attuale della camera, anche se Meg si è spostata.
      lancio.skin.geometry.x = lancio.direzione > 0 ? vista.destra + 30 : vista.sinistra - 30;
      lancio.skin.geometry.y = Math.max(vista.sopra + 20,
        Math.min(vista.sotto - 20, meg.geometry.y + 10));
      lancio.skin.visibility.hidden = false;
    }
    if (lancio.fase === "ritorno") {
      const frazione = Math.min(1, delta / (recupero_lancio + delta));
      const mano_x = meg.geometry.x + direzione_meg * 34;
      lancio.skin.geometry.x += (mano_x - lancio.skin.geometry.x) * frazione;
      lancio.skin.geometry.y += (meg.geometry.y + 10 - lancio.skin.geometry.y) * frazione;
    }
    lancio.skin.geometry.angle += lancio.direzione * delta * 0.8;
    if (recupero_lancio === 0) termina_lancio();
  }

  function lancia_padella(s) {
    if (recupero_lancio > 0 || padella_lanciata || bloccato()) return;
    recupero_lancio = COOLDOWN_LANCIO;
    colpo_melee = null;
    const corpo = PP.shapes.rectangle_add(s, meg.geometry.x + direzione_meg * 30,
      meg.geometry.y + 10, 30, 24, COLORI.moneta, 0);
    PP.physics.add(s, corpo, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(corpo, false);
    PP.physics.set_velocity_x(corpo, direzione_meg * VELOCITA_PADELLA);
    const lancio = {
      corpo, skin: crea_skin_padella(corpo.geometry.x, corpo.geometry.y, 30, direzione_meg),
      colpiti: new Set(), fase: "andata", direzione: direzione_meg, collisioni: [],
    };
    padella_lanciata = lancio;
    aggiorna_skin();
    // Attraversa i nemici, ma viene fermata da terreno, soffitti e cancelli chiusi.
    for (const blocco of ostacoli()) {
      lancio.collisioni.push(PP.physics.add_collider_f(s, corpo, blocco, () => {
        if (padella_lanciata === lancio) attendi_rientro(lancio);
      }));
    }
    for (const topo of topi) {
      if (topo.vita <= 0) continue;
      lancio.collisioni.push(PP.physics.add_overlap_f(s, corpo, topo.corpo, () => {
        if (padella_lanciata !== lancio || lancio.fase !== "andata"
            || lancio.colpiti.has(topo.id) || bloccato()) return;
        if (!visibile(lancio.corpo)) { attendi_rientro(lancio); return; }
        if (!visibile(topo.corpo)) return;
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
    aggiorna_skin,
    sospendi() {
      colpo_melee = null;
      if (padella_lanciata?.corpo) PP.physics.set_velocity_x(padella_lanciata.corpo, 0);
      aggiorna_skin();
    },
    distruggi() {
      if (distrutta) return;
      termina_attacchi();
      PP.shapes.destroy(padella_in_mano);
      distrutta = true;
    },
    colpisci_melee,
    get frazione_salto() { return 1 - recupero_salto / COOLDOWN_DOPPIO_SALTO; },
    get frazione_lancio() { return 1 - recupero_lancio / COOLDOWN_LANCIO; },
    aggiorna(delta, comandi) {
      if (bloccato()) return;
      recupero_melee = Math.max(0, recupero_melee - delta);
      recupero_lancio = Math.max(0, recupero_lancio - delta);
      recupero_salto = Math.max(0, recupero_salto - delta);
      if (colpo_melee && (colpo_melee.restante -= delta) <= 0) {
        colpo_melee = null;
      }
      const { sinistra, destra, salto, melee, lancio } = comandi;
      PP.physics.set_velocity_x(meg, (Number(destra) - Number(sinistra)) * VELOCITA);
      if (sinistra !== destra) direzione_meg = destra ? 1 : -1;
      aggiorna_lancio(delta);
      if (lancio) lancia_padella(s);
      if (melee && !lancio) attacca_melee(s);
      aggiorna_melee(s);
      salta(salto);
      aggiorna_skin();
    },
  };
}
