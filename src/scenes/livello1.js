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
const PATTUGLIE_TOPI = [[380, 520], [990, 1085], [1460, 1550], [1875, 1995],
  [2375, 2475], [2740, 2830], [3075, 3200], [3675, 3770], [3880, 3995],
  [4330, 4465], [4700, 4760], [4810, 4865]];
const SUOLO = 620;
const DISTANZA_ISTRUZIONI = 200 + SPAZIO_INIZIALE;
const TERRENI = [
  [0, 390 + SPAZIO_INIZIALE],
  [480 + SPAZIO_INIZIALE, 350],
  [920 + SPAZIO_INIZIALE, 360],
  [1370 + SPAZIO_INIZIALE, 430],
  [2290, 250], [2690, 210], [3030, 270], [3570, 630],
  [4290, 250], [4640, 360],
  // Appoggi provvisori per attraversare le tre zone ancora da costruire.
  ...ZONE.slice(1).map(zona => [zona.inizio, zona.fine - zona.inizio]),
];
const PIATTAFORME = [
  [490, 510, 70], [600, 415, 65], [720, 525, 50],
  [885, 505, 75], [1160, 525, 50],
  [1335, 510, 75], [1455, 410, 70], [1610, 525, 50],
  [1775, 510, 75], [1890, 410, 70],
  // Belvedere: deviazione sopra la prima pattuglia, poi ritorno al percorso.
  [735, 310, 60], [845, 215, 85], [965, 300, 50],
  // Gola: appoggi stretti e quote alternate; ogni appoggio permette di ricaricare.
  [4210, 530, 90], [4400, 450, 85], [4610, 360, 110],
  [4860, 260, 150], [5100, 370, 90], [5210, 520, 85],
  [5890, 520, 80],
  // Rovine: percorso basso pericoloso oppure salita verso la terza reliquia.
  [6170, 490, 100], [6370, 380, 90], [6160, 270, 120],
  [6430, 190, 160], [6650, 510, 80], [6830, 420, 80],
  [7010, 510, 80],
  [8430, 530, 80], [9130, 520, 85],
];
const CHECKPOINT = [830, 1270, 1720, 2040, 2710, 3050, 3595, 4140, 4660];
const RELIQUIE = [
  { x: 887.5, y: 180 },
  { x: 2467.5, y: 225 },
  { x: 3255, y: 155 },
];
const MONETE_ESPLORAZIONE = [
  [755, 278], [855, 183], [980, 268],
  [2220, 418], [2325, 328], [2445, 228], [2570, 338],
  [3100, 238], [3205, 348], [3235, 158],
  [3435, 388], [4235, 498], [4585, 488],
];
const SOFFITTI = [[1020, 105], [2720, 175], [3645, 435], [4680, 220]];
const ARENE = [
  { x: 1110, topi: [1] },
  { x: 2890, topi: [5] },
  { x: 4080, topi: [7, 8] },
  { x: 4890, topi: [10, 11] },
];
const BATTUTE = [
  ["Venditrice", "La strada è lunga. Fai attenzione ai passaggi stretti."],
  ["Meg", "E se trovo un cancello chiuso?"],
  ["Venditrice", "Quei topi non lasciano passare nessuno. Dovrai affrontarli."],
  ["Meg", "Allora è il momento di liberare la strada!"],
];

registra_livello({
  nome: "livello1", partenza: 70, arrivo: LUNGHEZZA - 70,
  zone: ZONE,
  skin_terreni: "paese",
  lunghezza: LUNGHEZZA, suolo: SUOLO, fine_istruzioni: 70 + DISTANZA_ISTRUZIONI,
  terreni: TERRENI, piattaforme: PIATTAFORME, soffitti: SOFFITTI,
  checkpoint: CHECKPOINT, reliquie: RELIQUIE,
  monete: MONETE_ESPLORAZIONE, pattuglie: PATTUGLIE_TOPI, arene: ARENE,
  venditrice: { x: 220, battute: BATTUTE }, mercato: true,
});
