import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Invitation, ThemeId } from '../types';
import { applyTheme, isThemeId } from '../data/themes';
import { useMusic, type MusicController } from '../lib/hooks';

interface Ctx {
  inv: Invitation;
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  opened: boolean;
  open: () => void;
  music: MusicController;
  /** Optional personalised guest name from ?guest=Name */
  guest: string | null;
}

const InvitationContext = createContext<Ctx | null>(null);

export const useInvitation = () => {
  const v = useContext(InvitationContext);
  if (!v) throw new Error('useInvitation must be used inside <InvitationProvider>');
  return v;
};

const readInitialTheme = (fallback: ThemeId): ThemeId => {
  const q = new URLSearchParams(window.location.search).get('theme');
  return isThemeId(q) ? q : fallback;
};

const readGuest = (): string | null => {
  const g = new URLSearchParams(window.location.search).get('guest');
  if (!g) return null;
  const clean = g.replace(/[<>]/g, '').trim().slice(0, 48);
  return clean || null;
};

export function InvitationProvider({ inv, children }: { inv: Invitation; children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => readInitialTheme(inv.theme));
  const [opened, setOpened] = useState(false);
  const music = useMusic(inv.music);
  const guest = useMemo(readGuest, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    const u = new URL(window.location.href);
    u.searchParams.set('theme', t);
    window.history.replaceState(null, '', u);
  }, []);

  const open = useCallback(() => setOpened(true), []);

  useEffect(() => {
    document.title = `${inv.couple.displayName} · Wedding Invitation`;
  }, [inv.couple.displayName]);

  const value = useMemo<Ctx>(
    () => ({ inv, theme, setTheme, opened, open, music, guest }),
    [inv, theme, setTheme, opened, open, music, guest],
  );

  return <InvitationContext.Provider value={value}>{children}</InvitationContext.Provider>;
}
