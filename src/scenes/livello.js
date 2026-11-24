import { registra_livello } from "../gameplay/livello.js?v=budino-1";

// Un unico livello continuo: ogni zona occupa 5.000 px.
const SPAZIO_INIZIALE = 300;
const LUNGHEZZA_ZONA = 5000;
const LUNGHEZZA = LUNGHEZZA_ZONA * 4;
const ZONE = [
  { inizio: 0, fine: 5000, skin: "paese", sfondo: "provasfondo1" },
  { inizio: 5000, fine: 10000, skin: "roccia", sfondo: "provasfondo1" },
  { inizio: 10000, fine: 15000, skin: null, sfondo: null },
  { inizio: 15000, fine: 20000, skin: null, sfondo: null },
];
const SUOLO = 620;
const DISTANZA_ISTRUZIONI = 200 + SPAZIO_INIZIALE;
// Dal primo salto di riscaldamento ai vuoti da 320–360 px: il salto
// singolo copre circa 265 px, il doppio circa 450 px (gravità 2000).
const TERRENI = [
  [0, 900], [1120, 560], [2000, 580],
  [2920, 540], [3820, 480], [4640, 360],
  [5000, 1100], [6320, 1000], [7580, 1000], [8840, 1160],
  ...ZONE.slice(2).map(zona => [zona.inizio, zona.fine - zona.inizio]),
];
// Rialzi da 220 px richiedono il doppio salto. Ogni terrazza offre
// spazio per atterrare e attendere i 2 secondi di recupero.
const PIATTAFORME = [
  [930, 400, 220], [1248, 280, 220],
  [1864, 400, 220], [2289, 255, 100], [2656, 470, 220],
  [3110, 400, 100], [3468, 490, 220], [3825, 300, 100],
  [4229, 164, 220], [4672, 470, 220],
  // Zona 2
  [5808, 465, 100], [6110, 320, 220], [6452, 400, 100],
  [6748, 250, 220], [7525, 450, 220], [7921, 300, 220],
  [8424, 400, 100], [8845, 470, 100], [9370, 324, 220],
  [9778, 400, 220],
  // Zona 3
  [10816, 450, 100], [11139, 340, 220], [11523, 445, 100],
  [11871, 290, 220], [12404, 423, 100], [12769, 310, 220],
  [13213, 470, 100], [13726, 450, 220], [14288, 350, 100],
  [14643, 220, 100],
  // Zona 4
  [15370, 490, 220], [15760, 260, 220], [16080, 420, 100],
  [16473, 300, 220], [16844, 490, 200], [17323, 370, 100],
  [17810, 490, 220],
];
const ARCIERI = [
  [5620], [6858, 250], [8031, 300], [9480, 324], [9888, 400],
];
const CHECKPOINT = [2060, 4969, 7060, 9960, 12060, 14960, 17060,];
const PATTUGLIE_TOPI = [
  [530, 790, { grande: false, velocita: 0.65 }],
  [3100, 3240, { grande: true, velocita: 0.7 }],
  [980, 1100, { quota: 400, grande: false, velocita: 0.55 }],
  [1920, 2020, { quota: 400, grande: true, velocita: 0.45 }],
];
const RELIQUIE = [];
const MONETE_ESPLORAZIONE = [];

const SOFFITTI = [];
const BATTUTE = [
  ["Venditrice", "Ho bisogno di aiuto, ti ricompenseò!"],
  ["Meg", "Devo affrontare tutti quei topi?"],
  ["Venditrice", "Si purtroppo"],
  ["Meg", "Li sconfiggerò tutti"],
];

registra_livello({
  nome: "livello", partenza: 110, arrivo: LUNGHEZZA - 70,
  zone: ZONE,
  skin_terreni: "paese",
  lunghezza: LUNGHEZZA, suolo: SUOLO, fine_istruzioni: 110 + DISTANZA_ISTRUZIONI,
  terreni: TERRENI, piattaforme: PIATTAFORME, soffitti: SOFFITTI,
  checkpoint: CHECKPOINT, reliquie: RELIQUIE,
  arcieri: ARCIERI,
  monete: MONETE_ESPLORAZIONE, pattuglie: PATTUGLIE_TOPI,
  venditrice: { x: 220, battute: BATTUTE }, mercato: true,
});
