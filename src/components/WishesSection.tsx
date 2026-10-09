import { m } from 'motion/react';
import { Quote } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import type { Wish } from '../types';
import { Container, Section, SectionHeading } from './ui/Section';
import { EASE } from './ui/Reveal';

function WishCard({ wish, index }: { wish: Wish; index: number }) {
  return (
    <m.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px 20% 0px' }}
      transition={{ duration: 0.7, delay: (index % 2) * 0.08, ease: EASE }}
      className="relative border border-line bg-card p-6 sm:p-8"
      style={{ borderRadius: 'var(--r-card)' }}
    >
      <Quote size={22} strokeWidth={1.2} className="absolute right-5 top-5 text-accent/50" aria-hidden="true" />
      <blockquote className="pr-6 font-display text-lg italic leading-relaxed text-fg sm:text-xl">“{wish.message}”</blockquote>
      <p className="mt-5 text-[0.72rem] uppercase tracking-[0.26em] text-accent">— {wish.name}</p>
    </m.li>
  );
}

export function WishesSection() {
  const { inv } = useInvitation();
  const blessings = [...inv.wishes].sort((a, b) => a.createdAt - b.createdAt).slice(0, 4);

  return (
    <Section id="blessings" tone="alt" pattern labelledBy="blessings-title">
      <Container>
        <SectionHeading
          id="blessings-title"
          eyebrow="With love"
          title="Blessings"
          subtitle="A few words from the people who have walked with us to this day."
        />
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5" aria-label="Blessings from family and friends">
          {blessings.map((w, i) => (
            <WishCard key={w.id} wish={w} index={i} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}
