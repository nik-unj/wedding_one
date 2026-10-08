import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Check, Palette } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { themeOrder, themes } from '../data/themes';
import { useClickOutside, useEscape } from '../lib/hooks';
import { cn } from '../lib/cn';

/** Demo-only picker: the same invitation engine in three visual languages. */
export function ThemeSwitcher() {
  const { inv, theme, setTheme } = useInvitation();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);
  useEscape(close, open);

  if (!inv.demo.themeSwitcher) return null;

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Change invitation theme"
        title="Preview themes"
        className="glass grid h-12 w-12 place-items-center rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-colors hover:border-gold-light"
      >
        <Palette size={18} strokeWidth={1.4} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            role="radiogroup"
            aria-label="Theme"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28 }}
            className="glass absolute bottom-14 left-0 w-72 origin-bottom-left overflow-hidden py-2 shadow-2xl"
            style={{ borderRadius: 'min(var(--r-card), 10px)' }}
          >
            <p className="px-4 pb-2 pt-1 text-[0.62rem] uppercase tracking-[0.32em] text-gold-light">Theme preview</p>
            {themeOrder.map((id) => {
              const t = themes[id];
              const active = id === theme;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(id)}
                  className={cn(
                    'flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gold/15 focus-visible:bg-gold/15 focus-visible:outline-none',
                    active && 'bg-gold/10',
                  )}
                >
                  <span className="flex -space-x-2" aria-hidden="true">
                    {t.swatches.map((c) => (
                      <span key={c} className="h-6 w-6 rounded-full border border-white/30" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-base leading-tight">{t.name}</span>
                    <span className="block text-xs text-on-deep-soft">{t.tagline}</span>
                  </span>
                  {active && <Check size={16} strokeWidth={1.8} className="text-gold-light" aria-hidden="true" />}
                </button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
