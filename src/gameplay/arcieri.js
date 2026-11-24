import { A_MEG, VITA_TOPO, DANNO_ATTACCO } from "./config.js";

const ALTEZZA = A_MEG + 12;
const LARGHEZZA = 44;
const INTERVALLO = 2400;
const PREAVVISO = 450;
const PORTATA = 650;
const VELOCITA_FRECCIA = 360;

// Sagoma pixel art provvisoria: cappuccio, tunica, faretra e arco.
function prepara_texture(s) {
  if (s.textures.exists("arciere")) return;
  const g = s.make.graphics({ x: 0, y: 0, add: false });
  const blocco = (colore, x, y, w, h) => g.fillStyle(colore).fillRect(x, y, w, h);
  blocco(0x263c35, 12, 0, 24, 28);
  blocco(0xcda477, 22, 8, 14, 16);
  blocco(0x19272c, 32, 12, 4, 4);
  blocco(0x416751, 12, 28, 24, 52);
  blocco(0x304b3d, 8, 44, 8, 40);
  blocco(0x9c7048, 8, 64, 28, 8);
  blocco(0xcda477, 28, 36, 20, 8);
  blocco(0x594537, 12, 80, 8, 32);
  blocco(0x594537, 28, 80, 8, 32);
  blocco(0x263038, 8, 112, 16, 8);
  blocco(0x263038, 28, 112, 16, 8);
  blocco(0x704c35, 2, 24, 8, 40);
  blocco(0xd7d7bc, 4, 12, 2, 20);
  blocco(0xd7d7bc, 8, 16, 2, 16);
  g.lineStyle(3, 0xc49b64).beginPath().moveTo(46, 20)
    .lineTo(54, 36).lineTo(54, 56).lineTo(46, 72).strokePath();
  g.lineStyle(1, 0xe4dab7).lineBetween(46, 20, 46, 72);
  g.generateTexture("arciere", 58, 120);
  g.destroy();
}

export function crea_arcieri(s, { meg, postazioni, suolo, blocchi, bloccato,
  on_contatto, on_morte, on_freccia }) {
  prepara_texture(s);
  const frecce = new Set();
  const elenco = postazioni.map(([x, quota = suolo], indice) => {
    const corpo = PP.shapes.rectangle_add(s, x, quota - ALTEZZA / 2,
      LARGHEZZA, ALTEZZA, "0x000000", 0);
    PP.physics.add(s, corpo, PP.physics.type.STATIC);
    const nemico = {
      id: "arciere-" + indice, tipo: "arciere", corpo,
      larghezza: LARGHEZZA, altezza: ALTEZZA, grande: true,
      vita: VITA_TOPO * 2, vita_max: VITA_TOPO * 2, immune: 0,
      recupero: INTERVALLO, direzione: -1,
      skin: s.add.image(x, quota, "arciere").setOrigin(0.5, 1).setFlipX(true),
      fondo_barra: s.add.rectangle(x, quota - ALTEZZA - 12, 48, 8, 0x392c35),
      barra: s.add.rectangle(x - 22, quota - ALTEZZA - 12, 44, 4, 0x85db9b).setOrigin(0, 0.5),
    };
    PP.physics.add_overlap_f(s, meg, corpo, () => on_contatto(nemico));
    return nemico;
  });

  function rimuovi(freccia) {
    if (!frecce.delete(freccia)) return;
    for (const collisione of freccia.collisioni) PP.physics.remove_collider_or_overlap(s, collisione);
    PP.shapes.destroy(freccia.corpo);
    freccia.skin.destroy();
  }

  function spara(nemico) {
    const x = nemico.corpo.geometry.x + nemico.direzione * 38;
    const y = nemico.corpo.geometry.y - 16;
    const corpo = PP.shapes.rectangle_add(s, x, y, 30, 8, "0x000000", 0);
    PP.physics.add(s, corpo, PP.physics.type.DYNAMIC);
    PP.physics.set_allow_gravity(corpo, false);
    const skin = s.add.graphics();
    skin.lineStyle(3, 0xd8bc83).lineBetween(-15, 0, 12, 0);
    skin.fillStyle(0xe1e7ec).fillTriangle(18, 0, 8, -5, 8, 5);
    skin.lineStyle(2, 0xf2eee2).lineBetween(-14, -4, -8, 0).lineBetween(-14, 4, -8, 0);
    skin.setPosition(x, y).setScale(nemico.direzione, 1);
    const freccia = { corpo, skin, direzione: nemico.direzione, restante: 2600, collisioni: [] };
    frecce.add(freccia);
    for (const blocco of blocchi) {
      freccia.collisioni.push(PP.physics.add_collider_f(s, corpo, blocco, () => rimuovi(freccia)));
    }
    freccia.collisioni.push(PP.physics.add_overlap_f(s, corpo, meg, () => {
      if (bloccato() || !frecce.has(freccia)) return;
      rimuovi(freccia);
      on_freccia();
    }));
    PP.physics.set_velocity_x(corpo, freccia.direzione * VELOCITA_FRECCIA);
  }

  function aggiorna(delta) {
    const fermo = bloccato();
    for (const freccia of frecce) {
      PP.physics.set_velocity_x(freccia.corpo, fermo ? 0 : freccia.direzione * VELOCITA_FRECCIA);
      freccia.skin.setPosition(freccia.corpo.geometry.x, freccia.corpo.geometry.y);
      if (!fermo && (freccia.restante -= delta) <= 0) rimuovi(freccia);
    }
    if (fermo) return;
    for (const nemico of elenco) {
      if (nemico.vita <= 0) continue;
      nemico.immune = Math.max(0, nemico.immune - delta);
      nemico.skin.setAlpha(nemico.immune ? 0.5 : 1);
      const dx = meg.geometry.x - nemico.corpo.geometry.x;
      if (Math.abs(dx) > PORTATA || meg.geometry.x < 5000 || meg.geometry.x >= 10000) {
        nemico.recupero = INTERVALLO;
        nemico.skin.clearTint();
        continue;
      }
      nemico.direzione = dx < 0 ? -1 : 1;
      nemico.skin.setFlipX(nemico.direzione < 0);
      nemico.recupero -= delta;
      if (nemico.recupero <= PREAVVISO) nemico.skin.setTint(0xffd58a);
      else nemico.skin.clearTint();
      if (nemico.recupero <= 0) {
        spara(nemico);
        nemico.recupero = INTERVALLO;
      }
    }
  }

  function danneggia(nemico, danno = DANNO_ATTACCO, ignora_immunita = false) {
    if (bloccato() || nemico.vita <= 0 || (nemico.immune && !ignora_immunita)) return;
    nemico.vita = Math.max(0, nemico.vita - danno);
    nemico.barra.setScale(nemico.vita / nemico.vita_max, 1);
    if (nemico.vita === 0) {
      on_morte(nemico);
      PP.shapes.destroy(nemico.corpo);
      nemico.skin.destroy();
      nemico.barra.destroy();
      nemico.fondo_barra.destroy();
    } else nemico.immune = 250;
  }

  return { elenco, aggiorna, danneggia,
    distruggi() { for (const freccia of frecce) rimuovi(freccia); } };
}
