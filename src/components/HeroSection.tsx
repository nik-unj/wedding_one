import { useRef, type ReactNode } from 'react';
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { dayNum, fmt, weekday } from '../lib/dates';
import { Divider, Mandala } from './ui/Ornaments';
import { HeroPicture } from './ui/HeroPicture';
import { Particles } from './ui/Particles';
import { TextReveal } from './ui/TextReveal';
import { EASE } from './ui/Reveal';

function Enter({ show, delay, children, className }: { show: boolean; delay: number; children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
      transition={{ duration: 1.5, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}

export function HeroSection() {
  const { inv, opened } = useInvitation();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.2]);
  const fgY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const fgOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const d = new Date(inv.weddingDate);
  const tz = inv.timeZone;

  return (
    <section
      id="top"
      ref={ref}
      aria-label="Invitation"
      className="tone-dark grain relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-deep-2 text-fg"
    >
      {/* parallax photograph */}
      <m.div className="absolute inset-0 -z-20 will-change-transform" style={reduce ? undefined : { y: bgY, scale: bgScale }}>
        <HeroPicture priority position="center 30%" />
      </m.div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-deep-2/85 via-deep-2/40 to-deep-2/95" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(8,2,4,0.7)_100%)]" />

      {/* soft moving light */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="animate-blob absolute -left-1/4 top-0 h-[70vmax] w-[70vmax] rounded-full bg-gold/20 blur-[120px]" />
        <div className="animate-blob absolute -bottom-1/3 -right-1/4 h-[60vmax] w-[60vmax] rounded-full bg-gold-light/10 blur-[120px] [animation-delay:-9s] [animation-direction:alternate-reverse]" />
      </div>
      <Mandala className="animate-spin-slower absolute left-1/2 top-1/2 -z-10 h-[150vmax] w-[150vmax] max-h-[1700px] max-w-[1700px] -translate-x-1/2 -translate-y-1/2 text-gold-light opacity-[0.07] sm:h-[130vmin] sm:w-[130vmin]" />
      <Particles count={70} className="-z-10" />

      <m.div
        className="relative flex w-full max-w-5xl flex-col items-center px-6 py-28 text-center sm:py-32"
        style={reduce ? undefined : { y: fgY, opacity: fgOpacity }}
      >
        <Enter show={opened} delay={0.2}>
          <p className="eyebrow !text-gold-light">Together with their families</p>
        </Enter>

        <h1 className="mt-8 flex flex-col items-center sm:mt-10 xl:flex-row xl:items-baseline xl:gap-8 xl:[--name-cap:min(6.6rem,calc((100vw_-_14rem)/14))]" aria-label={`${inv.bride.name} and ${inv.groom.name}`}>
          <TextReveal text={inv.bride.name} by="char" show={opened} delay={0.5} className="name-xl" />
          <m.span
            aria-hidden="true"
            className="script text-shimmer my-2 px-4 text-[clamp(4.5rem,18vw,8.5rem)] leading-[0.7] xl:my-0 xl:px-2 xl:text-[5.5rem]"
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={opened ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
            transition={{ duration: 1.8, delay: 1.5, ease: EASE }}
          >
            &amp;
          </m.span>
          <TextReveal text={inv.groom.name} by="char" show={opened} delay={1.0} className="name-xl" />
        </h1>

        <Enter show={opened} delay={2.3} className="mt-8 sm:mt-10">
          <p className="script text-[clamp(1.5rem,5vw,2.3rem)] text-on-deep/90">invite you to celebrate their wedding</p>
        </Enter>

        <Enter show={opened} delay={2.6} className="mt-8 w-full">
          <Divider className="!text-gold-light" />
        </Enter>

        <Enter show={opened} delay={2.8} className="mt-8">
          <p className="eyebrow !text-on-deep-soft">{weekday(d, tz)}</p>
          <div className="mt-3 flex items-center justify-center gap-4 font-display text-[clamp(1.7rem,7vw,3.6rem)] font-light uppercase tracking-[0.12em] sm:gap-7">
            <span>{dayNum(d, tz)}</span>
            <span className="h-8 w-px bg-gold-light/60 sm:h-12" aria-hidden="true" />
            <span>{fmt(d, tz, { month: 'long' }, 'en-GB')}</span>
            <span className="h-8 w-px bg-gold-light/60 sm:h-12" aria-hidden="true" />
            <span>{fmt(d, tz, { year: 'numeric' }, 'en-GB')}</span>
          </div>
        </Enter>

        <Enter show={opened} delay={3.1} className="mt-7">
          <p className="flex flex-col items-center gap-1.5 text-sm tracking-[0.18em] text-on-deep/90 sm:text-base">
            <MapPin size={16} strokeWidth={1.4} className="text-gold-light" aria-hidden="true" />
            <span>{inv.venue.name}</span>
            <span className="text-on-deep-soft">{inv.hero.city}</span>
          </p>
        </Enter>
      </m.div>

      {/* scroll cue */}
      <Enter show={opened} delay={3.6} className="absolute bottom-7 left-1/2 -translate-x-1/2">
        <a href="#countdown" className="flex flex-col items-center gap-3 text-on-deep-soft" aria-label="Scroll to the countdown">
          <span className="eyebrow !text-[0.62rem] !text-on-deep-soft">Scroll</span>
          <span className="relative block h-12 w-px overflow-hidden bg-gold-light/25">
            <span className="absolute inset-0 animate-[scroll-cue_2.4s_ease-in-out_infinite] bg-gold-light" />
          </span>
        </a>
      </Enter>
    </section>
  );
}
