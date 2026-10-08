import { m, type Variants } from 'motion/react';
import { cn } from '../../lib/cn';
import { EASE } from './Reveal';

interface Props {
  text: string;
  by?: 'word' | 'char';
  /** When defined the animation is controlled (true = play). Otherwise it plays on scroll-into-view. */
  show?: boolean;
  delay?: number;
  stagger?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  /** Extra classes for each token wrapper */
  tokenClassName?: string;
}

const wordV: Variants = {
  hidden: { y: '115%', opacity: 0 },
  shown: { y: '0%', opacity: 1 },
};
const charV: Variants = {
  hidden: { y: '40%', opacity: 0, filter: 'blur(10px)' },
  shown: { y: '0%', opacity: 1, filter: 'blur(0px)' },
};

const tags = { h1: m.h1, h2: m.h2, h3: m.h3, p: m.p, span: m.span, div: m.div } as const;

/** Masked word / letter reveal for headings and the couple's names. */
export function TextReveal({
  text,
  by = 'word',
  show,
  delay = 0,
  stagger,
  className,
  as = 'span',
  tokenClassName,
}: Props) {
  const Tag = tags[as] as typeof m.span;
  const tokens = by === 'word' ? text.split(' ') : Array.from(text);
  const step = stagger ?? (by === 'word' ? 0.09 : 0.065);
  const controlled = show !== undefined;

  return (
    <Tag
      className={cn('inline-block', className)}
      initial="hidden"
      {...(controlled
        ? { animate: show ? 'shown' : 'hidden' }
        : { whileInView: 'shown', viewport: { once: true, amount: 0.6 } })}
      transition={{ staggerChildren: step, delayChildren: delay }}
    >
      <span className="sr-only">{text}</span>
      {by === 'word'
        ? tokens.map((t, i) => (
            <span
              key={`${t}-${i}`}
              aria-hidden="true"
              className={cn('inline-block overflow-hidden pb-[0.12em] align-bottom', i < tokens.length - 1 && 'mr-[0.26em]')}
            >
              <m.span className={cn('inline-block', tokenClassName)} variants={wordV} transition={{ duration: 1.2, ease: EASE }}>
                {t}
              </m.span>
            </span>
          ))
        : // letters stay grouped per word so a long name can wrap between words but never mid-word
          text.split(' ').map((word, wi, words) => (
            <span key={`${word}-${wi}`} aria-hidden="true" className="inline-block whitespace-nowrap">
              {Array.from(word).map((ch, ci) => (
                <span key={ci} className="inline-block">
                  <m.span className={cn('inline-block', tokenClassName)} variants={charV} transition={{ duration: 1.4, ease: EASE }}>
                    {ch}
                  </m.span>
                </span>
              ))}
              {wi < words.length - 1 && <span className="inline-block w-[0.3em]" />}
            </span>
          ))}
    </Tag>
  );
}
