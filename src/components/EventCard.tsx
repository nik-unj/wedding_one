import { Clock, MapPin, Navigation, Shirt } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import type { WeddingEvent } from '../types';
import { dayNum, monthShort, timeRange, toInstant, weekday } from '../lib/dates';
import { mapsDirectionsUrl } from '../lib/calendar';
import { Reveal, RevealImage } from './ui/Reveal';
import { CalendarButton } from './CalendarButton';
import { cn } from '../lib/cn';

interface Props {
  event: WeddingEvent;
  /** 1-based celebration day (events on the same date share a day) */
  day: number;
  index: number;
}

export function EventCard({ event, day, index }: Props) {
  const { inv } = useInvitation();
  const tz = inv.timeZone;
  const when = toInstant(event.date, '12:00', inv.utcOffset);
  const right = index % 2 === 1;

  return (
    <article
      className={cn(
        'relative pb-16 pl-12 last:pb-0 lg:w-[calc(50%-3.2rem)] lg:pb-24 lg:pl-0',
        right && 'lg:ml-auto',
      )}
      aria-labelledby={`event-${event.id}`}
    >
      {/* timeline node */}
      <div
        className={cn(
          'absolute left-0 top-7 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface',
          'lg:top-10',
          right ? 'lg:-left-[4.325rem]' : 'lg:left-auto lg:-right-[4.325rem]',
        )}
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rotate-45 bg-gold-light shadow-[0_0_14px_3px_color-mix(in_srgb,var(--gold)_70%,transparent)]" />
      </div>

      <Reveal kind={right ? 'right' : 'left'} distance={44} duration={1.4}>
        <div className="border border-line bg-card backdrop-blur-sm" style={{ borderRadius: 'var(--r-card)' }}>
          {/* image */}
          <div className="relative">
            <RevealImage
              asset={event.image}
              sizes="(min-width: 1024px) 36rem, (min-width: 640px) 80vw, 100vw"
              className="aspect-[4/3] w-full"
              from="bottom"
              imgClassName="transition-transform duration-[2500ms] ease-out hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-deep-2/75 via-transparent to-deep-2/10" />
            <div className="glass absolute left-4 top-4 flex flex-col items-center px-4 py-2.5 text-center sm:left-5 sm:top-5" style={{ borderRadius: 'min(var(--r-card), 6px)' }}>
              <span className="font-display text-3xl leading-none">{dayNum(when, tz)}</span>
              <span className="mt-1 text-[0.62rem] tracking-[0.3em] text-gold-light">{monthShort(when, tz)}</span>
            </div>
            <p className="absolute bottom-4 left-5 right-5 text-[0.7rem] uppercase tracking-[0.34em] text-gold-light sm:bottom-5">
              Day {day} · {weekday(when, tz)}
            </p>
          </div>

          {/* body */}
          <div className="p-6 sm:p-9">
            <h3 id={`event-${event.id}`} className="font-display text-[clamp(2rem,6vw,2.9rem)] font-light uppercase leading-none tracking-[0.1em] text-fg">
              {event.name}
            </h3>
            <p className="mt-5 text-fg-soft">{event.description}</p>

            <dl className="mt-7 space-y-5 border-t border-line pt-7">
              <div className="flex gap-4">
                <dt className="mt-0.5 text-accent">
                  <Clock size={18} strokeWidth={1.4} aria-hidden="true" />
                  <span className="sr-only">Time</span>
                </dt>
                <dd>
                  <p className="font-display text-xl text-fg">{timeRange(event, tz, inv.utcOffset)}</p>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="mt-0.5 text-accent">
                  <MapPin size={18} strokeWidth={1.4} aria-hidden="true" />
                  <span className="sr-only">Venue</span>
                </dt>
                <dd>
                  <p className="font-display text-xl text-fg">{event.venue}</p>
                  <p className="text-sm text-fg-soft">{event.address}</p>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="mt-0.5 text-accent">
                  <Shirt size={18} strokeWidth={1.4} aria-hidden="true" />
                  <span className="sr-only">Dress code</span>
                </dt>
                <dd>
                  <p className="text-sm uppercase tracking-[0.12em] text-fg">{event.dressCode}</p>
                  {event.dressPalette && (
                    <ul className="mt-3 flex gap-2" aria-label="Suggested colour palette">
                      {event.dressPalette.map((c) => (
                        <li
                          key={c}
                          className="h-5 w-5 rounded-full border border-white/30 shadow-inner"
                          style={{ background: c }}
                          title={c}
                        />
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                className="btn btn-solid btn-sm"
                href={event.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${event.venue} in Google Maps (opens in a new tab)`}
              >
                <MapPin size={15} strokeWidth={1.6} aria-hidden="true" />
                View on Map
              </a>
              <a
                className="btn btn-outline btn-sm"
                href={mapsDirectionsUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get directions to ${event.venue} (opens in a new tab)`}
              >
                <Navigation size={15} strokeWidth={1.5} aria-hidden="true" />
                Directions
              </a>
              {event.calendarEnabled && <CalendarButton event={event} />}
            </div>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
