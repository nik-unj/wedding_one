import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Reveal } from './Reveal';
import { TextReveal } from './TextReveal';
import { Divider } from './Ornaments';

export type Tone = 'light' | 'alt' | 'dark' | 'darker';

interface SectionProps {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
  pattern?: boolean;
}

/** A full-bleed chapter of the film. `tone` swaps the contextual colour tokens. */
export function Section({ id, tone = 'light', className, children, labelledBy, pattern }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        `tone-${tone} relative isolate overflow-x-clip bg-surface text-fg`,
        pattern && 'bg-pattern',
        'scroll-mt-0 py-24 sm:py-32 lg:py-40',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-6 sm:px-10', className)}>{children}</div>;
}

interface HeadingProps {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
  noDivider?: boolean;
}

export function SectionHeading({ id, eyebrow, title, subtitle, align = 'center', className, noDivider }: HeadingProps) {
  const center = align === 'center';
  return (
    <header className={cn('mb-14 sm:mb-20', center ? 'text-center' : 'text-left', className)}>
      {eyebrow && (
        <Reveal>
          <p className="eyebrow mb-5">{eyebrow}</p>
        </Reveal>
      )}
      <h2 id={id} className="h-section">
        <TextReveal text={title} by="word" />
      </h2>
      {subtitle && (
        <Reveal delay={0.25}>
          <p className={cn('lede mt-5', center && 'mx-auto')}>{subtitle}</p>
        </Reveal>
      )}
      {!noDivider && (
        <Reveal delay={0.35} kind="fade" className="mt-8">
          <Divider />
        </Reveal>
      )}
    </header>
  );
}
