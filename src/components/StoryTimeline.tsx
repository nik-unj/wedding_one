import { useRef } from 'react';
import { m, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useInvitation } from '../context/InvitationContext';
import type { StoryChapter } from '../types';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, RevealImage } from './ui/Reveal';
import { TextReveal } from './ui/TextReveal';
import { cn } from '../lib/cn';

function Chapter({ chapter, index }: { chapter: StoryChapter; index: number }) {
  const flip = index % 2 === 1;
  const num = String(index + 1).padStart(2, '0');

  return (
    <article className="relative pb-20 pl-14 last:pb-0 md:grid md:grid-cols-2 md:items-center md:gap-x-24 md:pb-32 md:pl-0">
      {/* spine node */}
      <div className="absolute left-0 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface md:left-1/2 md:-translate-x-1/2">
        <span className="font-display text-sm tracking-widest text-accent">{num}</span>
      </div>

      <div className={cn(flip && 'md:order-2')}>
        <Reveal kind={flip ? 'right' : 'left'} distance={50}>
          <p className="eyebrow">{chapter.kicker}</p>
        </Reveal>
        <h3 className="mt-4 font-display text-[clamp(2rem,6vw,3.2rem)] font-light leading-tight text-fg">
          <TextReveal text={chapter.title} />
        </h3>
        <Reveal delay={0.2}>
          <p className="mt-5 max-w-md text-fg-soft">{chapter.text}</p>
        </Reveal>
      </div>

      <div className={cn('mt-8 md:mt-0', flip ? 'md:order-1' : '')}>
        <figure className="relative border border-line bg-card p-2 sm:p-3" style={{ borderRadius: 'var(--r-card)' }}>
          <RevealImage
            asset={chapter.image}
            sizes="(min-width: 768px) 40vw, 85vw"
            className="aspect-[4/3] w-full"
            from={flip ? 'right' : 'left'}
          />
          <figcaption className="sr-only">{chapter.image.alt}</figcaption>
        </figure>
      </div>
    </article>
  );
}

export function StoryTimeline() {
  const { inv } = useInvitation();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 55%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6 });

  return (
    <Section id="story" tone="light" pattern labelledBy="story-title">
      <Container>
        <SectionHeading id="story-title" eyebrow="Our story" title={inv.story.heading} subtitle={inv.story.subheading} />

        <div ref={ref} className="relative">
          {/* the thread */}
          <div className="absolute bottom-0 left-5 top-0 w-px -translate-x-1/2 bg-line md:left-1/2" aria-hidden="true" />
          <m.div
            className="absolute bottom-0 left-5 top-0 w-px origin-top -translate-x-1/2 bg-linear-to-b from-gold-deep via-gold to-gold-light md:left-1/2"
            style={{ scaleY: reduce ? 1 : grow }}
            aria-hidden="true"
          />
          <div>
            {inv.story.chapters.map((c, i) => (
              <Chapter key={c.id} chapter={c} index={i} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
