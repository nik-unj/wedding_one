import type { ThemeId } from '../types';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  /** Preview swatches for the demo theme picker */
  swatches: [string, string, string];
  /** `<meta name="theme-color">` */
  chrome: string;
  /** Extra Google Fonts stylesheet needed by this theme (loaded lazily) */
  fontsHref: string;
}

/**
 * Themes are defined as CSS custom properties in `index.css` (`[data-theme='…']`).
 * This file only holds metadata so components never hard-code colours.
 */
export const themes: Record<ThemeId, ThemeMeta> = {
  royal: {
    id: 'royal',
    name: 'Royal Heritage',
    tagline: 'Ivory, antique gold & deep maroon',
    swatches: ['#FBF5E9', '#B8893B', '#4A0F1C'],
    chrome: '#2E0912',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&family=Noto+Serif+Devanagari:wght@500;600&family=Pinyon+Script&display=swap',
  },
  ivory: {
    id: 'ivory',
    name: 'Ivory Luxury',
    tagline: 'Champagne, soft gold & charcoal',
    swatches: ['#FAF7F0', '#B79A63', '#1F1D1B'],
    chrome: '#141312',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Jost:wght@300;400;500&family=Noto+Serif+Devanagari:wght@500;600&family=Allura&display=swap',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Royale',
    tagline: 'Deep emerald, champagne gold & cream',
    swatches: ['#F6F1E3', '#C2A15C', '#0B3B2E'],
    chrome: '#06241C',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500&family=Noto+Serif+Devanagari:wght@500;600&family=Parisienne&display=swap',
  },
};

export const themeOrder: ThemeId[] = ['royal', 'ivory', 'emerald'];

export const isThemeId = (v: string | null | undefined): v is ThemeId =>
  !!v && v in themes;

const loaded = new Set<string>();

/** Apply a theme to the document and lazily load its web fonts. */
export function applyTheme(id: ThemeId) {
  const meta = themes[id];
  const root = document.documentElement;
  root.dataset.theme = id;

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', meta.chrome);

  if (!loaded.has(meta.fontsHref)) {
    loaded.add(meta.fontsHref);
    const existing = document.getElementById('theme-fonts') as HTMLLinkElement | null;
    if (existing && existing.href === meta.fontsHref) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = meta.fontsHref;
    document.head.appendChild(link);
  }
}
