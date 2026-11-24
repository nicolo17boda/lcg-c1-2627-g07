import { LARGHEZZA } from "../config.js";
import { testo, fissa } from "./grafica.js";
import { crea_drago } from "./drago.js?v=drago-4";

export const INGREDIENTI = [
  { id: "pane", nome: "Pane", zona: 0 },
  { id: "latte", nome: "Latte", zona: 1 },
  { id: "uovo", nome: "Uovo", zona: 2 },
];

// Stato della partita, indipendente dagli oggetti ricreati dopo una caduta.
export function crea_stato_budino(config, casuale = Math.random) {
  const posizioni = INGREDIENTI.map(({ zona }) => {
    const limiti = config.zone[zona];
    const candidati = [];
    for (const [inizio, larghezza] of config.terreni) {
      const da = Math.max(inizio + 90, limiti.inizio + 450);
      const a = Math.min(inizio + larghezza - 90, limiti.fine - 300);
      for (let x = da; x <= a; x += 80) {
        const pericolo = (config.spine || []).some(([sx, l]) => x >= sx - 60 && x <= sx + l + 60);
        const topo = (config.pattuglie || []).some(([sx, dx, opzioni]) =>
          (!opzioni?.quota || opzioni.quota === config.suolo) && x >= sx - 100 && x <= dx + 100);
        const arciere = (config.arcieri || []).some(([ax, quota]) =>
          (!quota || quota === config.suolo) && Math.abs(x - ax) < 160);
        if (!pericolo && !topo && !arciere) candidati.push(x);
      }
    }
    if (!candidati.length) throw new Error(`Nessuna posizione sicura per l'ingrediente della zona ${zona + 1}`);
    return { x: candidati[Math.floor(casuale() * candidati.length)], y: config.suolo - 30 };
  });
  const raccolti = new Set();
  let impasto_pronto = false, cotto = false, drago_sconfitto = false;
  return {
    posizioni, raccolti,
    get impasto_pronto() { return impasto_pronto; },
    get cotto() { return cotto; },
    get drago_sconfitto() { return drago_sconfitto; },
    raccogli(id) {
      if (!INGREDIENTI.some(i => i.id === id) || raccolti.has(id)) return false;
      raccolti.add(id);
      return true;
    },
    prepara() {
      if (raccolti.size !== INGREDIENTI.length || impasto_pronto) return false;
      impasto_pronto = true;
      return true;
    },
    cucina() {
      if (!impasto_pronto || cotto) return false;
      cotto = true;
      return true;
    },
    offri() {
      if (!cotto || raccolti.size !== INGREDIENTI.length || drago_sconfitto) return false;
      drago_sconfitto = true;
      return true;
    },
  };
}

function prepara_icone(s) {
  for (const id of ["pane", "latte", "uovo", "budino-crudo", "budino-cotto"]) {
    if (s.textures.exists("ricetta-" + id)) continue;
    const g = s.make.graphics({ x: 0, y: 0, add: false });
    if (id === "pane") {
      g.fillStyle(0x9e602f).fillRoundedRect(2, 10, 36, 23, 6);
      g.fillStyle(0xe9b86c).fillRoundedRect(4, 6, 32, 23, 8);
      g.lineStyle(3, 0xffdf9b).lineBetween(11, 11, 15, 19).lineBetween(22, 10, 26, 18);
    } else if (id === "latte") {
      g.fillStyle(0xe7f2ed).fillRect(10, 11, 22, 25);
      g.fillStyle(0x83bdcf).fillRect(10, 20, 22, 9);
      g.fillStyle(0xc0dce4).fillTriangle(10, 11, 21, 3, 32, 11);
      g.fillStyle(0x568ca4).fillRect(19, 2, 13, 5);
    } else if (id === "uovo") {
      g.fillStyle(0xd6bfa0).fillEllipse(21, 23, 24, 30);
      g.fillStyle(0xffefd3).fillEllipse(18, 20, 20, 28);
    } else if (id === "budino-crudo") {
      g.fillStyle(0xe6ddd0).fillEllipse(20, 33, 38, 10);
      g.fillStyle(0xf1e8c8).fillRoundedRect(5, 12, 30, 21, 6);
      g.fillStyle(0xf8f2de).fillEllipse(20, 13, 30, 10);
    } else {
      g.fillStyle(0xe6ddd0).fillEllipse(20, 33, 38, 10);
      g.fillStyle(0xc88b44).fillRoundedRect(5, 12, 30, 21, 6);
      g.fillStyle(0x8f4d28).fillEllipse(20, 13, 30, 10);
    }
    g.generateTexture("ricetta-" + id, 40, 40);
    g.destroy();
  }
}

export function crea_missione_budino(s, {
  stato, config, meg, blocchi, bloccato, on_colpito, on_lancia_budino,
}) {
  prepara_icone(s);
  const forno_x = config.zone[3].inizio + 200;
  const drago_x = config.zone[3].fine - 550;
  const suolo = config.suolo;
  function fisso(oggetto) {
    fissa(oggetto);
    oggetto.ph_obj.setDepth(100);
    return oggetto;
  }
  fisso(PP.shapes.rectangle_add(s, LARGHEZZA - 136, 86, 232, 140, "0x1D2938", 0.96));
  fisso(testo(s, LARGHEZZA - 136, 35, "Budino di pane", 17));
  const slots_ingredienti = [];
  const etichette_ingredienti = [];
  const icone_hud = INGREDIENTI.map((ingrediente, indice) => {
    const x = LARGHEZZA - 210 + indice * 74;
    const slot = fisso(PP.shapes.rectangle_add(s, x, 77, 54, 48, "0x293A4E", 1));
    PP.shapes.set_stroke(slot, 1, "0x65768A", 1);
    slots_ingredienti.push(slot);
    etichette_ingredienti.push(fisso(testo(s, x, 113, ingrediente.nome, 12)));
    const icona = s.add.image(x, 77, "ricetta-" + ingrediente.id)
      .setScrollFactor(0).setDepth(101).setVisible(stato.raccolti.has(ingrediente.id));
    return icona;
  });
  const slot_budino = fisso(PP.shapes.rectangle_add(s, LARGHEZZA - 136,
    77, 54, 48, "0x293A4E", 1));
  PP.shapes.set_stroke(slot_budino, 1, "0x65768A", 1);
  slot_budino.visibility.hidden = true;
  const etichetta_budino = fisso(testo(s, LARGHEZZA - 136, 113, "Budino", 12));
  etichetta_budino.visibility.hidden = true;
  const icona_budino = s.add.image(LARGHEZZA - 136, 77, "ricetta-budino-crudo")
    .setScrollFactor(0).setDepth(101).setVisible(false);
  const stato_hud = fisso(testo(s, LARGHEZZA - 136, 138, "", 12));
  let messaggio_precedente;
  function aggiorna_hud() {
    const budino_creato = stato.impasto_pronto && !stato.drago_sconfitto;
    slots_ingredienti.forEach(slot => { slot.visibility.hidden = budino_creato; });
    etichette_ingredienti.forEach(etichetta => { etichetta.visibility.hidden = budino_creato; });
    icone_hud.forEach((icona, indice) => {
      icona.setVisible(!budino_creato && stato.raccolti.has(INGREDIENTI[indice].id));
    });
    slot_budino.visibility.hidden = !budino_creato;
    etichetta_budino.visibility.hidden = !budino_creato;
    const texture_budino = stato.cotto ? "ricetta-budino-cotto" : "ricetta-budino-crudo";
    if (icona_budino.texture.key !== texture_budino) icona_budino.setTexture(texture_budino);
    icona_budino.setVisible(budino_creato);
    const messaggio = stato.drago_sconfitto ? "Drago sconfitto!" : stato.cotto
      ? drago ? "Budino pronto · offri al drago" : "Budino pronto"
      : stato.impasto_pronto ? "Ingredienti inseriti · cuoci al forno (zona 4)"
        : stato.raccolti.size === INGREDIENTI.length ? "Ingredienti pronti · forno dopo il mercato (zona 4)" : "";
    if (messaggio !== messaggio_precedente) {
      PP.shapes.text_change(stato_hud, messaggio);
      messaggio_precedente = messaggio;
    }
  }
  INGREDIENTI.forEach((ingrediente, indice) => {
    if (stato.raccolti.has(ingrediente.id)) return;
    const { x, y } = stato.posizioni[indice];
    const corpo = PP.shapes.rectangle_add(s, x, y, 44, 50, "0x000000", 0);
    PP.physics.add(s, corpo, PP.physics.type.STATIC);
    const icona = s.add.image(x, y, "ricetta-" + ingrediente.id);
    const nome = testo(s, x, y - 36, ingrediente.nome, 15);
    PP.physics.add_overlap_f(s, meg, corpo, () => {
      if (bloccato() || !stato.raccogli(ingrediente.id)) return;
      PP.shapes.destroy(corpo);
      PP.shapes.destroy(nome);
      icona.destroy();
      aggiorna_hud();
    });
  });

  // Il forno si trova subito dopo il mercato della zona 4.
  s.add.rectangle(forno_x, suolo - 34, 82, 68, 0x795a49);
  s.add.rectangle(forno_x, suolo - 27, 48, 44, 0x24212b);
  s.add.rectangle(forno_x, suolo - 16, 34, 12, 0xefad50);
  s.add.rectangle(forno_x, suolo - 72, 94, 10, 0xb99a7c);
  testo(s, forno_x, suolo - 145, "Forno · E", 19);
  const budino = s.add.image(forno_x, suolo - 98, "ricetta-budino-crudo").setVisible(false);
  const drago = config.drago_attivo === false ? null : crea_drago(s, {
    config, meg, stato, blocchi, bloccato, on_colpito, on_lancia_budino,
  });
  const puo_completare = () => stato.cotto && (!drago || stato.drago_sconfitto);
  const invito = fisso(testo(s, LARGHEZZA / 2, 650, "", 18));
  invito.ph_obj.setBackgroundColor("#1D2938").setPadding(12, 8);
  invito.visibility.hidden = true;
  let invito_precedente;

  function aggiorna(delta = 1000 / PP.game.get_physics_fps(s)) {
    aggiorna_hud();
    if (bloccato()) {
      invito.visibility.hidden = true;
      drago?.aggiorna(delta);
      return;
    }
    const vicino = x => Math.abs(meg.geometry.x - x) < 135 && Math.abs(meg.geometry.y - (suolo - 54)) < 110;
    let messaggio = "";
    const premuto = PP.interactive.kb.is_key_just_down(s, PP.key_codes.E);
    const messaggio_drago = drago?.aggiorna(delta, premuto) ?? "";
    if (vicino(forno_x)) {
      messaggio = stato.cotto ? drago
        ? "Il budino è pronto: fallo mangiare al drago per sconfiggerlo!"
        : "Il budino è pronto."
        : stato.impasto_pronto ? "Premi E per cuocere il budino"
          : stato.raccolti.size === INGREDIENTI.length ? "Premi E per inserire gli ingredienti nel forno"
            : "Per cucinare servono pane, latte e uovo";
      if (premuto && (stato.prepara() || stato.cucina())) aggiorna_hud();
    } else if (messaggio_drago) {
      messaggio = messaggio_drago;
    } else if (meg.geometry.x > config.arrivo - 180 && !puo_completare()) {
      messaggio = drago
        ? "Prima devi cucinare il budino e dopo farlo mangiare al drago"
        : "Prima devi cucinare il budino";
    }
    invito.visibility.hidden = !messaggio;
    if (messaggio !== invito_precedente) {
      PP.shapes.text_change(invito, messaggio);
      invito_precedente = messaggio;
    }
    budino.setTexture(stato.cotto ? "ricetta-budino-cotto" : "ricetta-budino-crudo");
    budino.setVisible(stato.impasto_pronto && !stato.drago_sconfitto);
  }
  aggiorna_hud();
  return {
    aggiorna,
    puo_completare: () => stato.raccolti.size === INGREDIENTI.length && puo_completare(),
    distruggi: () => drago?.distruggi(),
  };
}
