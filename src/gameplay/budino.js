import { LARGHEZZA } from "../config.js";
import { testo, fissa } from "./grafica.js";

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
  let cotto = false, drago_sconfitto = false;
  return {
    posizioni, raccolti,
    get cotto() { return cotto; },
    get drago_sconfitto() { return drago_sconfitto; },
    raccogli(id) {
      if (!INGREDIENTI.some(i => i.id === id) || raccolti.has(id)) return false;
      raccolti.add(id);
      return true;
    },
    cucina() {
      if (raccolti.size !== INGREDIENTI.length || cotto) return false;
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
  for (const id of ["pane", "latte", "uovo", "budino"]) {
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
    } else {
      g.fillStyle(0xe6ddd0).fillEllipse(20, 33, 38, 10);
      g.fillStyle(0xc88b44).fillRoundedRect(5, 12, 30, 21, 6);
      g.fillStyle(0x8f4d28).fillEllipse(20, 13, 30, 10);
    }
    g.generateTexture("ricetta-" + id, 40, 40);
    g.destroy();
  }
}

export function crea_missione_budino(s, { stato, config, meg, bloccato }) {
  prepara_icone(s);
  const forno_x = config.zone[2].fine - 200;
  const drago_x = config.zone[3].fine - 550;
  const suolo = config.suolo;
  function fisso(oggetto) {
    fissa(oggetto);
    oggetto.ph_obj.setDepth(100);
    return oggetto;
  }
  fisso(PP.shapes.rectangle_add(s, LARGHEZZA - 136, 190, 232, 140, "0x1D2938", 0.96));
  fisso(testo(s, LARGHEZZA - 136, 139, "Budino di pane", 17));
  const icone_hud = INGREDIENTI.map((ingrediente, indice) => {
    const x = LARGHEZZA - 210 + indice * 74;
    const slot = fisso(PP.shapes.rectangle_add(s, x, 181, 54, 48, "0x293A4E", 1));
    PP.shapes.set_stroke(slot, 1, "0x65768A", 1);
    fisso(testo(s, x, 217, ingrediente.nome, 12));
    const icona = s.add.image(x, 181, "ricetta-" + ingrediente.id)
      .setScrollFactor(0).setDepth(101).setVisible(stato.raccolti.has(ingrediente.id));
    return icona;
  });
  const stato_hud = fisso(testo(s, LARGHEZZA - 136, 242, "", 12));
  let messaggio_precedente;
  function aggiorna_hud() {
    icone_hud.forEach((icona, indice) => icona.setVisible(stato.raccolti.has(INGREDIENTI[indice].id)));
    const messaggio = stato.drago_sconfitto ? "Drago sconfitto!" : stato.cotto ? "Budino pronto · offri al drago"
      : stato.raccolti.size === 3 ? "3/3 · cucina al forno (zona 3)" : `${stato.raccolti.size}/3 · cerca nelle zone 1–3`;
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

  // Il forno resta accessibile dalla terza e dalla quarta zona.
  s.add.rectangle(forno_x, suolo - 34, 82, 68, 0x795a49);
  s.add.rectangle(forno_x, suolo - 27, 48, 44, 0x24212b);
  s.add.rectangle(forno_x, suolo - 16, 34, 12, 0xefad50);
  s.add.rectangle(forno_x, suolo - 72, 94, 10, 0xb99a7c);
  testo(s, forno_x, suolo - 145, "Forno · E cucina", 19);
  const budino = s.add.image(forno_x, suolo - 98, "ricetta-budino").setVisible(false);

  // Prima sagoma del drago: la vittoria richiede di offrirgli il budino.
  const drago = s.add.graphics({ x: drago_x, y: suolo });
  drago.fillStyle(0x314d42).fillTriangle(-15, -90, -100, -230, 50, -150);
  drago.fillStyle(0x6e9b69).fillEllipse(0, -75, 180, 130);
  drago.fillStyle(0x527c58).fillTriangle(60, -60, 155, -15, 30, -20);
  drago.fillStyle(0x6e9b69).fillRoundedRect(-100, -180, 80, 96, 14);
  drago.fillStyle(0x96b37b).fillRoundedRect(-140, -150, 76, 42, 8);
  drago.fillStyle(0xf2df9a).fillTriangle(-90, -177, -80, -212, -68, -177);
  drago.fillStyle(0xf1c85e).fillRect(-92, -162, 13, 9);
  drago.fillStyle(0x1d2938).fillRect(-90, -162, 4, 9);
  drago.fillStyle(0x3e6048).fillRect(-60, -28, 45, 28).fillRect(30, -28, 45, 28);
  const etichetta_drago = testo(s, drago_x, suolo - 250, "Drago · E Fai mangiare il budino", 21);
  const invito = fisso(testo(s, LARGHEZZA / 2, 650, "", 18));
  invito.ph_obj.setBackgroundColor("#1D2938").setPadding(12, 8);
  invito.visibility.hidden = true;
  let invito_precedente;
  let drago_mostrato_sconfitto = false;
  function aggiorna() {
    aggiorna_hud();
    if (bloccato()) { invito.visibility.hidden = true; return; }
    const vicino = x => Math.abs(meg.geometry.x - x) < 135 && Math.abs(meg.geometry.y - (suolo - 54)) < 110;
    let messaggio = "";
    const premuto = PP.interactive.kb.is_key_just_down(s, PP.key_codes.E);
    if (vicino(forno_x)) {
      messaggio = stato.cotto ? "Il budino è pronto: fallo mangiare al drago per sconfiggerlo!" : stato.raccolti.size === 3
        ? "Premi E per cucinare il budino di pane" : "Per cucinare servono pane, latte e uovo";
      if (premuto && stato.cucina()) aggiorna_hud();
    } else if (vicino(drago_x - 80)) {
      messaggio = stato.drago_sconfitto ? "Il drago è sazio! Raggiungi l’arrivo." : stato.cotto
        ? "Premi E per far mangiare il budino al drago" : "Il drago può essere sconfitto solo con il budino cucinato";
      if (premuto && stato.offri()) aggiorna_hud();
    } else if (meg.geometry.x > config.arrivo - 180 && !stato.drago_sconfitto) {
      messaggio = "Prima devi cucinare il budino e dopo farlo mangiare al drago";
    }
    invito.visibility.hidden = !messaggio;
    if (messaggio !== invito_precedente) {
      PP.shapes.text_change(invito, messaggio);
      invito_precedente = messaggio;
    }
    budino.setVisible(stato.cotto && !stato.drago_sconfitto);
    drago.setAlpha(stato.drago_sconfitto ? 0.55 : 1);
    if (stato.drago_sconfitto && !drago_mostrato_sconfitto) {
      PP.shapes.text_change(etichetta_drago, "Drago sconfitto · sazio di budino");
      drago_mostrato_sconfitto = true;
    }
  }
  aggiorna_hud();
  return { aggiorna, puo_completare: () => stato.cotto && stato.raccolti.size === 3 && stato.drago_sconfitto };
}
