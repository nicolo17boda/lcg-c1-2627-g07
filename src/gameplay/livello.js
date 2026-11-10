import { LARGHEZZA, ALTEZZA } from "../config.js";
import { aggiungi_moneta, monete_totali, rimuovi_monete, completa_livello, livello_sbloccato } from "../progressi.js";
import { L_MEG, A_MEG, DIMENSIONE_MONETA, RIMBALZO_TOPO, VITE_MAX, COLORI } from "./config.js";
import { rettangolo_fisico, fissa, testo } from "./grafica.js";
import { crea_abilita_meg } from "./abilita_meg.js";
import { crea_nemici, scegli_topi_grandi } from "./nemici.js";
import { crea_notifiche_achievement } from "./notifiche_achievement.js";
import { crea_monete } from "./monete.js";
import { crea_dialogo } from "./dialogo.js";
import { crea_hud, crea_game_over } from "./hud.js";

// Ogni chiamata registra una scena con stato indipendente. Solo questi progressi
// sopravvivono ai riavvii: checkpoint, vite, raccolte e arene già superate.
export function registra_livello(config) {
  const { nome, numero, lunghezza: LUNGHEZZA, suolo: SUOLO,
    terreni: TERRENI, piattaforme: PIATTAFORME = [], soffitti: SOFFITTI = [],
    checkpoint: CHECKPOINT = [], spine: SPINE = [], reliquie: RELIQUIE = [],
    monete: MONETE_ESPLORAZIONE = [], pattuglie: PATTUGLIE_TOPI = [], arene: ARENE = [],
  } = config;
  let meg, nemici, abilita, hud, dialogo, monete_visive, notifiche;
  let partenza = config.partenza;
  let vite = VITE_MAX;
  let istruzioni_visibili = true;
  let dialogo_finito = false;
  let transizione = false;
  let game_over = false;
  let m_rilasciato = true;
  let blocchi_solidi = [], cancelli = [];
  let piedi_meg_precedenti;
  let topi_grandi = null;
  let monete_tentativo = 0;
  const arene_superate = new Set();
  const reliquie_raccolte = new Set();
  const monete_esplorazione_raccolte = new Set();
  const immagini = {};
  const bloccato = () => transizione || game_over || Boolean(dialogo?.attivo);

  function preload(s) {
    for (const nome of ["cuore", "mappa", "moneta", "topo", "padella"]) {
      immagini[nome] = PP.assets.image.load(s, "assets/images/" + nome + ".png");
    }
  }
  function create(s) {
    if (!livello_sbloccato(numero)) { PP.scenes.start("mappa"); return; }
    m_rilasciato = true;
    transizione = false;
    game_over = false;
    dialogo = null;
    cancelli = [];
    blocchi_solidi = [];
    monete_visive = crea_monete(s, immagini.moneta);
    piedi_meg_precedenti = SUOLO;
    crea_sfondo(s);
    meg = PP.shapes.rectangle_add(s, partenza, SUOLO - A_MEG / 2,
      L_MEG, A_MEG, COLORI.meg, 1);
    PP.physics.add(s, meg, PP.physics.type.DYNAMIC);
    // Il limite inferiore resta sotto lo schermo per consentire la caduta nei vuoti.
    PP.physics.set_world_bounds(s, 0, -400, LUNGHEZZA, ALTEZZA + 900);
    PP.physics.set_collide_world_bounds(meg, true);

    for (const [x, larghezza] of TERRENI) {
      crea_blocco(s, x, SUOLO, larghezza, ALTEZZA - SUOLO, COLORI.terreno);
    }
    for (const [x, y, larghezza] of PIATTAFORME) {
      crea_blocco(s, x, y, larghezza, 24, COLORI.piattaforma);
    }
    for (const [x, larghezza] of SOFFITTI) {
      crea_blocco(s, x, -400, larghezza, SUOLO + 190, COLORI.terreno);
    }

    for (const x of CHECKPOINT) {
      const segnale = rettangolo_fisico(s, x, SUOLO - 90,
        18, 90, COLORI.checkpoint);
      segnale.visibility.alpha = x <= partenza ? 1 : 0.45;
      PP.physics.add_overlap_f(s, meg, segnale, () => {
        if (x > partenza) {
          partenza = x;
          segnale.visibility.alpha = 1;
        }
      });
    }
    const arrivo = rettangolo_fisico(s, config.arrivo, SUOLO - 120,
      48, 120, COLORI.traguardo);
    PP.physics.add_overlap_f(s, meg, arrivo, completa);
    testo(s, config.arrivo + 24, SUOLO - 145, "Arrivo", 24);

    const esclusi = new Set(ARENE.flatMap((arena, indice) =>
      arene_superate.has(indice) ? arena.topi : []));
    topi_grandi ??= scegli_topi_grandi(PATTUGLIE_TOPI.length);
    nemici = crea_nemici(s, {
      meg, pattuglie: PATTUGLIE_TOPI, terreni: TERRENI, suolo: SUOLO,
      immagine: immagini.topo, blocchi: blocchi_solidi, esclusi, bloccato,
      grandi: topi_grandi, zone_sicure: [config.partenza, ...CHECKPOINT],
      on_contatto: topo => tocca_topo(s, topo),
      on_morte: topo => { lascia_moneta(s, topo); aggiorna_cancelli(); },
    });
    crea_cancelli(s);
    PP.camera.set_bounds(s, 0, 0, LUNGHEZZA, ALTEZZA);
    PP.camera.start_follow(s, meg, -180, 0);
    abilita = crea_abilita_meg(s, {
      meg, topi: nemici.elenco, bloccato, danneggia: nemici.danneggia,
      immagine_padella: immagini.padella,
      ostacoli: () => [...blocchi_solidi,
        ...cancelli.filter(c => !arene_superate.has(c.indice)).map(c => c.corpo)],
    });
    hud = crea_hud(s, { numero, immagini, torna_mappa });
    hud.mostra_istruzioni(istruzioni_visibili);
    aggiorna_hud();
    if (config.mercato) crea_portale_mercato(s);
    if (config.venditrice) {
      dialogo = crea_dialogo(s, {
        battute: config.venditrice.battute,
        on_apri: () => {
          abilita.sospendi();
          PP.physics.set_velocity_x(meg, 0);
          PP.physics.set_velocity_y(meg, 0);
          PP.physics.set_allow_gravity(meg, false);
        },
        on_chiudi: () => {
          dialogo_finito = true;
          PP.physics.set_allow_gravity(meg, true);
        },
      });
      crea_amico(s);
    }
    crea_esplorazione(s);
    notifiche = crea_notifiche_achievement(s);
  }

  function crea_esplorazione(s) {
    for (const [x, larghezza] of SPINE) {
      const spine = rettangolo_fisico(s, x, SUOLO - 18, larghezza, 18, COLORI.pericolo);
      // Denti visibili: il rosso identifica sempre un pericolo.
      for (let dx = 4; dx < larghezza; dx += 16) {
        PP.shapes.rectangle_add(s, x + dx, SUOLO - 22, 6, 12, COLORI.pericolo, 1);
      }
      PP.physics.add_overlap_f(s, meg, spine, () => {
        if (!dialogo?.attivo) riprova(s);
      });
    }
    for (const [indice, [x, y]] of MONETE_ESPLORAZIONE.entries()) {
      if (monete_esplorazione_raccolte.has(indice)) continue;
      const moneta = monete_visive.crea(x, y);
      PP.physics.add_overlap_f(s, meg, moneta, () => {
        if (transizione || game_over || dialogo?.attivo || moneta.raccolta) return;
        monete_esplorazione_raccolte.add(indice);
        raccogli_moneta(moneta);
      });
    }
    for (const [indice, { x, y }] of RELIQUIE.entries()) {
      if (reliquie_raccolte.has(indice)) continue;
      const reliquia = rettangolo_fisico(s, x - 13, y - 13, 26, 26, COLORI.meg);
      PP.physics.add_overlap_f(s, meg, reliquia, () => {
        if (transizione || game_over || dialogo?.attivo || reliquie_raccolte.has(indice)) return;
        reliquie_raccolte.add(indice);
        for (let i = 0; i < 5; i++) aggiungi_moneta();
        monete_tentativo += 5;
        PP.shapes.destroy(reliquia);
        aggiorna_hud();
      });
    }
  }

// I cancelli occupano tutta l'altezza fisica del mondo e si aprono solo
// dopo la sconfitta dei topi associati. Nessuna collisione con monete o topi.

  function crea_cancelli(s) {
    for (const [indice, arena] of ARENE.entries()) {
      if (arene_superate.has(indice)) continue;
      const corpo = rettangolo_fisico(s, arena.x, -400, 24, SUOLO + 400, COLORI.pericolo);
      PP.physics.add_collider(s, meg, corpo);
      const luci = arena.topi.map((id, i) => PP.shapes.rectangle_add(s,
        arena.x + 12, SUOLO - 70 - i * 30, 12, 12, COLORI.checkpoint, 1));
      cancelli.push({ indice, corpo, luci });
    }
  }

  function aggiorna_cancelli() {
    for (const cancello of cancelli) {
      if (arene_superate.has(cancello.indice)) continue;
      const id_nemici = ARENE[cancello.indice].topi;
      id_nemici.forEach((id, i) => {
        cancello.luci[i].visibility.alpha = nemici.per_id.get(id).vita > 0 ? 1 : 0.15;
      });
      if (id_nemici.every(id => nemici.per_id.get(id).vita <= 0)) {
        arene_superate.add(cancello.indice);
        PP.shapes.destroy(cancello.corpo);
        for (const luce of cancello.luci) PP.shapes.destroy(luce);
      }
    }
  }

  function azzera_esplorazione() {
    topi_grandi = null;
    arene_superate.clear();
    reliquie_raccolte.clear();
    monete_esplorazione_raccolte.clear();
  }

  function crea_portale_mercato(s) {
    // Meg nasce a x = 140: il portale termina a x = 88, senza sovrapporsi.
    PP.shapes.rectangle_add(s, 60, SUOLO - 56,
      68, 120, "0xB59AE8", 1);
    const portale = rettangolo_fisico(s, 32, SUOLO - 110,
      56, 110, "0x66518A");
    testo(s, 65, SUOLO - 140, "Mercato", 22);
    PP.physics.add_overlap_f(s, meg, portale, () => {
      if (transizione || dialogo?.attivo) return;
      transizione = true;
      abilita.termina();
      PP.game_state.set_variable("ritorno_mercato", nome);
      PP.scenes.start("mercato");
    });
  }

  function crea_amico(s) {
    PP.shapes.rectangle_add(s, config.venditrice.x, SUOLO - 32,
      44, 64, COLORI.checkpoint, 1);
    testo(s, config.venditrice.x, SUOLO - 90, "Venditrice", 24);
    const zona = rettangolo_fisico(s, config.venditrice.x - 130, SUOLO - 240,
      250, 240, COLORI.checkpoint);
    zona.visibility.alpha = 0;
    PP.physics.add_overlap_f(s, meg, zona, () => {
      if (dialogo_finito || dialogo?.attivo || transizione) return;
      dialogo.apri();
    });
  }

  function crea_sfondo(s) {
    const cielo = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
      LARGHEZZA, ALTEZZA, COLORI.sfondo, 1);
    fissa(cielo);
    // Sagome decorative geometriche, senza collisioni né texture.
    for (let i = 0; i < Math.ceil(LUNGHEZZA / 280); i++) {
      const altezza = 140 + (i % 4) * 50;
      PP.shapes.rectangle_add(s, i * 280, SUOLO - altezza / 2,
        180, altezza, COLORI.lontano, 1);
    }
  }

  function crea_blocco(s, x, y, larghezza, altezza, colore) {
    const blocco = rettangolo_fisico(s, x, y, larghezza, altezza, colore);
    PP.physics.add_collider(s, meg, blocco);
    blocchi_solidi.push(blocco);
  }

  function tocca_topo(s, topo) {
    if (transizione || game_over || dialogo?.attivo || topo.vita <= 0) return;
    const sopra = topo.corpo.geometry.y - topo.altezza / 2;
    const schiacciato = PP.physics.get_velocity_y(meg) > 0
      && piedi_meg_precedenti <= sopra + 8
      && meg.geometry.y < sopra;
    // I topi grandi non sono schiacciabili, anche dopo il primo colpo.
    if (topo.grande && schiacciato) { riprova(s); return; }
    // Il colpo già attivo ha precedenza sul contatto laterale.
    if (abilita.colpisci_melee(topo)) return;
    if (!schiacciato || topo.grande) { riprova(s); return; }
    PP.physics.set_velocity_y(meg, -RIMBALZO_TOPO);
    nemici.danneggia(topo);
  }

  function raccogli_moneta(moneta) {
    if (transizione || game_over || moneta.raccolta) return;
    moneta.raccolta = true;
    aggiungi_moneta();
    monete_tentativo += 1;
    aggiorna_hud();
    monete_visive.rimuovi(moneta);
  }

  function perdi_monete_tentativo() {
    rimuovi_monete(monete_tentativo);
    monete_tentativo = 0;
    aggiorna_hud();
  }

  function riprova(s) {
    if (transizione || game_over) return;
    abilita.termina();
    vite -= 1;
    if (vite === 0) {
      perdi_monete_tentativo();
      azzera_esplorazione();
      game_over = true;
      PP.physics.set_velocity_x(meg, 0);
      PP.physics.set_velocity_y(meg, 0);
      PP.physics.set_allow_gravity(meg, false);
      aggiorna_hud();
      crea_game_over(s, ricomincia);
      return;
    }
    transizione = true;
    PP.scenes.start(nome);
  }

  function ricomincia() {
    if (transizione) return;
    abilita.termina();
    perdi_monete_tentativo();
    azzera_esplorazione();
    partenza = config.partenza;
    vite = VITE_MAX;
    istruzioni_visibili = true;
    dialogo_finito = false;
    game_over = false;
    transizione = true;
    PP.scenes.start(nome);
  }

  function completa() {
    if (transizione || game_over || arene_superate.size < ARENE.length) return;
    if (!completa_livello(numero)) return;
    abilita.termina();
    // Le monete del tentativo diventano definitive soltanto raggiungendo l'arrivo.
    monete_tentativo = 0;
    azzera_esplorazione();
    transizione = true;
    PP.game_state.set_variable("mappa_da_partita", false);
    partenza = config.partenza;
    vite = VITE_MAX;
    istruzioni_visibili = true;
    dialogo_finito = false;
    PP.scenes.start("mappa");
  }

  function torna_mappa() {
    if (transizione || PP.scenes.in_overlay_mode) return;
    // Ignora il tasto usato per chiudere la mappa finché non viene rilasciato.
    m_rilasciato = false;
    PP.game_state.set_variable("mappa_da_partita", true);
    // La libreria sospende il livello senza distruggerne posizione e stato.
    PP.scenes.start_overlay("mappa");
  }

  function lascia_moneta(s, topo) {
    const moneta = monete_visive.crea(topo.corpo.geometry.x,
      topo.corpo.geometry.y - topo.altezza / 2 - DIMENSIONE_MONETA / 2, true);
    for (const blocco of blocchi_solidi) PP.physics.add_collider(s, moneta, blocco);
    PP.physics.add_overlap_f(s, meg, moneta, () => raccogli_moneta(moneta));
  }

  function aggiorna_hud() {
    hud.aggiorna({ vite, monete: monete_totali(),
      salto: abilita.frazione_salto, lancio: abilita.frazione_lancio });
  }

  function update(s) {
    monete_visive?.aggiorna();
    abilita?.aggiorna_skin();
    if (!transizione && !dialogo?.attivo) notifiche?.aggiorna(1000 / PP.game.get_physics_fps(s));
    if (transizione || game_over) return;
    nemici.aggiorna();
    piedi_meg_precedenti = meg.geometry.y + A_MEG / 2;
    if (istruzioni_visibili && meg.geometry.x >= config.fine_istruzioni) {
      istruzioni_visibili = false;
      hud.mostra_istruzioni(false);
    }
    const tasti = PP.key_codes;
    const premuto = tasto => PP.interactive.kb.is_key_down(s, tasto);
    const appena = tasto => PP.interactive.kb.is_key_just_down(s, tasto);
    const apri_con_m = m_rilasciato && appena(tasti.M);
    if (!m_rilasciato && !premuto(tasti.M)) m_rilasciato = true;
    if (apri_con_m || appena(tasti.ESC)) { torna_mappa(); return; }
    if (appena(tasti.R)) { ricomincia(); return; }
    if (dialogo?.attivo) { dialogo.aggiorna(); return; }
    // PoliPhaser richiama update con passo fisso alla frequenza della fisica.
    abilita.aggiorna(1000 / PP.game.get_physics_fps(s), {
      sinistra: premuto(tasti.LEFT) || premuto(tasti.A),
      destra: premuto(tasti.RIGHT) || premuto(tasti.D),
      salto: appena(tasti.SPACE) || appena(tasti.UP) || appena(tasti.W),
      melee: appena(tasti.J), lancio: appena(tasti.K),
    });
    aggiorna_hud();
    if (meg.geometry.y > ALTEZZA + A_MEG) riprova(s);
  }

  function destroy() {
    abilita?.distruggi();
    notifiche?.distruggi();
  }

  PP.scenes.add(nome, preload, create, update, destroy);
  return { get meg() { return meg; } };
}
