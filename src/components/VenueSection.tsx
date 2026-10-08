import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, m, useInView } from 'motion/react';
import { BedDouble, Car, ExternalLink, MapPin, Navigation, Plane, TrainFront } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import type { VenueNote, WeddingEvent } from '../types';
import { mapsDirectionsUrl, mapsEmbedUrl } from '../lib/calendar';
import { longDate, timeLabel, eventRange, toInstant } from '../lib/dates';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, EASE } from './ui/Reveal';
import { CornerFrame } from './ui/Ornaments';
import { cn } from '../lib/cn';

interface VenueEntry {
  key: string;
  name: string;
  address: string;
  city: string;
  mapsUrl: string;
  mapsQuery?: string;
  events: WeddingEvent[];
}

const noteIcons = {
  plane: Plane,
  train: TrainFront,
  car: Car,
  bed: BedDouble,
} as const;

function Note({ note }: { note: VenueNote }) {
  const Icon = noteIcons[note.icon];
  return (
    <div className="flex gap-4 border border-line bg-card p-5" style={{ borderRadius: 'var(--r-card)' }}>
      <Icon size={22} strokeWidth={1.3} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <div>
        <p className="font-display text-lg text-fg">{note.title}</p>
        <p className="mt-1 text-sm text-fg-soft">{note.text}</p>
      </div>
    </div>
  );
}

export function VenueSection() {
  const { inv, theme } = useInvitation();
  const tz = inv.timeZone;

  /* Each event may have its own venue — group events by venue. */
  const venues = useMemo<VenueEntry[]>(() => {
    const map = new Map<string, VenueEntry>();
    const addVenue = (v: Omit<VenueEntry, 'events' | 'key'>) => {
      if (!map.has(v.name)) map.set(v.name, { ...v, key: v.name, events: [] });
    };
    const sorted = [...inv.events].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    sorted.forEach((ev) => {
      addVenue({ name: ev.venue, address: ev.address, city: ev.city, mapsUrl: ev.mapsUrl, mapsQuery: ev.mapsQuery });
      map.get(ev.venue)!.events.push(ev);
    });
    addVenue(inv.venue); // main venue may not be tied to an event
    const list = Array.from(map.values());
    // wedding venue first
    return list.sort((a, b) => (a.name === inv.venue.name ? -1 : b.name === inv.venue.name ? 1 : 0));
  }, [inv.events, inv.venue]);

  const [activeKey, setActiveKey] = useState(venues[0]?.key);
  const active = venues.find((v) => v.key === activeKey) ?? venues[0];
  const mapRef = useRef<HTMLDivElement>(null);
  const seen = useInView(mapRef, { once: true, margin: '300px 0px' });
  const [mapLoaded, setMapLoaded] = useState(false);

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + venues.length) % venues.length;
    setActiveKey(venues[next].key);
    document.getElementById(`venue-tab-${next}`)?.focus();
    setMapLoaded(false);
  };

  if (!active) return null;

  return (
    <Section id="venue" tone="light" pattern labelledBy="venue-title">
      <Container>
        <SectionHeading id="venue-title" eyebrow="The venues" title="Find Your Way To Us" subtitle="Every celebration has its own setting — choose a venue to see the map, directions and what happens there." />

        {venues.length > 1 && (
          <Reveal className="mb-10 flex justify-center">
            <div role="tablist" aria-label="Venues" className="flex flex-wrap justify-center gap-2">
              {venues.map((v, i) => {
                const selected = v.key === active.key;
                return (
                  <button
                    key={v.key}
                    id={`venue-tab-${i}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="venue-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => {
                      if (!selected) setMapLoaded(false);
                      setActiveKey(v.key);
                    }}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={cn(
                      'btn btn-sm !tracking-[0.16em] transition-colors',
                      selected ? 'btn-solid' : 'btn-outline',
                    )}
                  >
                    <MapPin size={14} strokeWidth={1.6} aria-hidden="true" />
                    {v.name}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        <div id="venue-panel" role="tabpanel" aria-labelledby={`venue-tab-${venues.findIndex((v) => v.key === active.key)}`} className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* map */}
          <Reveal kind="scale" duration={1.5} className="lg:col-span-7">
            <div ref={mapRef} className="relative h-full min-h-[22rem] border border-line bg-paper-2 p-2 sm:p-3 lg:min-h-[32rem]" style={{ borderRadius: 'var(--r-card)' }}>
              <CornerFrame size={40} className="m-0.5" />
              <div className="relative h-full min-h-[20rem] overflow-hidden bg-paper-2 lg:min-h-[30rem]">
                {/* placeholder shown until the map is ready (or if offline) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-fg-soft">
                  <MapPin size={30} strokeWidth={1.2} className="text-accent" aria-hidden="true" />
                  <p className="font-display text-xl text-fg">{active.name}</p>
                  <p className="text-sm">{active.address}</p>
                </div>
                {seen && (
                  <iframe
                    key={active.key}
                    title={`Map showing ${active.name}`}
                    src={mapsEmbedUrl(active)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    onLoad={() => setMapLoaded(true)}
                    className={cn(
                      'absolute inset-0 h-full w-full border-0 transition-opacity duration-1000',
                      mapLoaded ? 'opacity-100' : 'opacity-0',
                      theme === 'ivory' ? '[filter:grayscale(1)_contrast(1.05)_sepia(0.15)]' : '[filter:saturate(0.75)_sepia(0.22)_contrast(1.02)]',
                    )}
                  />
                )}
              </div>
            </div>
          </Reveal>

          {/* details */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <AnimatePresence mode="wait">
              <m.div
                key={active.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <p className="eyebrow">{active.city}</p>
                <h3 className="mt-3 font-display text-[clamp(2.1rem,6vw,3rem)] font-light leading-tight text-fg">{active.name}</h3>
                <address className="mt-4 text-lg not-italic text-fg-soft">{active.address}</address>

                {active.events.length > 0 && (
                  <ul className="mt-7 space-y-3 border-y border-line py-6">
                    {active.events.map((ev) => {
                      const { start } = eventRange(ev, inv.utcOffset);
                      return (
                        <li key={ev.id} className="flex items-baseline justify-between gap-4">
                          <span className="font-display text-xl uppercase tracking-[0.1em] text-fg">{ev.name}</span>
                          <span className="text-right text-sm text-fg-soft">
                            {longDate(toInstant(ev.date, '12:00', inv.utcOffset), tz).replace(/ 20\d\d$/, '')} · {timeLabel(start, tz)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="btn btn-solid" href={mapsDirectionsUrl(active)} target="_blank" rel="noopener noreferrer">
                    <Navigation size={15} strokeWidth={1.6} aria-hidden="true" />
                    Get Directions
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <a className="btn btn-outline" href={active.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={15} strokeWidth={1.5} aria-hidden="true" />
                    Open in Google Maps
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        {inv.venue.notes && (
          <Reveal className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {inv.venue.notes.map((n) => (
              <Note key={n.title} note={n} />
            ))}
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
