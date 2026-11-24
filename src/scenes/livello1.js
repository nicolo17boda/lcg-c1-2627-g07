import { registra_livello } from "../gameplay/livello.js";

// Un unico livello continuo: ogni zona occupa 5.000 px.
const SPAZIO_INIZIALE = 300;
const LUNGHEZZA_ZONA = 5000;
const LUNGHEZZA = LUNGHEZZA_ZONA * 4;
const ZONE = [
  { inizio: 0, fine: 5000, skin: "paese", sfondo: "provasfondo1" },
  { inizio: 5000, fine: 10000, skin: null, sfondo: null },
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
  ...ZONE.slice(1).map(zona => [zona.inizio, zona.fine - zona.inizio]),
];
// Rialzi da 220 px richiedono il doppio salto. Ogni terrazza offre
// spazio per atterrare e attendere i 2 secondi di recupero.
const PIATTAFORME = [
  [650, 400, 230], [1040, 180, 260],
  [2220, 400, 260], [2600, 180, 260],
  [4050, 400, 190], [4350, 180, 260],
];
const CHECKPOINT = [1180, 2060, 2980, 3880, 4700];
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
];
// Niente soffitti bassi che comprimano il nuovo ingombro dei personaggi.
const SOFFITTI = [];
const BATTUTE = [
  ["Venditrice", "I vuoti si allargano: usa il doppio salto!"],
  ["Meg", "Devo affrontare tutti quei topi?"],
];

registra_livello({
  nome: "livello1", partenza: 110, arrivo: LUNGHEZZA - 70,
  zone: ZONE,
  skin_terreni: "paese",
  lunghezza: LUNGHEZZA, suolo: SUOLO, fine_istruzioni: 110 + DISTANZA_ISTRUZIONI,
  terreni: TERRENI, piattaforme: PIATTAFORME, soffitti: SOFFITTI,
  checkpoint: CHECKPOINT, reliquie: RELIQUIE,
  monete: MONETE_ESPLORAZIONE, pattuglie: PATTUGLIE_TOPI,
  venditrice: { x: 220, battute: BATTUTE }, mercato: true,
});
