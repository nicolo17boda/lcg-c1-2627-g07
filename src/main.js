import {LARGHEZZA, ALTEZZA, font as FONT, font_titolo as FONT_TITOLO} from "./config.js";
import "./menu.js";
import "./scenes/livello.js?v=budino-lancio-2";
import "./scenes/mercato.js?v=padella-argentata-1";
import { registra_pausa } from "./scenes/pausa.js";

registra_pausa();

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

Promise.all([
    document.fonts.load("24px " + FONT),
    document.fonts.load("24px " + FONT_TITOLO),
]).then(avvia, avvia);
