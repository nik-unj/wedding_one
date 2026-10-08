import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { useInvitation } from '../../context/InvitationContext';
import { cn } from '../../lib/cn';

interface Props {
  count?: number;
  className?: string;
  /** CSS custom property to read the colour from */
  colorVar?: string;
}

interface P {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
}

/**
 * Drifting gold dust. Single canvas, pre-rendered glow sprite (no shadowBlur),
 * DPR-capped, paused when off-screen or when the tab is hidden.
 */
export function Particles({ count = 46, className, colorVar = '--gold-light' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const { theme } = useInvitation();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim() || '#e4c27a';

    // glow sprite
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sg = sprite.getContext('2d')!;
    const grad = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, color);
    grad.addColorStop(0.18, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 64, 64);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let parts: P[] = [];
    let raf = 0;
    let visible = true;
    let last = 0;

    const make = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.2 + Math.random() * 4.2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.05 + Math.random() * 0.22),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.9,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.min(1, (w * h) / (1200 * 800));
      const n = Math.max(14, Math.round(count * density));
      parts = Array.from({ length: n }, make);
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const dt = Math.min(48, t - last || 16);
      last = t;
      g.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx * dt * 0.06 * 16;
        p.y += p.vy * dt * 0.06 * 16;
        p.phase += p.speed * dt * 0.001;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const tw = 0.5 + 0.5 * Math.sin(p.phase * 2.2);
        g.globalAlpha = 0.15 + tw * 0.6;
        const s = p.r * (2.4 + tw);
        g.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      g.globalAlpha = 1;
    };

    resize();
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [count, reduce, colorVar, theme]);

  return <canvas ref={ref} className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} aria-hidden="true" />;
}
