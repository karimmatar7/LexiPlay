const CANVAS_SIZE = 300;

export function getLetterImageData(letter) {
  const off = document.createElement("canvas");
  off.width = CANVAS_SIZE;
  off.height = CANVAS_SIZE;
  const ctx = off.getContext("2d");

  // Transparent background (important for alpha-based scoring)
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw target letter (solid black)
  ctx.fillStyle = "#000000";
  ctx.font = `bold ${CANVAS_SIZE * 0.72}px serif`; // match DrawingCanvas
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);

  return ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

export function calcScores(targetData, drawnData) {
  const t = targetData.data;
  const d = drawnData.data;

  let letterPx = 0;
  let drawnPx = 0;
  let overlapPx = 0;

  for (let i = 0; i < t.length; i += 4) {
    // Detect real pixels using alpha channel (more reliable than color darkness)
    const tOn = t[i + 3] > 20; // target letter pixel exists
    const dOn = d[i + 3] > 20; // user actually drew here

    if (tOn) letterPx++;
    if (dOn) drawnPx++;
    if (tOn && dOn) overlapPx++;
  }

  if (letterPx === 0) return { coverage: 0, precision: 0 };

  return {
    coverage: overlapPx / letterPx,
    precision: drawnPx > 0 ? overlapPx / drawnPx : 0,
  };
}