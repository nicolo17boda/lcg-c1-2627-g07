import { completa_livello } from "../progressi.js";
import { crea_livello_in_preparazione } from "./livello_in_preparazione.js";

function preload(s) {}

function create(s) {
  crea_livello_in_preparazione(s, 3);
}

// Collegare questa funzione alla collisione con l'arrivo quando il livello sarà costruito.
export function completa() {
  if (completa_livello(3)) PP.scenes.start("mappa");
}

function update(s) {}
function destroy(s) {}

PP.scenes.add("livello3", preload, create, update, destroy);
