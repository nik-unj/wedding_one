import { useInvitation } from '../context/InvitationContext';
import { cn } from '../lib/cn';
import { fmt, timeRange, toInstant, weekday } from '../lib/dates';
import type { WeddingEvent } from '../types';
import { Reveal, RevealImage } from './ui/Reveal';

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
  const dateLine = fmt(when, tz, { day: 'numeric', month: 'long' }, 'en-GB');

  return (
    <article
      className={cn(
        'relative pb-16 pl-12 last:pb-10 lg:w-[calc(50%-3.2rem)] lg:pb-24 lg:pl-0',
        right && 'lg:ml-auto',
      )}
      aria-labelledby={`event-${event.id}`}
    >
      <div
        className={cn(
          'absolute left-0 top-8 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface',
          'lg:top-12',
          right ? 'lg:-left-[4.325rem]' : 'lg:left-auto lg:-right-[4.325rem]',
        )}
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rotate-45 bg-gold-light shadow-[0_0_14px_3px_color-mix(in_srgb,var(--gold)_70%,transparent)]" />
      </div>

      <Reveal kind={right ? 'right' : 'left'} distance={44} duration={1.4}>
        <div className="rounded-3xl border border-line bg-card p-2 sm:p-3">
          <div className="relative overflow-hidden rounded-2xl border border-line">
            <RevealImage
              asset={event.image}
              sizes="(min-width: 1024px) 36rem, (min-width: 640px) 80vw, 100vw"
              className="aspect-square w-full"
              from="bottom"
              imgClassName="object-center transition-transform duration-[2500ms] ease-out hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-deep-2/80 to-transparent" />
            <p className="absolute bottom-4 left-5 text-[0.68rem] uppercase tracking-[0.34em] text-gold-light sm:bottom-5 sm:left-6">
              Day {day}
              <span className="mx-2 text-gold/60" aria-hidden="true">
                ·
              </span>
              {weekday(when, tz)}
            </p>
          </div>

          <div className="px-4 pb-6 pt-7 sm:px-7 sm:pb-8 sm:pt-8">
            <h3
              id={`event-${event.id}`}
              className="font-display text-[clamp(2.1rem,6vw,2.8rem)] font-light uppercase leading-none tracking-[0.12em] text-fg"
            >
              {event.name}
            </h3>
            <p className="script mt-3 text-[clamp(1.45rem,4vw,1.8rem)] text-accent">{dateLine}</p>
            <p className="mt-1 font-display text-lg tracking-wide text-fg">{timeRange(event, tz, inv.utcOffset)}</p>
            <p className="mt-5 text-fg-soft">{event.description}</p>

            <div className="mt-7 grid gap-6 border-t border-line pt-7 sm:grid-cols-2">
              {/* <div>
                <p className="eyebrow">Venue</p>
                <p className="mt-2 font-display text-xl leading-tight text-fg">{event.venue}</p>
                <p className="mt-1 text-sm text-fg-soft">{event.address}</p>
              </div> */}
              <div>
                <p className="eyebrow">Attire</p>
                <p className="mt-2 text-sm uppercase leading-relaxed tracking-[0.08em] text-fg">{event.dressCode}</p>
                {event.dressPalette && (
                  <ul className="mt-3 flex gap-2" aria-label="Suggested colour palette">
                    {event.dressPalette.map((c) => (
                      <li key={c} className="h-4 w-4 rounded-full border border-white/25" style={{ background: c }} title={c} />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
