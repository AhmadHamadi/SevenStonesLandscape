/** Compact pen strokes used for the office signer. Coordinates are 0–1000 so
 * the drawing survives different screen and print sizes without a large PNG URL. */
const WIDTH = 500;
const HEIGHT = 160;
const MAX_LENGTH = 3000;
const MAX_POINTS = 220;

export function parseSignature(value) {
  if (typeof value !== 'string' || !value || value.length > MAX_LENGTH ||
      !/^[0-9,;|]+$/.test(value)) return [];
  const strokes = value.split('|').map((stroke) => stroke.split(';').map((pair) => {
    const parts = pair.split(',');
    if (parts.length !== 2) return null;
    const [x, y] = parts.map(Number);
    return Number.isInteger(x) && Number.isInteger(y) &&
      x >= 0 && x <= 1000 && y >= 0 && y <= 1000 ? [x, y] : null;
  }));
  if (strokes.some((stroke) => !stroke.length || stroke.includes(null)) ||
      strokes.reduce((n, stroke) => n + stroke.length, 0) > MAX_POINTS) return [];
  return strokes;
}

export function validSignature(value) {
  return parseSignature(value).length > 0;
}

export function paintSignature(canvas, value) {
  const strokes = parseSignature(value);
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = '#15202e';
  ctx.fillStyle = '#15202e';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of strokes) {
    ctx.beginPath();
    stroke.forEach(([x, y], i) => {
      const px = x * WIDTH / 1000;
      const py = y * HEIGHT / 1000;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    if (stroke.length === 1) {
      const [x, y] = stroke[0];
      ctx.arc(x * WIDTH / 1000, y * HEIGHT / 1000, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else ctx.stroke();
  }
}

export function signaturePng(value) {
  if (!validSignature(value)) return '';
  const canvas = document.createElement('canvas');
  paintSignature(canvas, value);
  const pixels = canvas.getContext('2d').getImageData(0, 0, WIDTH, HEIGHT).data;
  let left = WIDTH, top = HEIGHT, right = -1, bottom = -1;
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    if (!pixels[(y * WIDTH + x) * 4 + 3]) continue;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < left) return '';
  const pad = 6;
  left = Math.max(0, left - pad); top = Math.max(0, top - pad);
  right = Math.min(WIDTH - 1, right + pad);
  bottom = Math.min(HEIGHT - 1, bottom + pad);
  const cropped = document.createElement('canvas');
  cropped.width = right - left + 1;
  cropped.height = bottom - top + 1;
  cropped.getContext('2d').drawImage(canvas, left, top, cropped.width, cropped.height,
    0, 0, cropped.width, cropped.height);
  return cropped.toDataURL('image/png');
}

export function createSignaturePad(canvas, onChange) {
  let strokes = [];
  let active = null;
  const serialise = () => strokes.map((s) => s.map((p) => p.join(',')).join(';')).join('|');
  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1000, Math.round((event.clientX - rect.left) * 1000 / rect.width))),
      Math.max(0, Math.min(1000, Math.round((event.clientY - rect.top) * 1000 / rect.height)))
    ];
  };
  const refresh = () => paintSignature(canvas, serialise());
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    active = event.pointerId;
    canvas.setPointerCapture(active);
    strokes.push([point(event)]);
    refresh();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (active !== event.pointerId) return;
    const stroke = strokes.at(-1);
    const next = point(event);
    const last = stroke.at(-1);
    if (Math.hypot(next[0] - last[0], next[1] - last[1]) < 9) return;
    if (serialise().length >= MAX_LENGTH - 20 ||
        strokes.reduce((n, s) => n + s.length, 0) >= MAX_POINTS) return;
    stroke.push(next);
    refresh();
  });
  const finish = (event) => {
    if (active !== event.pointerId) return;
    active = null;
    onChange(serialise());
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  return {
    load(value) { strokes = parseSignature(value); refresh(); },
    clear() { strokes = []; refresh(); onChange(''); }
  };
}
