import { registra_livello } from "../gameplay/livello.js";

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
  [650, 400, 230], [1040, 180, 260],
  [2220, 400, 260], [2600, 180, 260],
  [4050, 400, 190], [4350, 180, 260],
  [5850, 440, 230], [7100, 420, 260], [8330, 440, 220], [9540, 420, 260],
];
const ARCIERI = [[5620], [6820], [8000], [9360], [9810]];
const CHECKPOINT = [2060, 3880];
// Limiti espliciti evitano che più topi si ammassino sullo stesso bordo.
// I grandi richiedono due colpi e non sono schiacciabili; le pattuglie
// sulle terrazze obbligano a preparare l'atterraggio con la padella.
const PATTUGLIE_TOPI = [
  [530, 790, { grande: false, velocita: 0.65 }],
  [1300, 1450, { grande: false, velocita: 0.75 }],
  [1500, 1620, { grande: true, velocita: 0.6, direzione: -1 }],
  [1100, 1240, { quota: 180, grande: false, velocita: 0.5 }],
  [2170, 2320, { grande: true, velocita: 0.65 }],
  [2390, 2520, { grande: false, velocita: 0.85, direzione: -1 }],
  [2280, 2420, { quota: 400, grande: false, velocita: 0.55 }],
  [2660, 2800, { quota: 180, grande: true, velocita: 0.45 }],
  [3100, 3240, { grande: false, velocita: 0.9 }],
  [3290, 3400, { grande: true, velocita: 0.65, direzione: -1 }],
  [4010, 4100, { grande: true, velocita: 0.6 }],
  [4170, 4240, { grande: false, velocita: 0.85, direzione: -1 }],
  [4110, 4190, { quota: 400, grande: false, velocita: 0.55 }],
  [4410, 4550, { quota: 180, grande: true, velocita: 0.45 }],
  [4810, 4940, { grande: true, velocita: 0.7, direzione: -1 }],
];
const RELIQUIE = [
  { x: 1270, y: 140 },
  { x: 2830, y: 140 },
  { x: 4580, y: 140 },
];
const MONETE_ESPLORAZIONE = [
  [700, 368], [830, 368], [1070, 148],
  [2270, 368], [2450, 368], [2630, 148],
  [4100, 368], [4210, 368], [4380, 148],
  [5900, 408], [6020, 408], [7160, 388], [7290, 388],
  [8380, 408], [8490, 408], [9600, 388], [9740, 388],
];

const SOFFITTI = [];
const BATTUTE = [
  ["Venditrice", "Ho bisogno di aiuto, ti ricompenseò!"],
  ["Meg", "Devo affrontare tutti quei topi?"],
  ["Venditrice", "Si purtroppo"],
  ["Meg", "Li sconfiggerò tutti"],
];

registra_livello({
  nome: "livello1", partenza: 110, arrivo: LUNGHEZZA - 70,
  zone: ZONE,
  skin_terreni: "paese",
  lunghezza: LUNGHEZZA, suolo: SUOLO, fine_istruzioni: 110 + DISTANZA_ISTRUZIONI,
  terreni: TERRENI, piattaforme: PIATTAFORME, soffitti: SOFFITTI,
  checkpoint: CHECKPOINT, reliquie: RELIQUIE,
  arcieri: ARCIERI,
  monete: MONETE_ESPLORAZIONE, pattuglie: PATTUGLIE_TOPI,
  venditrice: { x: 220, battute: BATTUTE }, mercato: true,
});
