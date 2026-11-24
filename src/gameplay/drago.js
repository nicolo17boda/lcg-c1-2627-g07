import { testo } from "./grafica.js";

const INTERVALLO_FUOCO = 2200;
const PORTATA_FUOCO = 1600;
const VELOCITA_FUOCO = 500;
const VELOCITA_BUDINO = 620;
const RAGGIO_INTERAZIONE = 220;

export function crea_drago(s, {
  config, meg, stato, blocchi, bloccato, on_colpito, on_lancia_budino,
}) {
  const drago_x = config.zone[3].fine - 550;
  const suolo = config.suolo;
  const drago = s.add.graphics({ x: drago_x, y: suolo });
  drago.fillStyle(0x314d42).fillTriangle(-15, -90, -100, -230, 50, -150);
  drago.fillStyle(0x6e9b69).fillEllipse(0, -75, 180, 130);
  drago.fillStyle(0x527c58).fillTriangle(60, -60, 155, -15, 30, -20);
  drago.fillStyle(0x6e9b69).fillRoundedRect(-100, -180, 80, 96, 14);
  drago.fillStyle(0x96b37b).fillRoundedRect(-140, -150, 76, 42, 8);
  drago.fillStyle(0xf2df9a).fillTriangle(-90, -177, -80, -212, -68, -177);
  drago.fillStyle(0xf1c85e).fillRect(-92, -162, 13, 9);
  drago.fillStyle(0x1d2938).fillRect(-90, -162, 4, 9);
  drago.fillStyle(0x3e6048).fillRect(-60, -28, 45, 28).fillRect(30, -28, 45, 28);
  const etichetta = testo(s, drago_x, suolo - 250, "Drago · E lancia il budino", 21);
  const palle_fuoco = new Set();
  let recupero_fuoco = INTERVALLO_FUOCO;
  let mostrato_sconfitto = false;
  let era_in_portata = false;
  let budino_lanciato = null;

  function rimuovi_palla(palla) {
    if (!palle_fuoco.delete(palla)) return;
    for (const collisione of palla.collisioni) {
      PP.physics.remove_collider_or_overlap(s, collisione);
    }
    PP.shapes.destroy(palla.corpo);
    palla.skin.destroy();
  }

  function spara_palla() {
    const direzione = meg.geometry.x < drago_x ? -1 : 1;
    const x = drago_x + direzione * 112;
    const y = suolo - 100;
    const corpo = PP.shapes.rectangle_add(s, x, y, 28, 28, "0x000000", 0);
    PP.physics.add(s, corpo, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(corpo, false);
    const skin = s.add.graphics();
    skin.fillStyle(0xd94f2b).fillCircle(0, 0, 15);
    skin.fillStyle(0xffa34a).fillCircle(-3, 0, 10);
    skin.fillStyle(0xffe39a).fillCircle(-5, 0, 5);
    skin.fillStyle(0xff7a31).fillTriangle(10, -8, 25, 0, 10, 8);
    skin.setPosition(x, y).setScale(direzione < 0 ? 1 : -1, 1);
    const palla = { corpo, skin, direzione, restante: 3000, collisioni: [] };
    palle_fuoco.add(palla);
    for (const blocco of blocchi) {
      palla.collisioni.push(PP.physics.add_collider_f(s, corpo, blocco,
        () => rimuovi_palla(palla)));
    }
    palla.collisioni.push(PP.physics.add_overlap_f(s, corpo, meg, () => {
      if (bloccato() || !palle_fuoco.has(palla)) return;
      rimuovi_palla(palla);
      on_colpito();
    }));
    PP.physics.set_velocity_x(corpo, direzione * VELOCITA_FUOCO);
  }

  function rimuovi_budino_lanciato() {
    const lancio = budino_lanciato;
    if (!lancio) return;
    lancio.skin.destroy();
    budino_lanciato = null;
  }

  function lancia_budino() {
    const direzione = meg.geometry.x < drago_x ? 1 : -1;
    const x = meg.geometry.x;
    const y = meg.geometry.y - 24;
    const skin = s.add.image(x, y, "ricetta-budino-cotto").setDepth(50);
    const lancio = { x, y, skin, direzione, restante: 2000 };
    budino_lanciato = lancio;
    on_lancia_budino();
  }

  function aggiorna_palle(delta, fermo) {
    for (const palla of palle_fuoco) {
      PP.physics.set_velocity_x(palla.corpo,
        fermo ? 0 : palla.direzione * VELOCITA_FUOCO);
      if (fermo) continue;
      palla.skin.setPosition(palla.corpo.geometry.x, palla.corpo.geometry.y);
      if ((palla.restante -= delta) <= 0) rimuovi_palla(palla);
    }
  }

  function aggiorna(delta, premuto = false) {
    const vicino = Math.abs(meg.geometry.x - drago_x) < RAGGIO_INTERAZIONE
      && Math.abs(meg.geometry.y - (suolo - 54)) < 110;
    if (!bloccato() && vicino && premuto && stato.cotto
        && !stato.drago_sconfitto && !budino_lanciato) lancia_budino();
    if (stato.drago_sconfitto && !mostrato_sconfitto) {
      PP.shapes.text_change(etichetta, "Drago sconfitto · sazio di budino");
      mostrato_sconfitto = true;
    }
    drago.setAlpha(stato.drago_sconfitto ? 0.55 : 1);

    const fermo = bloccato() || stato.drago_sconfitto;
    aggiorna_palle(delta, fermo);
    if (budino_lanciato) {
      if (!fermo) {
        const lancio = budino_lanciato;
        const distanza_prima = lancio.x - drago_x;
        lancio.x += lancio.direzione * VELOCITA_BUDINO * delta / 1000;
        const distanza_dopo = lancio.x - drago_x;
        lancio.skin.setPosition(lancio.x, lancio.y);
        lancio.skin.rotation += lancio.direzione * delta * 0.001;
        const colpito = distanza_prima === 0 || distanza_prima * distanza_dopo <= 0;
        if (colpito && stato.offri()) rimuovi_budino_lanciato();
        else if ((lancio.restante -= delta) <= 0) rimuovi_budino_lanciato();
      }
    }
    if (stato.drago_sconfitto) {
      for (const palla of palle_fuoco) rimuovi_palla(palla);
    } else if (!fermo) {
      const in_portata = Math.abs(meg.geometry.x - drago_x) <= PORTATA_FUOCO;
      if (!in_portata) {
        recupero_fuoco = INTERVALLO_FUOCO;
        era_in_portata = false;
      } else {
        if (!era_in_portata) recupero_fuoco = 0;
        era_in_portata = true;
        recupero_fuoco -= delta;
        if (recupero_fuoco <= 0) {
          spara_palla();
          recupero_fuoco = INTERVALLO_FUOCO;
        }
      }
    }

    if (bloccato() || !vicino) return "";
    if (stato.drago_sconfitto) return "Il drago è sazio! Raggiungi l’arrivo.";
    if (budino_lanciato) return "Il budino vola verso il drago!";
    return stato.cotto
      ? "Premi E per lanciare il budino al drago"
      : "Il drago può essere sconfitto solo con il budino cucinato";
  }

  return {
    aggiorna,
    distruggi() {
      for (const palla of palle_fuoco) rimuovi_palla(palla);
      rimuovi_budino_lanciato();
    },
  };
}
