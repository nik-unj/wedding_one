import { m } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { Divider, Mandala } from './ui/Ornaments';
import { Particles } from './ui/Particles';
import { Reveal, EASE } from './ui/Reveal';
import { TextReveal } from './ui/TextReveal';
import { HeroPicture } from './ui/HeroPicture';
import { longDate } from '../lib/dates';

export function Footer() {
  const { inv } = useInvitation();

  return (
    <footer id="footer" className="tone-darker grain relative isolate overflow-hidden bg-surface px-6 pb-16 pt-28 text-center text-fg sm:pt-40">
      <div className="absolute inset-0 -z-20 opacity-35">
        <HeroPicture position="center 40%" />
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-deep-2 via-deep-2/70 to-deep-2" />
      <Mandala className="animate-spin-slow absolute left-1/2 top-1/2 -z-10 h-[140vmax] w-[140vmax] max-h-[1500px] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 text-gold-light opacity-[0.08] sm:h-[120vmin] sm:w-[120vmin]" />
      <Particles count={50} className="-z-10" />

      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <m.span
          className="hairline block w-full max-w-xs origin-center"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.2, ease: EASE }}
          aria-hidden="true"
        />

        <Reveal className="mt-12">
          <p className="script text-[clamp(2rem,7vw,3.2rem)] text-gold-light">With love, laughter &amp; blessings</p>
        </Reveal>

        <h2 className="mt-8 font-display text-[clamp(2.1rem,8.5vw,4.6rem)] font-light uppercase leading-tight tracking-[0.12em]">
          <TextReveal text={`${inv.bride.name} & ${inv.groom.name}`} by="word" stagger={0.18} />
        </h2>

        <Reveal delay={0.3} className="mt-6">
          <Divider className="!text-gold-light" />
        </Reveal>

        <Reveal delay={0.4} className="mt-8">
          <p className="font-display text-xl italic text-on-deep/90 sm:text-2xl">Wishing you could be there to celebrate with us.</p>
        </Reveal>

        <Reveal delay={0.5} className="mt-3">
          <p className="eyebrow !text-on-deep-soft">
            {longDate(inv.weddingDate, inv.timeZone)} · {inv.hero.city}
          </p>
          {inv.couple.hashtag && <p className="mt-5 text-sm tracking-[0.2em] text-gold-light">{inv.couple.hashtag}</p>}
        </Reveal>

        <Reveal delay={0.6} className="mt-12">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn btn-outline btn-sm"
          >
            <ArrowUp size={15} strokeWidth={1.5} aria-hidden="true" />
            Back to the beginning
          </button>
        </Reveal>

        <p className="mt-16 text-[0.68rem] uppercase tracking-[0.3em] text-on-deep-soft/70">
          {inv.couple.monogram} · {new Date(inv.weddingDate).getFullYear()}
        </p>
      </div>
    </footer>
  );
}
