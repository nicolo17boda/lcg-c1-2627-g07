// Catalogo e progressi condivisi: aggiungere qui i futuri achievement.
// Come gli altri progressi, restano nella RAM della pagina per la sessione.
const CATALOGO = [
  { id: "tesoriere", nome: "Tesoriere", descrizione: "Raccogli 30 monete",
    statistica: "monete_raccolte", obiettivo: 30 },
];
const CHIAVE = "achievement_progressi";
const CODA = "achievement_notifiche";

function stato() {
  let dati = PP.game_state.get_variable(CHIAVE);
  if (!dati) {
    dati = { statistiche: {}, sbloccati: [] };
    PP.game_state.set_variable(CHIAVE, dati);
  }
  return dati;
}

export function lista_achievement() {
  const dati = stato();
  return CATALOGO.map(a => ({ ...a,
    progresso: Math.min(a.obiettivo, dati.statistiche[a.statistica] || 0),
    sbloccato: dati.sbloccati.includes(a.id),
  }));
}

export function registra_progresso_achievement(statistica, quantita = 1) {
  if (!Number.isInteger(quantita) || quantita <= 0) return;
  const dati = stato();
  dati.statistiche[statistica] = (dati.statistiche[statistica] || 0) + quantita;
  const coda = PP.game_state.get_variable(CODA) || [];
  for (const a of CATALOGO) {
    if (a.statistica !== statistica || dati.sbloccati.includes(a.id)
        || dati.statistiche[statistica] < a.obiettivo) continue;
    dati.sbloccati.push(a.id);
    coda.push(a.id);
  }
  PP.game_state.set_variable(CHIAVE, dati);
  PP.game_state.set_variable(CODA, coda);
}

export function prossima_notifica_achievement() {
  const coda = PP.game_state.get_variable(CODA) || [];
  const id = coda.shift();
  PP.game_state.set_variable(CODA, coda);
  return CATALOGO.find(a => a.id === id);
}
