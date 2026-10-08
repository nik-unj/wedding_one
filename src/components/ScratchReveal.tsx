import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Hand, Sparkles } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { burst } from '../lib/confetti';
import { playChime } from '../lib/audio';
import { dayNum, fmt, weekday } from '../lib/dates';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, EASE } from './ui/Reveal';
import { CornerFrame } from './ui/Ornaments';
import { Particles } from './ui/Particles';

const COLS = 24;
const ROWS = 20;
const THRESHOLD = 0.5;

const cssVar = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/** Paints a believable gold foil: gradient, brushed streaks, grain, embossed lattice and a specular sweep. */
function paintFoil(g: CanvasRenderingContext2D, w: number, h: number) {
  const deep = cssVar('--gold-deep', '#7e5920');
  const gold = cssVar('--gold', '#b8893b');
  const light = cssVar('--gold-light', '#e4c27a');
  const display = cssVar('--f-display', 'serif');

  g.save();
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, w, h);

  const base = g.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, gold);
  base.addColorStop(0.16, light);
  base.addColorStop(0.32, gold);
  base.addColorStop(0.48, '#f8ecc4');
  base.addColorStop(0.64, light);
  base.addColorStop(0.82, deep);
  base.addColorStop(1, gold);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);

  // brushed metal streaks
  for (let i = 0; i < 340; i++) {
    const y = Math.random() * h;
    const x = Math.random() * w;
    const len = 30 + Math.random() * w * 0.7;
    g.fillStyle = Math.random() < 0.5 ? `rgba(255,255,255,${0.02 + Math.random() * 0.07})` : `rgba(60,35,5,${0.02 + Math.random() * 0.06})`;
    g.fillRect(x - len / 2, y, len, 0.4 + Math.random() * 1.2);
  }

  // grain
  const n = document.createElement('canvas');
  n.width = n.height = 128;
  const ng = n.getContext('2d')!;
  const id = ng.createImageData(128, 128);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = Math.random() * 255;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 46;
  }
  ng.putImageData(id, 0, 0);
  const pat = g.createPattern(n, 'repeat');
  if (pat) {
    g.globalCompositeOperation = 'overlay';
    g.fillStyle = pat;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  }

  // embossed lattice (jaali)
  const step = Math.max(26, Math.min(40, w / 12));
  const drawLattice = (dx: number, dy: number, stroke: string) => {
    g.strokeStyle = stroke;
    g.lineWidth = 1;
    g.beginPath();
    for (let y = -step; y < h + step; y += step) {
      for (let x = -step; x < w + step; x += step) {
        const cx = x + dx + (Math.round(y / step) % 2 ? step / 2 : 0);
        const cy = y + dy;
        const r = step * 0.42;
        g.moveTo(cx, cy - r);
        g.lineTo(cx + r, cy);
        g.lineTo(cx, cy + r);
        g.lineTo(cx - r, cy);
        g.closePath();
        g.moveTo(cx + 2.4, cy);
        g.arc(cx, cy, 2.4, 0, Math.PI * 2);
      }
    }
    g.stroke();
  };
  drawLattice(1, 1, 'rgba(70,40,5,0.22)');
  drawLattice(0, 0, 'rgba(255,248,220,0.38)');

  // specular sweep
  const sweep = g.createLinearGradient(w * 0.05, 0, w * 0.95, h);
  sweep.addColorStop(0.35, 'rgba(255,255,255,0)');
  sweep.addColorStop(0.5, 'rgba(255,255,255,0.34)');
  sweep.addColorStop(0.65, 'rgba(255,255,255,0)');
  g.fillStyle = sweep;
  g.fillRect(0, 0, w, h);

  // inset border
  g.lineWidth = 1.5;
  g.strokeStyle = 'rgba(255,248,220,0.75)';
  g.strokeRect(10.5, 10.5, w - 21, h - 21);
  g.strokeStyle = 'rgba(70,40,5,0.35)';
  g.strokeRect(13.5, 13.5, w - 27, h - 27);

  // embossed call-to-action
  const fs = Math.max(20, Math.min(w * 0.075, 44));
  const cx = w / 2;
  const cy = h / 2;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const emboss = (text: string, y: number, font: string) => {
    g.font = font;
    g.fillStyle = 'rgba(255,250,230,0.7)';
    g.fillText(text, cx + 1, y + 1.2);
    g.fillStyle = 'rgba(60,32,4,0.55)';
    g.fillText(text, cx - 0.8, y - 0.8);
    g.fillStyle = 'rgba(110,72,16,0.78)';
    g.fillText(text, cx, y);
  };
  emboss('✦', cy - fs * 1.25, `400 ${fs * 0.8}px ${display}`);
  emboss('SCRATCH HERE', cy, `500 ${fs}px ${display}`);
  emboss('to reveal the date', cy + fs * 1.05, `italic 400 ${fs * 0.62}px ${display}`);
  g.restore();
}

/** A soft round brush used with destination-out. */
function makeBrush(r: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = Math.ceil(r * 2);
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(0.62, 'rgba(0,0,0,0.95)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, r * 2, r * 2);
  return c;
}

export function ScratchReveal() {
  const { inv, theme } = useInvitation();
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [percent, setPercent] = useState(0);

  const s = useRef({
    drawing: false,
    lx: 0,
    ly: 0,
    w: 0,
    h: 0,
    r: 26,
    brush: null as HTMLCanvasElement | null,
    grid: new Uint8Array(COLS * ROWS),
    marked: 0,
    done: false,
    pct: 0,
  });

  const reveal = useCallback(() => {
    if (s.current.done) return;
    s.current.done = true;
    setRevealed(true);
    setPercent(100);
    playChime();
    navigator.vibrate?.(24);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const palette = [cssVar('--gold', '#b8893b'), cssVar('--gold-light', '#e4c27a'), '#fff6da', '#f0d9a0', '#e7a9b3'];
      burst(rect.left + rect.width / 2, rect.top + rect.height * 0.55, palette, 130);
    }
  }, []);

  /* (re)paint the foil on mount, theme change and first layout */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    const paint = () => {
      if (s.current.marked > 0) return; // never wipe progress
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.current.w = rect.width;
      s.current.h = rect.height;
      s.current.r = Math.max(20, Math.min(34, rect.width * 0.062));
      s.current.brush = makeBrush(s.current.r);
      paintFoil(g, rect.width, rect.height);
    };

    paint();
    void document.fonts?.ready.then(paint);
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [theme, revealed]);

  const stamp = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext('2d');
    const st = s.current;
    if (!g || !st.brush) return;
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(st.brush, x - st.r, y - st.r, st.r * 2, st.r * 2);
    g.globalCompositeOperation = 'source-over';

    // coarse coverage grid (cheap alternative to getImageData)
    const cw = st.w / COLS;
    const ch = st.h / ROWS;
    const rr = st.r * 0.85;
    const c0 = Math.max(0, Math.floor((x - rr) / cw));
    const c1 = Math.min(COLS - 1, Math.floor((x + rr) / cw));
    const r0 = Math.max(0, Math.floor((y - rr) / ch));
    const r1 = Math.min(ROWS - 1, Math.floor((y + rr) / ch));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const i = r * COLS + c;
        if (st.grid[i]) continue;
        const dx = (c + 0.5) * cw - x;
        const dy = (r + 0.5) * ch - y;
        if (dx * dx + dy * dy <= rr * rr) {
          st.grid[i] = 1;
          st.marked++;
        }
      }
    }
    const pct = Math.min(100, Math.round((st.marked / (COLS * ROWS) / THRESHOLD) * 100));
    if (pct !== st.pct) {
      st.pct = pct;
      setPercent(pct);
    }
  };

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * s.current.w,
      y: ((e.clientY - rect.top) / rect.height) * s.current.h,
    };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (s.current.done) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic / inactive pointer — drawing still works */
    }
    const p = point(e);
    s.current.drawing = true;
    s.current.lx = p.x;
    s.current.ly = p.y;
    setTouched(true);
    stamp(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const st = s.current;
    if (!st.drawing || st.done) return;
    // use coalesced events for smooth strokes on fast swipes
    const coalesced = e.nativeEvent.getCoalescedEvents?.();
    const events = coalesced && coalesced.length ? coalesced : [e.nativeEvent];
    const rect = e.currentTarget.getBoundingClientRect();
    for (const ev of events) {
      const x = ((ev.clientX - rect.left) / rect.width) * st.w;
      const y = ((ev.clientY - rect.top) / rect.height) * st.h;
      const dx = x - st.lx;
      const dy = y - st.ly;
      const dist = Math.hypot(dx, dy);
      const stepLen = st.r * 0.35;
      const n = Math.max(1, Math.ceil(dist / stepLen));
      for (let i = 1; i <= n; i++) stamp(st.lx + (dx * i) / n, st.ly + (dy * i) / n);
      st.lx = x;
      st.ly = y;
    }
    if (st.marked / (COLS * ROWS) >= THRESHOLD) reveal();
  };

  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    s.current.drawing = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (s.current.marked / (COLS * ROWS) >= THRESHOLD) reveal();
  };

  const d = new Date(inv.weddingDate);
  const tz = inv.timeZone;

  return (
    <Section id="reveal" tone="dark" labelledBy="reveal-title" pattern className="grain">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,color-mix(in_srgb,var(--gold)_22%,transparent),transparent_62%)]" />
      <Particles count={36} className="-z-10" />

      <Container>
        <SectionHeading id="reveal-title" eyebrow="A little surprise" title="Something beautiful awaits…" subtitle="Run your finger across the gold to reveal the date." />

        <Reveal kind="scale" duration={1.6}>
          <div
            ref={cardRef}
            className="relative mx-auto aspect-[6/5] w-full max-w-xl select-none shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75)] sm:aspect-[16/10]"
            style={{ borderRadius: 'var(--r-card)' }}
          >
            {/* what lies beneath */}
            <div
              className="tone-light absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-paper via-paper to-paper-2 text-center text-fg"
              style={{ borderRadius: 'var(--r-card)' }}
              aria-live="polite"
            >
              <CornerFrame size={52} className="m-3" />
              <m.p
                className="script text-[clamp(2rem,8vw,3.6rem)] text-accent"
                initial={false}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0.0, y: 10 }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}
              >
                Save the Date
              </m.p>
              <p className="eyebrow mt-2">Wedding Date</p>
              <p className="mt-1 font-display text-[clamp(4.2rem,20vw,8rem)] font-light leading-none text-fg [font-variant-numeric:lining-nums]">{dayNum(d, tz)}</p>
              <p className="mt-3 font-display text-[clamp(1rem,4vw,1.6rem)] uppercase tracking-[0.34em] text-fg">
                {fmt(d, tz, { month: 'long' }, 'en-GB')} {fmt(d, tz, { year: 'numeric' }, 'en-GB')}
              </p>
              <p className="mt-2 font-display text-base italic text-fg-soft sm:text-lg">
                {weekday(d, tz)} · {inv.hero.city}
              </p>
            </div>

            {/* sparkles once revealed */}
            <AnimatePresence>
              {revealed &&
                [
                  { l: '8%', t: '14%', s: 22, dl: 0.1 },
                  { l: '88%', t: '20%', s: 18, dl: 0.35 },
                  { l: '14%', t: '80%', s: 16, dl: 0.55 },
                  { l: '84%', t: '76%', s: 24, dl: 0.2 },
                ].map((sp, i) => (
                  <m.span
                    key={i}
                    className="pointer-events-none absolute z-10 text-gold"
                    style={{ left: sp.l, top: sp.t }}
                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                    animate={{ opacity: [0, 1, 0.6, 1, 0], scale: [0, 1, 0.8, 1.1, 0], rotate: 20 }}
                    transition={{ duration: 3.4, delay: sp.dl, ease: 'easeInOut' }}
                    aria-hidden="true"
                  >
                    <Sparkles size={sp.s} strokeWidth={1.3} />
                  </m.span>
                ))}
            </AnimatePresence>

            {/* the foil */}
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              className={`absolute inset-0 h-full w-full cursor-crosshair transition-opacity duration-[1400ms] ease-out ${
                revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
              style={{ touchAction: 'none', borderRadius: 'var(--r-card)' }}
            />

            {/* swipe hint */}
            <AnimatePresence>
              {!touched && !revealed && (
                <m.div
                  className="pointer-events-none absolute inset-0 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  aria-hidden="true"
                >
                  <m.div
                    className="absolute left-[24%] top-[62%] text-[#4a2f08]"
                    animate={{ x: ['0%', '210%', '0%'], y: ['0%', '-60%', '10%'], rotate: [-8, 10, -8] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  >
                    <Hand size={34} strokeWidth={1.4} className="drop-shadow-[0_2px_3px_rgba(255,245,210,0.7)]" />
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4">
          <div
            role="progressbar"
            aria-label="Amount scratched"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-px w-48 overflow-hidden bg-gold/25"
          >
            <div className="h-full origin-left bg-gold-light transition-transform duration-300" style={{ transform: `scaleX(${percent / 100})` }} />
          </div>
          {!revealed ? (
            <button
              type="button"
              onClick={reveal}
              className="text-xs uppercase tracking-[0.28em] text-on-deep-soft underline decoration-gold/40 underline-offset-8 transition hover:text-gold-light"
            >
              Or reveal it instantly
            </button>
          ) : (
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }} className="max-w-xs text-balance text-center font-display text-lg italic text-on-deep-soft">
              Mark your calendars — we can’t wait to celebrate with you.
            </m.p>
          )}
        </div>
      </Container>
    </Section>
  );
}
