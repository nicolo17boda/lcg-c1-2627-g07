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
// Otto posizioni iniziali: ogni topo pattuglia il terreno disponibile intorno
// al centro della coppia, rispettando vuoti, venditrice e checkpoint.
const PATTUGLIE_TOPI = [
  [460, 550], [1280, 1450], [1940, 2020], [2810, 2990],
  [3120, 3200], [3900, 4010], [4430, 4580], [4670, 4830],
];
const SUOLO = 620;
const DISTANZA_ISTRUZIONI = 200 + SPAZIO_INIZIALE;
// Vuoti da 140–160 px: attraversabili con il salto singolo da 340 px/s.
const TERRENI = [
  [0, 900], [1040, 610], [1800, 660],
  [2620, 660], [3440, 660], [4260, 740],
  // Le altre tre zone restano vuote, con il solo terreno provvisorio.
  ...ZONE.slice(1).map(zona => [zona.inizio, zona.fine - zona.inizio]),
];
// Tre deviazioni facoltative: rialzi da 140, 140 e 120 px.
// Sotto il primo appoggio restano 116 px liberi per Meg, alta 108 px.
const PIATTAFORME = [
  [600, 480, 160], [800, 340, 160], [1010, 220, 180],
  [2070, 480, 160], [2270, 340, 160], [2480, 220, 180],
  [3650, 480, 160], [3850, 340, 160], [4070, 220, 180],
];
const CHECKPOINT = [1100, 1860, 2680, 3500, 4320];
const RELIQUIE = [
  { x: 1100, y: 180 },
  { x: 2570, y: 180 },
  { x: 4160, y: 180 },
];
const MONETE_ESPLORAZIONE = [
  [680, 448], [880, 308], [1050, 188],
  [2150, 448], [2350, 308], [2520, 188],
  [3730, 448], [3930, 308], [4110, 188],
];
// Niente soffitti bassi che comprimano il nuovo ingombro dei personaggi.
const SOFFITTI = [];
const BATTUTE = [
  ["Venditrice", "La strada è lunga. Fai attenzione ai passaggi stretti."],
  ["Meg", "Devo affrontare tutti quei topi?"],
  ["Venditrice", "Puoi affrontarli oppure evitarli. Scegli tu la strada!"],
  ["Meg", "Allora mi metto in cammino!"],
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
