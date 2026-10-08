import { useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import { MailOpen } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { useBodyScrollLock } from '../lib/hooks';
import { dayNum, fmt } from '../lib/dates';
import { CornerFrame, Mandala } from './ui/Ornaments';
import { HeroPicture } from './ui/HeroPicture';
import { TextReveal } from './ui/TextReveal';
import { EASE } from './ui/Reveal';
import { Particles } from './ui/Particles';

type Phase = 'idle' | 'opening' | 'done';

/** Door half. The image lives in a viewport-wide child so both halves line up perfectly. */
function Door({ side, opening }: { side: 'left' | 'right'; opening: boolean }) {
  const left = side === 'left';
  return (
    <m.div
      className={`absolute inset-y-0 w-1/2 overflow-hidden bg-deep-2 will-change-transform ${left ? 'left-0' : 'right-0'}`}
      animate={{ x: opening ? (left ? '-101%' : '101%') : '0%' }}
      transition={{ duration: 2, delay: 0.55, ease: [0.77, 0, 0.18, 1] }}
    >
      <div className={`absolute inset-y-0 w-[200%] ${left ? 'left-0' : 'right-0'}`}>
        <div className="animate-ken absolute inset-0">
          <HeroPicture priority position="center 30%" />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-deep-2/80 via-deep-2/45 to-deep-2/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(10,3,5,0.65)_100%)]" />
      </div>
      {/* gold edge */}
      <div
        className={`absolute inset-y-0 w-px bg-linear-to-b from-transparent via-gold-light to-transparent ${left ? 'right-0' : 'left-0'}`}
        style={{ boxShadow: '0 0 18px 2px color-mix(in srgb, var(--gold) 70%, transparent)' }}
      />
    </m.div>
  );
}

export function OpeningExperience() {
  const { inv, music, open, guest } = useInvitation();
  const [phase, setPhase] = useState<Phase>('idle');
  const [ready, setReady] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(phase !== 'done');

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 250);
    btnRef.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(t);
  }, []);

  const begin = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    void music.start(); // user gesture ⇒ audio is allowed
    window.setTimeout(open, 900); // hero names begin to appear as the doors part
    window.setTimeout(() => {
      setPhase('done');
      window.scrollTo(0, 0);
    }, 3300);
  };

  if (phase === 'done') return null;

  const opening = phase === 'opening';
  const d = new Date(inv.weddingDate);
  const dateText = `${dayNum(d, inv.timeZone)} · ${fmt(d, inv.timeZone, { month: 'long' }, 'en-GB').toUpperCase()} · ${fmt(d, inv.timeZone, { year: 'numeric' }, 'en-GB')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Invitation to the wedding of ${inv.couple.displayName}`}
      className="tone-dark fixed inset-0 z-[100] h-dvh overflow-hidden text-on-deep"
    >
      <Door side="left" opening={opening} />
      <Door side="right" opening={opening} />

      {/* ambience across both doors */}
      <div className="grain pointer-events-none absolute inset-0" />
      <Particles count={60} className={opening ? 'opacity-0 transition-opacity duration-700' : ''} />

      {/* content */}
      <m.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        initial={false}
        animate={opening ? { opacity: 0, scale: 1.06, filter: 'blur(8px)' } : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <Mandala className="animate-spin-slow absolute left-1/2 top-1/2 h-[135vmax] max-h-[1500px] w-[135vmax] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 text-gold-light opacity-[0.1] sm:h-[120vmin] sm:w-[120vmin]" />
        <CornerFrame className="m-4 sm:m-8" size={64} />

        <m.div
          className="relative flex w-full max-w-3xl flex-col items-center"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <p lang="hi" className="font-deva text-[clamp(1.25rem,4.6vw,1.9rem)] text-gold-light">
            {inv.hero.blessing}
          </p>
          <p className="eyebrow mt-3 !text-on-deep-soft">{inv.hero.blessingEn}</p>

          {guest && (
            <p className="mt-6 font-display text-lg italic text-on-deep/80">
              Dear {guest}, you are cordially invited
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-2 sm:mt-10">
            <p className="flex flex-col items-center">
              <TextReveal text={inv.bride.name} by="char" show={ready} delay={0.5} className="name-xl" />
              <span className="my-1 font-display text-4xl font-light text-gold-light sm:my-2 sm:text-5xl" aria-hidden="true">
                ×
              </span>
              <TextReveal text={inv.groom.name} by="char" show={ready} delay={1.2} className="name-xl" />
            </p>
          </div>

          <m.p
            className="script mt-5 text-[clamp(1.6rem,6vw,2.4rem)] text-gold-light"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ duration: 1.6, delay: 2.2 }}
          >
            are getting married
          </m.p>

          <m.div
            className="mt-6 flex flex-col items-center gap-1.5"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ duration: 1.6, delay: 2.6 }}
          >
            <p className="font-display text-xl tracking-[0.22em] sm:text-2xl">{dateText}</p>
            <p className="eyebrow !text-on-deep-soft">{inv.hero.city}</p>
          </m.div>

          <m.div
            className="mt-10 flex flex-col items-center gap-4 sm:mt-12"
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.4, delay: 3.1, ease: EASE }}
          >
            <span className="relative inline-flex">
              <span className="absolute inset-0 animate-[ring-pulse_3.2s_ease-out_infinite] rounded-full border border-gold-light" aria-hidden="true" />
              <span className="absolute inset-0 animate-[ring-pulse_3.2s_ease-out_1.6s_infinite] rounded-full border border-gold-light" aria-hidden="true" />
              <button ref={btnRef} type="button" onClick={begin} className="btn btn-solid relative !px-9 !py-4">
                <MailOpen size={16} strokeWidth={1.5} aria-hidden="true" />
                Open Invitation
              </button>
            </span>
            <p className="animate-soft-pulse font-display text-sm italic tracking-[0.2em] text-on-deep-soft">Tap to open</p>
          </m.div>
        </m.div>
      </m.div>
    </div>
  );
}
