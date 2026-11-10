import { DIMENSIONE_MONETA, COLORI } from "./config.js";

export function crea_monete(s, immagine) {
  const dinamiche = new Set();

  function allinea(moneta) {
    moneta.skin.geometry.x = moneta.geometry.x;
    moneta.skin.geometry.y = moneta.geometry.y;
  }

  return {
    crea(x, y, dinamica = false) {
      const moneta = PP.shapes.rectangle_add(s, x, y,
        DIMENSIONE_MONETA, DIMENSIONE_MONETA, COLORI.moneta, 0);
      PP.physics.add(s, moneta, dinamica ? PP.physics.type.DYNAMIC : PP.physics.type.STATIC);
      PP.physics.set_collision_rectangle(moneta, DIMENSIONE_MONETA, DIMENSIONE_MONETA, 0, 0);
      moneta.skin = PP.assets.image.add(s, immagine, x, y, 448 / 1001, 473.5 / 1001);
      moneta.skin.geometry.scale_x = DIMENSIONE_MONETA / 282;
      moneta.skin.geometry.scale_y = DIMENSIONE_MONETA / 282;
      if (dinamica) dinamiche.add(moneta);
      return moneta;
    },
    rimuovi(moneta) {
      dinamiche.delete(moneta);
      PP.shapes.destroy(moneta.skin);
      PP.shapes.destroy(moneta);
    },
    aggiorna() {
      for (const moneta of dinamiche) allinea(moneta);
    },
  };
}
