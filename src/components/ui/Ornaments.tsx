import { useMemo } from 'react';
import { useInvitation } from '../../context/InvitationContext';
import { cn } from '../../lib/cn';
import type { ThemeId } from '../../types';

/* ───────────────────────────── Divider ───────────────────────────── */

function Glyph({ theme }: { theme: ThemeId }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  if (theme === 'ivory') {
    return (
      <svg width="34" height="14" viewBox="0 0 34 14" {...common}>
        <path d="M17 1 23 7 17 13 11 7Z" />
        <circle cx="3" cy="7" r="1" fill="currentColor" />
        <circle cx="31" cy="7" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (theme === 'emerald') {
    return (
      <svg width="46" height="22" viewBox="0 0 46 22" {...common}>
        <path d="M23 20C12 19 5 12 6 3c9 1 16 7 17 17Z" />
        <path d="M23 20c11-1 18-8 17-17-9 1-16 7-17 17Z" />
        <path d="M23 20V8" />
        <circle cx="23" cy="4" r="1.3" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="46" height="26" viewBox="0 0 46 26" {...common}>
      <path d="M23 2c7 6 7 14 0 22C16 16 16 8 23 2Z" />
      <path d="M23 24C14 22 8 16 6 8c8 1 14 6 17 16Z" />
      <path d="M23 24c9-2 15-8 17-16-8 1-14 6-17 16Z" />
      <path d="M23 24C12 24 4 20 1 14c8-1 16 2 22 10Z" opacity=".6" />
      <path d="M23 24c11 0 19-4 22-10-8-1-16 2-22 10Z" opacity=".6" />
    </svg>
  );
}

export function Divider({ className }: { className?: string }) {
  const { theme } = useInvitation();
  return (
    <div className={cn('flex items-center justify-center gap-4 text-accent', className)} aria-hidden="true">
      <span className="h-px w-14 bg-linear-to-r from-transparent to-current opacity-60 sm:w-28" />
      <Glyph theme={theme} />
      <span className="h-px w-14 bg-linear-to-l from-transparent to-current opacity-60 sm:w-28" />
    </div>
  );
}

/* ───────────────────────────── Mandala ───────────────────────────── */

const petal = (r0: number, r1: number, w: number) =>
  `M0 ${-r0} C ${w} ${-(r0 + (r1 - r0) * 0.3)} ${w * 0.8} ${-(r0 + (r1 - r0) * 0.8)} 0 ${-r1} C ${-w * 0.8} ${-(r0 + (r1 - r0) * 0.8)} ${-w} ${-(r0 + (r1 - r0) * 0.3)} 0 ${-r0}Z`;

/** Procedural, theme-aware mandala used as a slow rotating backdrop. */
export function Mandala({ className }: { className?: string }) {
  const { theme } = useInvitation();

  const layers = useMemo(() => {
    const rot = (n: number, offset = 0) => Array.from({ length: n }, (_, i) => (360 / n) * i + offset);
    if (theme === 'ivory') {
      return {
        circles: [96, 78, 52, 28],
        dashed: [92],
        rays: rot(72).map((a, i) => ({ a, d: `M0 -80 L0 ${i % 2 ? -88 : -96}` })),
        petals: [{ angles: rot(12), d: petal(10, 50, 6) }],
      };
    }
    if (theme === 'emerald') {
      return {
        circles: [97, 56, 22],
        dashed: [92],
        rays: [] as { a: number; d: string }[],
        petals: [
          { angles: rot(12), d: petal(54, 94, 13) },
          { angles: rot(12, 15), d: petal(30, 56, 7) },
          { angles: rot(6, 0), d: petal(8, 36, 9) },
        ],
      };
    }
    return {
      circles: [97, 62, 38, 14],
      dashed: [93, 66],
      rays: [] as { a: number; d: string }[],
      petals: [
        { angles: rot(24), d: petal(66, 92, 8) },
        { angles: rot(16, 11.25), d: petal(40, 64, 11) },
        { angles: rot(8), d: petal(14, 48, 12) },
      ],
    };
  }, [theme]);

  return (
    <svg
      viewBox="-100 -100 200 200"
      className={cn('pointer-events-none', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      focusable="false"
    >
      {layers.circles.map((r) => (
        <circle key={r} r={r} vectorEffect="non-scaling-stroke" />
      ))}
      {layers.dashed.map((r) => (
        <circle key={`d${r}`} r={r} strokeDasharray="1 5" vectorEffect="non-scaling-stroke" />
      ))}
      {layers.rays.map((ray, i) => (
        <path key={`r${i}`} d={ray.d} transform={`rotate(${ray.a})`} vectorEffect="non-scaling-stroke" />
      ))}
      {layers.petals.map((layer, li) =>
        layer.angles.map((a, i) => (
          <path key={`${li}-${i}`} d={layer.d} transform={`rotate(${a})`} vectorEffect="non-scaling-stroke" />
        )),
      )}
    </svg>
  );
}

/* ───────────────────────────── Corner frame ───────────────────────────── */

function Corner({ theme }: { theme: ThemeId }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round' } as const;
  if (theme === 'ivory') {
    return (
      <svg viewBox="0 0 64 64" width="100%" height="100%" {...common}>
        <path d="M1 44V1H44" />
        <path d="M8 30V8H30" opacity=".45" />
      </svg>
    );
  }
  if (theme === 'emerald') {
    return (
      <svg viewBox="0 0 64 64" width="100%" height="100%" {...common}>
        <path d="M1 62V14Q1 1 14 1H62" />
        <path d="M13 13c9 0 14 5 14 14-9 0-14-5-14-14Z" />
        <path d="M30 13c6 0 10-3 12-9" />
        <path d="M13 30c0 6-3 10-9 12" />
        <circle cx="1.5" cy="1.5" r="1.8" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" {...common}>
      <path d="M1 62V14Q1 1 14 1H62" />
      <path d="M8 62V20Q8 8 20 8H62" opacity=".5" />
      <path d="M17 17q8 0 8 8 0-8 8-8-8 0-8-8 0 8-8 8Z" fill="currentColor" stroke="none" />
      <circle cx="1.5" cy="1.5" r="1.8" fill="currentColor" />
      <circle cx="40" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="40" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Decorative corners for an absolutely positioned frame. */
export function CornerFrame({ className, size = 56 }: { className?: string; size?: number }) {
  const { theme } = useInvitation();
  const s = { width: size, height: size };
  return (
    <div className={cn('pointer-events-none absolute inset-0 text-accent', className)} aria-hidden="true">
      <div className="absolute left-0 top-0" style={s}>
        <Corner theme={theme} />
      </div>
      <div className="absolute right-0 top-0 -scale-x-100" style={s}>
        <Corner theme={theme} />
      </div>
      <div className="absolute bottom-0 left-0 -scale-y-100" style={s}>
        <Corner theme={theme} />
      </div>
      <div className="absolute bottom-0 right-0 -scale-100" style={s}>
        <Corner theme={theme} />
      </div>
    </div>
  );
}
