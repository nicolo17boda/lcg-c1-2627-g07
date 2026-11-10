import {LARGHEZZA, ALTEZZA, font as FONT} from "./config.js";
import "./menu.js";
import "./scenes/achievement.js";
import "./scenes/livello1.js";
import "./scenes/livello2.js";
import "./scenes/livello3.js";
import "./scenes/livello4.js";
import "./scenes/mercato.js";
// Registrata dopo i livelli: quando è aperta come overlay viene disegnata sopra.
import "./mappa.js";

const config = {
    canvas_width: LARGHEZZA,
    canvas_height: ALTEZZA,
    canvas_id: "area_gioco",
    background_color: 0x202936,
    gravity_value: 2000,
    debug_mode: false,
};

function avvia() {
    PP.game.create(config);
}

document.fonts.load("24px " + FONT).then(avvia, avvia);
