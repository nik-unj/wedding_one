import { useRef, type ReactNode } from 'react';
import { m, useInView, type Variants } from 'motion/react';
import { cn } from '../../lib/cn';
import type { ImageAsset } from '../../types';
import { Img } from './Img';

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Phones/tablets: guests flick-scroll, so reveals start before content enters and finish quicker. */
export const COMPACT =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
export const VIEWPORT_MARGIN = COMPACT ? '0px 0px 25% 0px' : '0px 0px -6% 0px';

type Kind = 'up' | 'fade' | 'scale' | 'left' | 'right';

const variants = (kind: Kind, distance: number): Variants => {
  const hidden =
    kind === 'up'
      ? { opacity: 0, y: distance }
      : kind === 'left'
        ? { opacity: 0, x: -distance }
        : kind === 'right'
          ? { opacity: 0, x: distance }
          : kind === 'scale'
            ? { opacity: 0, scale: 0.94 }
            : { opacity: 0 };
  return { hidden, shown: { opacity: 1, x: 0, y: 0, scale: 1 } };
};

interface RevealProps {
  children: ReactNode;
  kind?: Kind;
  delay?: number;
  duration?: number;
  distance?: number;
  amount?: number;
  className?: string;
  as?: 'div' | 'p' | 'li' | 'span' | 'h2' | 'h3' | 'blockquote' | 'figure';
}

const tags = {
  div: m.div,
  p: m.p,
  li: m.li,
  span: m.span,
  h2: m.h2,
  h3: m.h3,
  blockquote: m.blockquote,
  figure: m.figure,
} as const;

/** Scroll-triggered fade / slide / scale. Slow and quiet by design. */
export function Reveal({
  children,
  kind = 'up',
  delay = 0,
  duration = 1.2,
  distance = 34,
  amount = 0.2,
  className,
  as = 'div',
}: RevealProps) {
  const Tag = tags[as] as typeof m.div;
  return (
    <Tag
      className={className}
      variants={variants(kind, COMPACT ? Math.min(distance, 18) : distance)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: COMPACT ? 0 : amount, margin: VIEWPORT_MARGIN }}
      transition={COMPACT ? { duration: Math.min(duration, 0.7), delay: delay * 0.4, ease: EASE } : { duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

interface RevealImageProps {
  asset: ImageAsset;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  delay?: number;
  /** direction the mask opens from */
  from?: 'bottom' | 'left' | 'right' | 'center';
  priority?: boolean;
}

const clipFrom = {
  bottom: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  center: 'inset(50% 50% 50% 50%)',
} as const;

/** Cinematic image reveal: a mask wipes open while the photo settles from a slight zoom. */
export function RevealImage({ asset, sizes, className, imgClassName, delay = 0, from = 'bottom', priority }: RevealImageProps) {
  // Observe an un-clipped wrapper: browsers report a fully clip-path'd element as
  // non-intersecting, which would stop the mask from ever opening.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: COMPACT ? 0 : 0.15, margin: COMPACT ? VIEWPORT_MARGIN : undefined });
  const wait = inView ? (COMPACT ? delay * 0.4 : delay) : 0;
  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <m.div
        className="h-full w-full overflow-hidden"
        initial={false}
        animate={{ clipPath: inView ? 'inset(0% 0% 0% 0%)' : clipFrom[from] }}
        transition={{ duration: inView ? (COMPACT ? 0.8 : 1.6) : 0, delay: wait, ease: [0.76, 0, 0.24, 1] }}
        style={{ clipPath: clipFrom[from] }}
      >
        <m.div
          className="h-full w-full"
          initial={false}
          animate={{ scale: inView ? 1 : COMPACT ? 1.12 : 1.28 }}
          transition={{ duration: inView ? (COMPACT ? 1.1 : 2.2) : 0, delay: wait, ease: EASE }}
        >
          <Img asset={asset} sizes={sizes} priority={priority} className={cn('h-full w-full object-cover', imgClassName)} />
        </m.div>
      </m.div>
    </div>
  );
}
