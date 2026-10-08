import { useMemo, useRef } from 'react';
import { m, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useInvitation } from '../context/InvitationContext';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal } from './ui/Reveal';
import { EventCard } from './EventCard';
import { CalendarButton } from './CalendarButton';
import { Particles } from './ui/Particles';

export function EventTimeline() {
  const { inv } = useInvitation();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 60%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6 });

  const events = useMemo(() => [...inv.events].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)), [inv.events]);
  const dayOf = useMemo(() => {
    const dates = Array.from(new Set(events.map((e) => e.date)));
    return (date: string) => dates.indexOf(date) + 1;
  }, [events]);
  const calendarEvents = events.filter((e) => e.calendarEnabled);

  return (
    <Section id="events" tone="dark" pattern labelledBy="events-title" className="grain">
      <Particles count={30} className="-z-10 opacity-60" />
      <Container>
        <SectionHeading
          id="events-title"
          eyebrow="Join us for"
          title="Wedding Celebrations"
          subtitle="Days of colour, music and blessings — we would be honoured to have you with us for every one of them."
        />

        <div ref={ref} className="relative">
          <div className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-line lg:left-1/2 lg:-translate-x-1/2" aria-hidden="true" />
          <m.div
            className="absolute bottom-0 left-[1.1rem] top-0 w-px origin-top bg-linear-to-b from-gold via-gold-light to-gold lg:left-1/2 lg:-translate-x-1/2"
            style={{ scaleY: reduce ? 1 : grow }}
            aria-hidden="true"
          />
          <ol className="list-none">
            {events.map((ev, i) => (
              <li key={ev.id}>
                <EventCard event={ev} day={dayOf(ev.date)} index={i} />
              </li>
            ))}
          </ol>
        </div>

        {calendarEvents.length > 1 && (
          <Reveal className="mt-16 flex flex-col items-center gap-4 text-center">
            <p className="font-display text-xl italic text-fg-soft">Want every celebration in one go?</p>
            <CalendarButton event={calendarEvents} label="Add all to Calendar" variant="solid" />
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
