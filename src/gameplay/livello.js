import { LARGHEZZA, ALTEZZA } from "../config.js";
import { aggiungi_moneta, monete_totali, rimuovi_monete } from "../progressi.js";
import { L_MEG, A_MEG, DIMENSIONE_MONETA, RIMBALZO_TOPO, VITE_MAX, COLORI } from "./config.js";
import { rettangolo_fisico, fissa, testo } from "./grafica.js";
import { crea_abilita_meg } from "./abilita_meg.js";
import { crea_nemici, scegli_topi_grandi } from "./nemici.js";
import { crea_monete } from "./monete.js";
import { crea_dialogo } from "./dialogo.js";
import { crea_hud, crea_game_over } from "./hud.js";
import { prepara_skin_terreni, disegna_terreno } from "./terreni.js";
import { crea_skin_personaggio } from "./personaggi.js";
import { apri_pausa } from "../scenes/pausa.js";

// Ogni chiamata registra una scena con stato indipendente. Solo questi progressi
// sopravvivono ai riavvii: checkpoint, vite e raccolte.
export function registra_livello(config) {
  const { nome, lunghezza: LUNGHEZZA, suolo: SUOLO,
    terreni: TERRENI, piattaforme: PIATTAFORME = [], soffitti: SOFFITTI = [],
    checkpoint: CHECKPOINT = [], spine: SPINE = [], reliquie: RELIQUIE = [],
    monete: MONETE_ESPLORAZIONE = [], pattuglie: PATTUGLIE_TOPI = [],
  } = config;
  let meg, nemici, abilita, hud, dialogo, monete_visive;
  let skin_meg;
  let sfondi_zone = [];
  let partenza = config.partenza;
  let vite = VITE_MAX;
  let istruzioni_visibili = true;
  let dialogo_finito = false;
  let transizione = false;
  let game_over = false;
  let esc_rilasciato = true;
  let mercato_pronto = false;
  let blocchi_solidi = [], mercati = [];
  let piedi_meg_precedenti;
  let topi_grandi = null;
  let monete_tentativo = 0;
  const reliquie_raccolte = new Set();
  const monete_esplorazione_raccolte = new Set();
  const immagini = {};
  let skin_terreni;
  const bloccato = () => transizione || game_over || Boolean(dialogo?.attivo);

  function preload(s) {
    for (const nome of ["cuore", "moneta", "topo", "padella-24", "provasfondo1",
      "terreni-01", "terreni-02", "terreni-03", "terra paese", "meg-24", "index"]) {
      immagini[nome] = PP.assets.image.load(s, "assets/images/" + nome + ".png");
    }
  }
  function create(s) {
    mercato_pronto = false;
    esc_rilasciato = false;
    transizione = false;
    game_over = false;
    dialogo = null;
    mercati = [];
    blocchi_solidi = [];
    monete_visive = crea_monete(s, immagini.moneta);
    piedi_meg_precedenti = SUOLO;
    crea_sfondo(s);
    skin_terreni = prepara_skin_terreni(s, immagini);
    if (config.skin_terreni) {
      const skin = skin_terreni[config.skin_terreni];
      skin_terreni = { suolo: skin, piattaforma: skin, roccia: skin };
    }
    meg = PP.shapes.rectangle_add(s, partenza, SUOLO - A_MEG / 2,
      L_MEG, A_MEG, COLORI.meg, 1);
    PP.physics.add(s, meg, PP.physics.type.DYNAMIC);
    meg.visibility.alpha = 0;
    // Altezza della skin: 27 quadratini da 4 px.
    skin_meg = crea_skin_personaggio(s, immagini["meg-24"], partenza, SUOLO, A_MEG);
    s.events.on("postupdate", aggiorna_skin_meg);
    s.events.once("shutdown", () => s.events.off("postupdate", aggiorna_skin_meg));
    // Il limite inferiore resta sotto lo schermo per consentire la caduta nei vuoti.
    PP.physics.set_world_bounds(s, 0, -400, LUNGHEZZA, ALTEZZA + 900);
    PP.physics.set_collide_world_bounds(meg, true);

    for (const [x, larghezza] of TERRENI) {
      crea_blocco(s, x, SUOLO, larghezza, ALTEZZA - SUOLO, skin_terreni.suolo);
    }
    for (const [x, y, larghezza] of PIATTAFORME) {
      crea_blocco(s, x, y, larghezza, 24, skin_terreni.piattaforma);
    }
    for (const [x, larghezza] of SOFFITTI) {
      crea_blocco(s, x, -400, larghezza, SUOLO + 190, skin_terreni.roccia);
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

    topi_grandi ??= scegli_topi_grandi(PATTUGLIE_TOPI.length);
    nemici = crea_nemici(s, {
      meg, pattuglie: PATTUGLIE_TOPI, terreni: TERRENI, suolo: SUOLO,
      immagine: immagini.topo, blocchi: blocchi_solidi, bloccato,
      grandi: topi_grandi, zone_sicure: [config.partenza, ...CHECKPOINT,
        ...(config.venditrice ? [config.venditrice.x + 130] : [])],
      on_contatto: topo => tocca_topo(s, topo),
      on_morte: topo => lascia_moneta(s, topo),
    });
    PP.camera.set_bounds(s, 0, 0, LUNGHEZZA, ALTEZZA);
    PP.camera.start_follow(s, meg, -180, 0);
    abilita = crea_abilita_meg(s, {
      meg, topi: nemici.elenco, bloccato, danneggia: nemici.danneggia,
      immagine_padella: immagini["padella-24"],
      ostacoli: () => blocchi_solidi,
    });
    hud = crea_hud(s, { immagini, pausa });
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

  function azzera_esplorazione() {
    topi_grandi = null;
    reliquie_raccolte.clear();
    monete_esplorazione_raccolte.clear();
  }

  function crea_portale_mercato(s) {
    for (const zona of config.zone || [{ inizio: 0 }]) {
      const x = zona.inizio + 30;
      PP.shapes.rectangle_add(s, x, SUOLO - 56, 34, 120, "0xB59AE8", 1);
      const portale = rettangolo_fisico(s, x - 14, SUOLO - 110,
        28, 110, "0x66518A");
      testo(s, x + 35, SUOLO - 140, "Mercato", 22);
      const mercato = { x, disponibile: false };
      mercati.push(mercato);
      PP.physics.add_overlap_f(s, meg, portale, () => {
        if (bloccato() || PP.scenes.in_overlay_mode || !mercato_pronto || !mercato.disponibile) return;
        // Dopo Sì/No occorre allontanarsi prima di riproporre la domanda.
        mercato.disponibile = false;
        esc_rilasciato = false;
        PP.scenes.start_overlay("mercato");
      });
    }
  }

  function crea_amico(s) {
    const altezza_venditrice = 28 * 4;
    crea_skin_personaggio(s, immagini.index, config.venditrice.x, SUOLO, altezza_venditrice);
    testo(s, config.venditrice.x, SUOLO - altezza_venditrice - 26, "Venditrice", 24);
    const zona = rettangolo_fisico(s, config.venditrice.x - 65, SUOLO - 240,
      125, 240, COLORI.checkpoint);
    zona.visibility.alpha = 0;
    PP.physics.add_overlap_f(s, meg, zona, () => {
      if (dialogo_finito || dialogo?.attivo || transizione) return;
      dialogo.apri();
    });
  }

  function crea_sfondo(s) {
    const fondo = PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
      LARGHEZZA, ALTEZZA, COLORI.sfondo, 1);
    fissa(fondo);
    sfondi_zone = [];
    for (const zona of config.zone || []) {
      if (!zona.sfondo) continue;
      const sfondo = PP.assets.image.add(s, immagini[zona.sfondo],
        LARGHEZZA / 2, ALTEZZA / 2, 0.5, 0.5);
      const scala = Math.max(LARGHEZZA / sfondo.geometry.display_width,
        ALTEZZA / sfondo.geometry.display_height);
      sfondo.geometry.scale_x = scala;
      sfondo.geometry.scale_y = scala;
      sfondo.visibility.hidden = partenza < zona.inizio || partenza >= zona.fine;
      fissa(sfondo);
      sfondi_zone.push({ zona, sfondo });
    }
  }

  function crea_blocco(s, x, y, larghezza, altezza, skin) {
    const zona = config.zone?.find(zona => x >= zona.inizio && x < zona.fine);
    if (zona && zona.skin === null) skin = null;
    const blocco = rettangolo_fisico(s, x, y, larghezza, altezza, COLORI.terreno);
    if (skin) {
      blocco.visibility.alpha = 0;
      disegna_terreno(s, skin, x, y, larghezza, altezza);
    }
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
    if (transizione || game_over) return;
    abilita.termina();
    // Le monete del tentativo diventano definitive soltanto raggiungendo l'arrivo.
    monete_tentativo = 0;
    azzera_esplorazione();
    transizione = true;
    partenza = config.partenza;
    vite = VITE_MAX;
    istruzioni_visibili = true;
    dialogo_finito = false;
    PP.scenes.start("crediti");
  }

  function pausa() {
    if (transizione || PP.scenes.in_overlay_mode) return;
    esc_rilasciato = false;
    apri_pausa(torna_menu);
  }

  function torna_menu() {
    if (transizione) return;
    abilita.termina();
    perdi_monete_tentativo();
    azzera_esplorazione();
    partenza = config.partenza;
    vite = VITE_MAX;
    istruzioni_visibili = true;
    dialogo_finito = false;
    transizione = true;
    PP.scenes.start("menu");
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

  function aggiorna_skin_meg() {
    for (const { zona, sfondo } of sfondi_zone) {
      sfondo.visibility.hidden = meg.geometry.x < zona.inizio || meg.geometry.x >= zona.fine;
    }
    skin_meg.setPosition(meg.geometry.x, meg.geometry.y + A_MEG / 2);
    const velocita = PP.physics.get_velocity_x(meg);
    if (velocita !== 0) skin_meg.setFlipX(velocita < 0);
  }

  function update(s) {
    const movimento_premuto = [PP.key_codes.LEFT, PP.key_codes.A,
      PP.key_codes.RIGHT, PP.key_codes.D].some(tasto => PP.interactive.kb.is_key_down(s, tasto));
    if (!movimento_premuto) mercato_pronto = true;
    for (const mercato of mercati) {
      if (Math.abs(meg.geometry.x - mercato.x) > 70) mercato.disponibile = true;
    }
    if (!PP.interactive.kb.is_key_down(s, PP.key_codes.ESC)) esc_rilasciato = true;
    if (esc_rilasciato && PP.interactive.kb.is_key_just_down(s, PP.key_codes.ESC)) {
      pausa();
      return;
    }
    monete_visive?.aggiorna();
    abilita?.aggiorna_skin();
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
    if (appena(tasti.R)) { ricomincia(); return; }
    if (dialogo?.attivo) { dialogo.aggiorna(); return; }
    // PoliPhaser richiama update con passo fisso alla frequenza della fisica.
    abilita.aggiorna(1000 / PP.game.get_physics_fps(s), {
      sinistra: premuto(tasti.LEFT) || premuto(tasti.A),
      destra: premuto(tasti.RIGHT) || premuto(tasti.D),
      salto: appena(tasti.SPACE) || appena(tasti.UP) || appena(tasti.W),
      melee: appena(tasti.C), lancio: appena(tasti.V),
    });
    aggiorna_hud();
    if (meg.geometry.y > ALTEZZA + A_MEG) riprova(s);
  }

  function destroy(s) {
    s.events.off("postupdate", aggiorna_skin_meg);
    abilita?.distruggi();
  }

  PP.scenes.add(nome, preload, create, update, destroy);
  return { get meg() { return meg; } };
}
