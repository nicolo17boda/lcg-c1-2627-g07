// PP.game_state conserva i progressi soltanto nella RAM della pagina.
// Non usa localStorage, cookie o salvataggi su disco.
export const COSTO_PADELLA_ARGENTATA = 50;

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

export function padella_argentata_acquistata() {
  return PP.game_state.get_variable("padella_argentata") === true;
}

export function acquista_padella_argentata() {
  if (padella_argentata_acquistata() || monete_totali() < COSTO_PADELLA_ARGENTATA) {
    return false;
  }
  rimuovi_monete(COSTO_PADELLA_ARGENTATA);
  PP.game_state.set_variable("padella_argentata", true);
  return true;
}

export function rimuovi_monete(quantita) {
  if (!Number.isInteger(quantita) || quantita < 0) return monete_totali();
  const monete = Math.max(0, monete_totali() - quantita);
  PP.game_state.set_variable("monete", monete);
  return monete;
}
