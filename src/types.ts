export type ThemeId = 'royal' | 'ivory' | 'emerald';

export interface ImageAsset {
  /** Full-size image (used for lightbox / large screens). */
  src: string;
  /** Optional ~640px wide variant for srcset. */
  srcSm?: string;
  alt: string;
  width: number;
  height: number;
}

export interface Person {
  /** Display name, e.g. "Anushka" */
  name: string;
  fullName: string;
  role: string; // "The Bride" | "The Groom"
  /** "D/o." or "S/o." */
  relation: string;
  mother: string;
  father: string;
  city: string;
  photo: ImageAsset;
  /** One-line personal note, shown under the name. */
  tagline?: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
  photo?: ImageAsset;
}

export interface Family {
  title: string; // "Bride's Family"
  surname: string; // "The Mehta Family"
  father: string;
  mother: string;
  photo?: ImageAsset;
  members: FamilyMember[];
}

export interface WeddingEvent {
  id: string;
  name: string;
  /** Local date at the venue, YYYY-MM-DD */
  date: string;
  /** Local start time, HH:mm (24h) */
  startTime: string;
  /** Local end time, HH:mm (24h). May be earlier than start => ends next day. */
  endTime: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  mapsUrl: string;
  /** Free-text query used for map embeds & directions. Falls back to venue + address. */
  mapsQuery?: string;
  dressCode: string;
  /** Optional colour swatches that illustrate the dress code. */
  dressPalette?: string[];
  image: ImageAsset;
  calendarEnabled: boolean;
}

export interface StoryChapter {
  id: string;
  title: string;
  kicker: string;
  text: string;
  image: ImageAsset;
}

export interface VenueNote {
  title: string;
  text: string;
  icon: 'plane' | 'train' | 'car' | 'bed';
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  mapsUrl: string;
  mapsQuery?: string;
  notes?: VenueNote[];
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: number;
}

export interface SocialLink {
  label: string;
  href: string;
  kind: 'instagram' | 'facebook' | 'youtube' | 'website' | 'email' | 'phone' | 'whatsapp';
}

export interface MusicConfig {
  /** Optional audio file. If omitted, a built-in generative ambient score is used. */
  src?: string;
  title: string;
  volume: number; // 0..1
}

export interface RsvpConfig {
  enabled: boolean;
  /** Last date to respond (display only) */
  deadline: string;
  /** Optional JSON endpoint (Formspree / Apps Script / your API). Receives a POST. */
  endpoint?: string;
  /** Optional WhatsApp number (digits, with country code) for a "confirm on WhatsApp" fallback. */
  whatsapp?: string;
  maxGuests: number;
}

export interface Invitation {
  slug: string;
  couple: {
    /** Appears in titles, share text, etc. */
    displayName: string;
    monogram: string;
    hashtag?: string;
  };
  bride: Person;
  groom: Person;
  families: { bride: Family; groom: Family };
  /** Primary wedding moment, ISO string with offset. Drives the date display. */
  weddingDate: string;
  /** What the countdown ticks towards, ISO string with offset. */
  countdownDate: string;
  /** IANA timezone of the wedding */
  timeZone: string;
  /** UTC offset of the wedding location e.g. +05:30 (used to build calendar entries) */
  utcOffset: string;
  hero: {
    blessing: string; // Devanagari
    blessingEn: string;
    imageWide: ImageAsset;
    imageTall: ImageAsset;
    city: string;
    ogImage: string;
  };
  story: { heading: string; subheading: string; chapters: StoryChapter[] };
  events: WeddingEvent[];
  gallery: (ImageAsset & { id: string; caption?: string })[];
  venue: Venue;
  music: MusicConfig;
  rsvp: RsvpConfig;
  wishes: Wish[];
  theme: ThemeId;
  socialLinks: SocialLink[];
  demo: { themeSwitcher: boolean };
}
