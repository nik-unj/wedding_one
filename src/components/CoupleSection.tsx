import { MapPin } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import type { Person } from '../types';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, RevealImage } from './ui/Reveal';
import { cn } from '../lib/cn';

function PersonCard({ person, className }: { person: Person; className?: string }) {
  return (
    <article className={cn('flex flex-col items-center text-center', className)}>
      <div className="arch-outline arch relative w-full max-w-[19rem] sm:max-w-[22rem]">
        <RevealImage
          asset={person.photo}
          sizes="(min-width: 768px) 22rem, 19rem"
          className="arch aspect-[3/4] w-full"
          from="bottom"
        />
      </div>

      <Reveal delay={0.2} className="mt-10 flex flex-col items-center">
        <p className="script text-[clamp(2rem,6vw,2.8rem)] text-accent">{person.role}</p>
        <h3 className="name-md mt-1 uppercase tracking-[0.12em] text-fg">{person.name}</h3>
        <p className="mt-4 max-w-xs text-sm uppercase tracking-[0.14em] text-fg-soft">
          {person.relation} {person.mother} &amp; {person.father}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-fg-soft">
          <MapPin size={14} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
          {person.city}
        </p>
        {person.tagline && <p className="mt-5 max-w-xs font-display text-lg italic leading-snug text-fg-soft">“{person.tagline}”</p>}
      </Reveal>
    </article>
  );
}

export function CoupleSection() {
  const { inv } = useInvitation();
  return (
    <Section id="couple" tone="alt" labelledBy="couple-title">
      <Container>
        <SectionHeading id="couple-title" eyebrow="Meet the couple" title="Two Hearts, One Promise" />

        <div className="relative grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-24">
          <PersonCard person={inv.bride} />

          {/* ampersand */}
          <div
            className="script text-shimmer pointer-events-none flex items-center justify-center py-2 text-[5rem] leading-none md:absolute md:left-1/2 md:top-[28%] md:-translate-x-1/2 md:text-[6.5rem]"
            aria-hidden="true"
          >
            <span className="px-4">&amp;</span>
          </div>

          <PersonCard person={inv.groom} className="md:mt-28" />
        </div>
      </Container>
    </Section>
  );
}
