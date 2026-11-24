// Gli export contengono una striscia verticale dentro una tavola quadrata.
// Ritaglia la grafica in memoria, lasciando intatti i file originali.
export function prepara_skin_terreni(s, immagini) {
  const skin = {};
  for (const [tipo, nome] of Object.entries({
    roccia: "terreni-01", piattaforma: "terreni-02", suolo: "terreni-03",
    paese: "terra paese", zona1: "terreno_zona1-1",
  })) {
    const chiave = nome + "-ritaglio";
    if (!s.textures.exists(chiave)) {
      const sorgente = s.textures.get(immagini[nome].id).getSourceImage();
      const canvas = document.createElement("canvas");
      canvas.width = sorgente.width;
      canvas.height = sorgente.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(sorgente, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = pixels;
      let sx = canvas.width, sy = canvas.height, dx = -1, dy = -1;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (data[i + 3] < 128 ||
              (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245)) {
            data[i + 3] = 0;
            continue;
          }
          sx = Math.min(sx, x); sy = Math.min(sy, y);
          dx = Math.max(dx, x); dy = Math.max(dy, y);
        }
      }
      if (dx < sx) throw new Error("Skin terreno vuota: " + nome);
      ctx.putImageData(pixels, 0, 0);
      const texture = s.textures.createCanvas(chiave, dx - sx + 1, dy - sy + 1);
      texture.getContext().drawImage(canvas, sx, sy, dx - sx + 1, dy - sy + 1,
        0, 0, dx - sx + 1, dy - sy + 1);
      texture.refresh();
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    skin[tipo] = chiave;
  }
  return skin;
}

export function disegna_terreno(s, chiave, x, y, larghezza, altezza) {
  // Ripeti la striscia invece di allungarla: i pixel mantengono le proporzioni.
  // Terra paese è già esportata alla risoluzione di gioco.
  const scala = chiave === "terra paese-ritaglio" ? 1 : 0.25;
  return s.add.tileSprite(x, y, larghezza, altezza, chiave)
    .setOrigin(0, 0).setTileScale(scala, scala);
}
