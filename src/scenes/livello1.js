import { registra_livello } from "../gameplay/livello.js";

// Coordinate, incontri e dialoghi specifici del livello 1.
const SPAZIO_INIZIALE = 600;
const LUNGHEZZA = 10000;
const PATTUGLIE_TOPI = [[760, 1040], [1980, 2170], [2920, 3100], [3750, 3990],
  [4750, 4950], [5480, 5660], [6150, 6400], [7350, 7540], [7760, 7990],
  [8660, 8930], [9400, 9520], [9620, 9730]];
const SUOLO = 620;
const DISTANZA_ISTRUZIONI = 400 + SPAZIO_INIZIALE;
const TERRENI = [
  [0, 780 + SPAZIO_INIZIALE],
  [960 + SPAZIO_INIZIALE, 700],
  [1840 + SPAZIO_INIZIALE, 720],
  [2740 + SPAZIO_INIZIALE, 860],
  [4580, 500], [5380, 420], [6060, 540], [7140, 1260],
  [8580, 500], [9280, 720],
];
const PIATTAFORME = [
  [980, 510, 140], [1200, 415, 130], [1440, 525, 100],
  [1770, 505, 150], [2320, 525, 100],
  [2670, 510, 150], [2910, 410, 140], [3220, 525, 100],
  [3550, 510, 150], [3780, 410, 140],
  // Belvedere: deviazione sopra la prima pattuglia, poi ritorno al percorso.
  [1470, 310, 120], [1690, 215, 170], [1930, 300, 100],
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
const CHECKPOINT = [1660, 2540, 3440, 4080, 5420, 6100, 7190, 8280, 9320];
const SPINE = [[1810, 70], [2720, 70], [3550, 80], [4640, 55],
  [6490, 80], [7600, 70], [8990, 60]];
const RELIQUIE = [
  { x: 1775, y: 180 },
  { x: 4935, y: 225 },
  { x: 6510, y: 155 },
];
const MONETE_ESPLORAZIONE = [
  [1510, 278], [1710, 183], [1960, 268],
  [4440, 418], [4650, 328], [4890, 228], [5140, 338],
  [6200, 238], [6410, 348], [6470, 158],
  [6870, 388], [8470, 498], [9170, 488],
];
const SOFFITTI = [[2040, 210], [5440, 350], [7290, 870], [9360, 440]];
const ARENE = [
  { x: 2220, topi: [1] },
  { x: 5780, topi: [5] },
  { x: 8160, topi: [7, 8] },
  { x: 9780, topi: [10, 11] },
];
const BATTUTE = [
  ["Venditrice", "La strada è lunga. Fai attenzione ai passaggi stretti."],
  ["Meg", "E se trovo un cancello chiuso?"],
  ["Venditrice", "Quei topi non lasciano passare nessuno. Dovrai affrontarli."],
  ["Meg", "Allora è il momento di liberare la strada!"],
];

registra_livello({
  numero: 1, nome: "livello1", partenza: 140, arrivo: 9860,
  lunghezza: LUNGHEZZA, suolo: SUOLO, fine_istruzioni: 140 + DISTANZA_ISTRUZIONI,
  terreni: TERRENI, piattaforme: PIATTAFORME, soffitti: SOFFITTI,
  checkpoint: CHECKPOINT, spine: SPINE, reliquie: RELIQUIE,
  monete: MONETE_ESPLORAZIONE, pattuglie: PATTUGLIE_TOPI, arene: ARENE,
  venditrice: { x: 440, battute: BATTUTE }, mercato: true,
});
