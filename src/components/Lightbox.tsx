import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ImageAsset } from '../types';
import { useBodyScrollLock } from '../lib/hooks';
import { Img } from './ui/Img';

type Item = ImageAsset & { id: string; caption?: string };

interface Props {
  items: Item[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

/** Full-screen viewer: keyboard, buttons and horizontal swipe (touch + mouse drag). */
export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const open = index !== null;
  const [dir, setDir] = useState(1);
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragging = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      setDir(delta);
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  // focus management
  useEffect(() => {
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus({ preventScroll: true });
    } else if (opener.current) {
      opener.current.focus({ preventScroll: true });
      opener.current = null;
    }
  }, [open]);

  // keyboard
  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && root.current) {
        const f = Array.from(root.current.querySelectorAll<HTMLElement>('button'));
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open, go, onClose]);

  // warm the neighbours
  useEffect(() => {
    if (index === null) return;
    [1, -1].forEach((d) => {
      const n = items[(index + d + items.length) % items.length];
      const i = new Image();
      i.src = n.src;
    });
  }, [index, items]);

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    dragging.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const ddx = e.clientX - start.current.x;
    const ddy = e.clientY - start.current.y;
    if (!dragging.current && Math.abs(ddx) > 8 && Math.abs(ddx) > Math.abs(ddy)) {
      dragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (dragging.current) setDx(ddx);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!start.current) return;
    const ddx = e.clientX - start.current.x;
    const velocity = Math.abs(ddx) / Math.max(1, performance.now() - start.current.t);
    const wasDrag = dragging.current;
    start.current = null;
    dragging.current = false;
    setDx(0);
    if (wasDrag && (Math.abs(ddx) > 60 || velocity > 0.5)) go(ddx < 0 ? 1 : -1);
  };

  const item = index !== null ? items[index] : null;

  // Portal to <body> so the viewer escapes any section stacking context and sits above the floating docks.
  return createPortal(
    <AnimatePresence>
      {open && item && (
        <m.div
          ref={root}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[120] flex flex-col bg-[#0b0507]/95 text-on-deep backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="font-display text-lg tracking-[0.25em] text-gold-light" aria-live="polite">
              {String((index ?? 0) + 1).padStart(2, '0')} <span className="text-on-deep-soft">/ {String(items.length).padStart(2, '0')}</span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close photo viewer"
              className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-on-deep transition hover:border-gold-light hover:text-gold-light"
            >
              <X size={20} strokeWidth={1.4} />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-20"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <m.figure
                key={item.id}
                custom={dir}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-3 sm:px-0"
                initial={{ opacity: 0, x: dir * 70 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -70 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ transform: `translateX(${dx}px)`, transition: dx === 0 ? 'transform 0.3s' : 'none' }} className="flex min-h-0 max-w-full flex-1 items-center justify-center">
                  <Img asset={item} sizes="100vw" priority className="max-h-full max-w-full select-none object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]" />
                </div>
                {item.caption && <figcaption className="font-display text-lg italic text-on-deep-soft">{item.caption}</figcaption>}
              </m.figure>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-black/30 text-on-deep backdrop-blur transition hover:border-gold-light hover:text-gold-light sm:left-6 sm:h-12 sm:w-12"
                >
                  <ChevronLeft size={22} strokeWidth={1.4} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-black/30 text-on-deep backdrop-blur transition hover:border-gold-light hover:text-gold-light sm:right-6 sm:h-12 sm:w-12"
                >
                  <ChevronRight size={22} strokeWidth={1.4} />
                </button>
              </>
            )}
          </div>
          <p className="pb-5 text-center text-[0.65rem] uppercase tracking-[0.3em] text-on-deep-soft/70 sm:hidden">Swipe to browse</p>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
