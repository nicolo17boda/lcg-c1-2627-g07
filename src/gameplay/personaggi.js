// Rimuove solo lo sfondo collegato ai bordi: il bianco degli occhi resta intatto.
function prepara_personaggio(s, immagine) {
  const chiave = immagine.id + "-personaggio";
  if (s.textures.exists(chiave)) return chiave;
  const sorgente = s.textures.get(immagine.id).getSourceImage();
  const canvas = document.createElement("canvas");
  const w = canvas.width = sorgente.width;
  const h = canvas.height = sorgente.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(sorgente, 0, 0);
  const pixels = ctx.getImageData(0, 0, w, h);
  const dati = pixels.data;
  const visitati = new Uint8Array(w * h);
  const coda = new Int32Array(w * h);
  let testa = 0, fine = 0;
  function aggiungi(p) {
    if (visitati[p]) return;
    visitati[p] = 1;
    const i = p * 4;
    if (dati[i + 3] > 0 &&
        !(dati[i] > 245 && dati[i + 1] > 245 && dati[i + 2] > 245)) return;
    dati[i + 3] = 0;
    coda[fine++] = p;
  }
  for (let x = 0; x < w; x++) { aggiungi(x); aggiungi((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { aggiungi(y * w); aggiungi(y * w + w - 1); }
  while (testa < fine) {
    const p = coda[testa++];
    const x = p % w;
    if (x > 0) aggiungi(p - 1);
    if (x < w - 1) aggiungi(p + 1);
    if (p >= w) aggiungi(p - w);
    if (p < w * (h - 1)) aggiungi(p + w);
  }
  let sx = w, sy = h, dx = -1, dy = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (dati[(y * w + x) * 4 + 3] === 0) continue;
      sx = Math.min(sx, x); sy = Math.min(sy, y);
      dx = Math.max(dx, x); dy = Math.max(dy, y);
    }
  }
  if (dx < sx) throw new Error("Skin personaggio vuota");
  ctx.putImageData(pixels, 0, 0);
  const larghezza = dx - sx + 1, altezza = dy - sy + 1;
  const texture = s.textures.createCanvas(chiave, larghezza, altezza);
  texture.getContext().drawImage(canvas, sx, sy, larghezza, altezza,
    0, 0, larghezza, altezza);
  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return chiave;
}

export function crea_skin_personaggio(s, immagine, x, piedi, altezza) {
  const skin = s.add.image(x, piedi, prepara_personaggio(s, immagine)).setOrigin(0.5, 1);
  skin.setScale(altezza / skin.height);
  return skin;
}
