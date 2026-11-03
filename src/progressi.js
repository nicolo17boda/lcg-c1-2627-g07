// PP.game_state conserva i progressi soltanto nella RAM della pagina.
// Non usa localStorage, cookie o salvataggi su disco.
export function livello_sbloccato(numero) {
  if (!Number.isInteger(numero) || numero < 1 || numero > 4) return false;
  for (let precedente = 1; precedente < numero; precedente++) {
    if (PP.game_state.get_variable("livello" + precedente + "_completato") !== true) {
      return false;
    }
  }
  return true;
}

export function completa_livello(numero) {
  if (!livello_sbloccato(numero)) return false;
  PP.game_state.set_variable("livello" + numero + "_completato", true);
  PP.game_state.set_variable("mappa_da_partita", false);
  return true;
}

export function monete_totali() {
  let monete = PP.game_state.get_variable("monete");
  if (!Number.isInteger(monete) || monete < 0) {
    monete = 0;
    PP.game_state.set_variable("monete", monete);
  }
  return monete;
}

export function aggiungi_moneta() {
  const monete = monete_totali() + 1;
  PP.game_state.set_variable("monete", monete);
  return monete;
}
