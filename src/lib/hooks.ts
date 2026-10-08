import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MusicConfig } from '../types';
import { AmbientScore, setSfxEnabled, unlockAudio } from './audio';

/* ───────────────────────────── countdown ───────────────────────────── */

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
  /** ms since the target (only meaningful once done) */
  elapsed: number;
}

export function useCountdown(target: string): CountdownValue {
  const targetMs = useMemo(() => new Date(target).getTime(), [target]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      // re-align to the next whole second so the display never drifts
      id = window.setTimeout(tick, 1000 - (t % 1000) + 8);
    };
    tick();
    return () => window.clearTimeout(id);
  }, []);

  const diff = Math.max(0, targetMs - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: targetMs - now <= 0,
    elapsed: Math.max(0, now - targetMs),
  };
}

/* ───────────────────────────── misc ───────────────────────────── */

export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? initial : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** Locks page scroll (reference counted so overlays can stack). */
let locks = 0;
export function useBodyScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    locks++;
    const body = document.body;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.classList.add('no-scroll');
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      locks--;
      if (locks <= 0) {
        locks = 0;
        body.classList.remove('no-scroll');
        body.style.paddingRight = '';
      }
    };
  }, [active]);
}

export function useEscape(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const on = (e: KeyboardEvent) => e.key === 'Escape' && handler();
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [handler, active]);
}

/** Closes when clicking/tapping outside `ref`. */
export function useClickOutside<T extends HTMLElement>(ref: React.RefObject<T | null>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const on = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    };
    document.addEventListener('pointerdown', on);
    return () => document.removeEventListener('pointerdown', on);
  }, [ref, onOut, active]);
}

/* ───────────────────────────── music controller ───────────────────────────── */

export interface MusicController {
  playing: boolean;
  start: () => Promise<void>;
  toggle: () => void;
}

export function useMusic(cfg: MusicConfig): MusicController {
  const [playing, setPlaying] = useState(false);
  const intent = useRef(false);
  const ambient = useRef<AmbientScore | null>(null);
  const file = useRef<HTMLAudioElement | null>(null);
  const fileFailed = useRef(false);

  const begin = useCallback(async () => {
    const ctx = await unlockAudio();

    if (cfg.src && !fileFailed.current) {
      try {
        if (!file.current) {
          const a = new Audio(cfg.src);
          a.loop = true;
          a.volume = cfg.volume;
          file.current = a;
        }
        await file.current.play();
        setSfxEnabled(true);
        setPlaying(true);
        return;
      } catch {
        fileFailed.current = true; // missing/unsupported file → use the built-in score
        file.current = null;
      }
    }

    if (!ctx || ctx.state !== 'running') {
      setPlaying(false);
      return;
    }
    if (!ambient.current) ambient.current = new AmbientScore(ctx, cfg.volume);
    ambient.current.start();
    setSfxEnabled(true);
    setPlaying(true);
  }, [cfg.src, cfg.volume]);

  const halt = useCallback(() => {
    file.current?.pause();
    ambient.current?.stop();
    setSfxEnabled(false);
    setPlaying(false);
  }, []);

  const start = useCallback(async () => {
    intent.current = true;
    await begin();
  }, [begin]);

  const toggle = useCallback(() => {
    if (playing) {
      intent.current = false;
      halt();
    } else {
      intent.current = true;
      void begin();
    }
  }, [playing, begin, halt]);

  // be a good citizen: silence when the tab is hidden, resume on return
  useEffect(() => {
    const on = () => {
      if (document.hidden) {
        file.current?.pause();
        ambient.current?.stop(0.4);
        setPlaying(false);
      } else if (intent.current) {
        void begin();
      }
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, [begin]);

  useEffect(
    () => () => {
      file.current?.pause();
      ambient.current?.stop(0.1);
    },
    [],
  );

  return useMemo(() => ({ playing, start, toggle }), [playing, start, toggle]);
}
