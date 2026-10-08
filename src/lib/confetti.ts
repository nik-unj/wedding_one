/**
 * Tiny, dependency-free confetti / sparkle burst. Creates a throw-away full-screen
 * canvas, animates ~2.8 seconds and removes itself. Colours are gold-forward to
 * keep it elegant rather than carnival.
 */
export function burst(originX: number, originY: number, palette: string[], amount = 120) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '90',
  });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const g = canvas.getContext('2d');
  if (!g) {
    canvas.remove();
    return;
  }
  g.scale(dpr, dpr);

  interface Piece {
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    rot: number;
    vr: number;
    color: string;
    shape: 'rect' | 'spark' | 'dot';
    life: number;
  }

  const pieces: Piece[] = Array.from({ length: amount }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
    const speed = 5 + Math.random() * 9;
    const shape = Math.random() < 0.25 ? 'spark' : Math.random() < 0.5 ? 'dot' : 'rect';
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 4 + Math.random() * 6,
      h: 7 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: palette[Math.floor(Math.random() * palette.length)],
      shape,
      life: 0,
    };
  });

  const DURATION = 2800;
  const start = performance.now();
  let last = start;

  const frame = (now: number) => {
    const t = now - start;
    const dt = Math.min(2, (now - last) / 16.67);
    last = now;
    g.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of pieces) {
      p.vy += 0.22 * dt;
      p.vx *= 0.992;
      p.vy *= 0.992;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const fade = Math.max(0, 1 - Math.max(0, t - 1500) / (DURATION - 1500));
      g.save();
      g.globalAlpha = fade;
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.color;
      if (p.shape === 'rect') {
        // flutter by squashing the height
        g.scale(1, Math.abs(Math.cos(p.rot * 1.7)) * 0.9 + 0.1);
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.shape === 'dot') {
        g.beginPath();
        g.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        g.fill();
      } else {
        const s = p.h;
        g.beginPath();
        g.moveTo(0, -s);
        g.quadraticCurveTo(0, 0, s, 0);
        g.quadraticCurveTo(0, 0, 0, s);
        g.quadraticCurveTo(0, 0, -s, 0);
        g.quadraticCurveTo(0, 0, 0, -s);
        g.fill();
      }
      g.restore();
    }
    if (t < DURATION) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
