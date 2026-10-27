import { LARGHEZZA, ALTEZZA, FONT } from "./config.js";
import "./scenes/menu.js";
import "./scenes/storia.js";
import "./scenes/neve.js";
import "./scenes/bosco.js";
import "./scenes/pausa.js";
import "./scenes/fine.js";

const config = {
  canvas_width: LARGHEZZA,
  canvas_height: ALTEZZA,
  canvas_id: "area_gioco",
  background_color: 0x4A6FA5,
  gravity_value: 2000,
  debug_mode: false,
};

function avvia() {
  PP.game.create(config);
}

document.fonts.load("16px " + FONT).then(avvia, avvia);
