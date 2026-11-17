import { adatta_testo } from "./gameplay/grafica.js";
import { LARGHEZZA, ALTEZZA, font as FONT, font_titolo as FONT_TITOLO } from "./config.js";

const BIANCO = "0xFFFFFF";
const SFONDI = ["0x17263D", "0x26304A", "0x243C40"];
const COLORE_BOTTONE = "0x435870";
const COLORE_STELLE = "0xCEDCEC";

// Per sostituire lo sfondo con un'animazione, inserire qui lo spritesheet
// e impostare le dimensioni dei fotogrammi, l'ultimo frame e la velocità.
const ANIMAZIONE_SFONDO = {
  percorso: null,
  larghezza: 1280,
  altezza: 720,
  ultimo_frame: 0,
  fps: 12,
};

let spritesheet_sfondo;
let stelle = [];

function preload(s) {
  spritesheet_sfondo = null;
  if (ANIMAZIONE_SFONDO.percorso) {
    spritesheet_sfondo = PP.assets.sprite.load_spritesheet(s,
      ANIMAZIONE_SFONDO.percorso,
      ANIMAZIONE_SFONDO.larghezza, ANIMAZIONE_SFONDO.altezza);
  }
}

function create(s) {
  crea_sfondo(s);
  testo(s, LARGHEZZA / 2, 190, "La Mamma dell'Ammazzadraghi", 56, FONT_TITOLO);
  crea_bottone(s, 370, "Storia", () => PP.scenes.start("storia"));
  crea_bottone(s, 475, "Gioca", () => PP.scenes.start("livello1"));
  crea_bottone(s, 580, "Crediti", () => PP.scenes.start("crediti"));
}

function crea_sfondo(s) {
  stelle = [];
  if (spritesheet_sfondo) {
    const sfondo = PP.assets.sprite.add(s, spritesheet_sfondo,
      LARGHEZZA / 2, ALTEZZA / 2, 0.5, 0.5);
    const scala = Math.max(LARGHEZZA / ANIMAZIONE_SFONDO.larghezza,
      ALTEZZA / ANIMAZIONE_SFONDO.altezza);
    sfondo.geometry.scale_x = scala;
    sfondo.geometry.scale_y = scala;
    PP.assets.sprite.animation_add(sfondo, "sfondo_menu",
      0, ANIMAZIONE_SFONDO.ultimo_frame, ANIMAZIONE_SFONDO.fps, -1);
    PP.assets.sprite.animation_play(sfondo, "sfondo_menu");
  } else {
    const colore = SFONDI[Math.floor(Math.random() * SFONDI.length)];
    PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
      LARGHEZZA, ALTEZZA, colore, 1);
    for (let i = 0; i < 55; i++) {
      const stella = PP.shapes.arc_add(s,
        Math.random() * LARGHEZZA, Math.random() * ALTEZZA,
        1 + Math.random() * 2, 0, 360, false, COLORE_STELLE,
        0.25 + Math.random() * 0.5);
      stelle.push({ forma: stella, velocita: 0.15 + Math.random() * 0.35 });
    }
  }
  // Velo per mantenere leggibili titolo e pulsanti anche con sfondi futuri.
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x000000", 0.25);
}

function crea_bottone(s, y, etichetta, azione) {
  const bottone = PP.shapes.rectangle_add(s, LARGHEZZA / 2, y,
    280, 76, COLORE_BOTTONE, 1);
  adatta_testo(testo(s, LARGHEZZA / 2, y, etichetta, 30), 232, 38);
  PP.interactive.mouse.add(bottone, "pointerdown", azione);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}

function testo(s, x, y, contenuto, dimensione, font = FONT) {
  return PP.shapes.text_styled_add(s, x, y, contenuto,
    dimensione, font, "normal", BIANCO, null, 0.5, 0.5);
}

function update(s) {
  for (const stella of stelle) {
    stella.forma.geometry.x += stella.velocita;
    if (stella.forma.geometry.x > LARGHEZZA + 3) {
      stella.forma.geometry.x = -3;
    }
  }
}

function destroy(s) {
  stelle = [];
}

PP.scenes.add("menu", preload, create, update, destroy);

// Schermata provvisoria: sostituire il messaggio con il racconto del gioco.
function crea_storia(s) {
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, SFONDI[0], 1);
  testo(s, LARGHEZZA / 2, 190, "Storia", 56);
  testo(s, LARGHEZZA / 2, 320, "La storia sarà disponibile prossimamente.", 30);
  crea_bottone(s, 500, "Torna al menu", () => PP.scenes.start("menu"));
}

PP.scenes.add("storia", () => {}, crea_storia, () => {}, () => {});

const ORO_CREDITI = "0xE9BD68";
let righe_crediti = [];
let scorrimento_crediti = 0;
let ritorno_crediti_programmato = false;
const FINE_CREDITI = 1480;
const CENTRO_CREDITI = 300;

function crea_crediti(s) {
  crea_sfondo(s);
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, ALTEZZA / 2,
    LARGHEZZA, ALTEZZA, "0x080D16", 0.65);
  righe_crediti = [];
  scorrimento_crediti = 0;
  ritorno_crediti_programmato = false;

  function riga(y, contenuto, dimensione, titolo = false, colore = BIANCO) {
    const oggetto = PP.shapes.text_styled_add(s, LARGHEZZA / 2, y,
      contenuto, dimensione, titolo ? FONT_TITOLO : FONT,
      "normal", colore, null, 0.5, 0.5);
    adatta_testo(oggetto, LARGHEZZA - 160, dimensione * 1.5);
    righe_crediti.push({ oggetto, y });
  }

  riga(160, "UN GIOCO DEL GRUPPO 07", 18, false, ORO_CREDITI);
  riga(240, "La Mamma", 76, true);
  riga(320, "dell'Ammazzadraghi", 76, true);
  riga(500, "CREATO DA", 20, false, ORO_CREDITI);
  ["Nicolò Boda", "Cecilia Colombo", "Carolina Sacco", "Caterina Villa"]
    .forEach((nome, indice) => riga(575 + indice * 66, nome, 36));
  riga(970, "POLITECNICO DI MILANO", 22, false, ORO_CREDITI);
  riga(1040, "Laboratorio di Game Design", 28);
  riga(1100, "Gruppo 07", 26);
  riga(FINE_CREDITI, "Grazie per aver giocato", 60, true, ORO_CREDITI);

  // Comandi fissi, separati dai titoli che scorrono sullo sfondo.
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, 665,
    LARGHEZZA, 110, "0x080D16", 1);
  PP.shapes.rectangle_add(s, LARGHEZZA / 2, 610,
    420, 1, ORO_CREDITI, 0.45);
  testo(s, LARGHEZZA / 2, 634, "Tieni premuto Spazio per accelerare · Esc per uscire", 17);
  const uscita = PP.shapes.rectangle_add(s, LARGHEZZA / 2, 680,
    260, 42, COLORE_BOTTONE, 1);
  testo(s, LARGHEZZA / 2, 680, "Torna al menu", 22);
  PP.interactive.mouse.add(uscita, "pointerdown", () => PP.scenes.start("menu"));
  PP.interactive.mouse.add(uscita, "pointerover", () => { uscita.visibility.alpha = 0.7; });
  PP.interactive.mouse.add(uscita, "pointerout", () => { uscita.visibility.alpha = 1; });
  posiziona_crediti();
}

function posiziona_crediti() {
  for (const { oggetto, y } of righe_crediti) {
    const posizione = y - scorrimento_crediti;
    oggetto.geometry.y = posizione;
    // Entrata e uscita graduali, senza tagliare bruscamente le righe.
    oggetto.visibility.alpha = Math.max(0, Math.min(1,
      (posizione - 45) / 70, (590 - posizione) / 70));
  }
}

function aggiorna_crediti(s) {
  update(s);
  if (PP.interactive.kb.is_key_just_down(s, PP.key_codes.ESC)) {
    PP.scenes.start("menu");
    return;
  }
  const velocita = PP.interactive.kb.is_key_down(s, PP.key_codes.SPACE) ? 150 : 36;
  scorrimento_crediti = Math.min(FINE_CREDITI - CENTRO_CREDITI,
    scorrimento_crediti + velocita / PP.game.get_physics_fps(s));
  posiziona_crediti();
  if (scorrimento_crediti === FINE_CREDITI - CENTRO_CREDITI && !ritorno_crediti_programmato) {
    ritorno_crediti_programmato = true;
    // Timer della scena: uscendo prima, Phaser lo elimina insieme ai crediti.
    PP.timers.add_timer(s, 5000, () => PP.scenes.start("menu"), false);
  }
}

function distruggi_crediti(s) {
  righe_crediti = [];
  destroy(s);
}

PP.scenes.add("crediti", preload, crea_crediti, aggiorna_crediti, distruggi_crediti);
