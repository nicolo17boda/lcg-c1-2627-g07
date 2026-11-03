import { LARGHEZZA, ALTEZZA, font as FONT } from "./config.js";

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
  testo(s, LARGHEZZA / 2, 190, "La Mamma dell'Ammazzadraghi", 56);
  crea_bottone(s, 370, "Storia", () => PP.scenes.start("storia"));
  crea_bottone(s, 475, "Gioca", () => {
    PP.game_state.set_variable("mappa_dal_menu", true);
    PP.game_state.set_variable("mappa_da_partita", false);
    PP.scenes.start("mappa");
  });
  testo(s, LARGHEZZA / 2, ALTEZZA - 24,
    "Politecnico di Milano - Gruppo 07 - Nicolò Boda, Cecilia Colombo, Carolina Sacco, Caterina Villa", 22);
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
  testo(s, LARGHEZZA / 2, y, etichetta, 36);
  PP.interactive.mouse.add(bottone, "pointerdown", azione);
  PP.interactive.mouse.add(bottone, "pointerover", () => {
    bottone.visibility.alpha = 0.7;
  });
  PP.interactive.mouse.add(bottone, "pointerout", () => {
    bottone.visibility.alpha = 1;
  });
}

function testo(s, x, y, contenuto, dimensione) {
  return PP.shapes.text_styled_add(s, x, y, contenuto,
    dimensione, FONT, "normal", BIANCO, null, 0.5, 0.5);
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
