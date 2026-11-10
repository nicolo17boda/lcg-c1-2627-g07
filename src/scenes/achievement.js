import { LARGHEZZA, ALTEZZA } from "../config.js";
import { lista_achievement } from "../achievement.js";
import { testo, crea_barra, adatta_testo } from "../gameplay/grafica.js";
import { COLORI } from "../gameplay/config.js";

let pagina = 0;
let scheda = [];
let sbloccati;
let contatore;

function bottone(s, x, y, larghezza, etichetta, azione) {
  const corpo = PP.shapes.rectangle_add(s, x, y, larghezza, 64, "0x435870", 1);
  adatta_testo(testo(s, x, y, etichetta, 24), larghezza - 40, 32);
  PP.interactive.mouse.add(corpo, "pointerdown", azione);
  PP.interactive.mouse.add(corpo, "pointerover", () => { corpo.visibility.alpha = 0.7; });
  PP.interactive.mouse.add(corpo, "pointerout", () => { corpo.visibility.alpha = 1; });
}

function mostra(s) {
  for (const elemento of scheda) PP.shapes.destroy(elemento);
  const elenco = lista_achievement();
  const a = elenco[pagina];
  const colore = a.sbloccato ? COLORI.moneta : COLORI.terreno;
  // Il pannello viene creato prima degli elementi della scheda.
  scheda = [
    PP.shapes.rectangle_add(s, 640, 330, 760, 240, "0x293A4E", 1),
    PP.shapes.rectangle_add(s, 330, 300, 76, 76, colore, 1),
    testo(s, 330, 300, String(a.obiettivo), 32),
    testo(s, 660, 258, a.nome, 40),
    testo(s, 660, 306, a.descrizione, 26),
    testo(s, 660, 348, a.sbloccato ? "Sbloccato" : "Da conquistare", 22),
    testo(s, 934, 392, a.progresso + " / " + a.obiettivo, 22),
  ];
  const barra_visibile = crea_barra(s, 420, 392, 440, colore);
  barra_visibile.aggiorna(a.progresso / a.obiettivo);
  scheda.push(...barra_visibile.elementi);
  PP.shapes.text_change(sbloccati, elenco.filter(a => a.sbloccato).length + " / " + elenco.length + " sbloccati");
  PP.shapes.text_change(contatore, (pagina + 1) + " / " + elenco.length);
}

function create(s) {
  pagina = 0;
  scheda = [];
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, COLORI.sfondo, 1);
  testo(s, LARGHEZZA / 2, 110, "Achievement", 56);
  sbloccati = testo(s, LARGHEZZA / 2, 165, "", 24);
  contatore = testo(s, LARGHEZZA / 2, 492, "", 22);
  const quantita = lista_achievement().length;
  if (quantita > 1) {
    bottone(s, 380, 492, 190, "Precedente", () => { pagina = (pagina + quantita - 1) % quantita; mostra(s); });
    bottone(s, 900, 492, 190, "Successivo", () => { pagina = (pagina + 1) % quantita; mostra(s); });
  }
  bottone(s, LARGHEZZA / 2, 590, 280, "Torna al menu", () => PP.scenes.start("menu"));
  mostra(s);
}

function update(s) {
  if (PP.interactive.kb.is_key_just_down(s, PP.key_codes.ESC)) PP.scenes.start("menu");
}

PP.scenes.add("achievement", () => {}, create, update, () => { scheda = []; });
