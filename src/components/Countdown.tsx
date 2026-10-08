import { AnimatePresence, m } from 'motion/react';
import { useInvitation } from '../context/InvitationContext';
import { useCountdown } from '../lib/hooks';
import { fmt, longDate, pad } from '../lib/dates';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, EASE } from './ui/Reveal';
import { CornerFrame } from './ui/Ornaments';

function Digits({ value, label }: { value: number; label: string }) {
  const text = pad(value);
  return (
    <div className="relative flex flex-col items-center px-1 py-6 sm:px-4 sm:py-10">
      <div
        className="relative flex h-[1.05em] items-center justify-center overflow-hidden font-display text-[clamp(2.4rem,12.5vw,5.8rem)] font-light leading-none text-fg"
        style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
        aria-hidden="true"
      >
        {Array.from(text).map((ch, i) => (
          <span key={i} className="relative inline-flex w-[0.62em] justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={ch}
                initial={{ y: '70%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-70%', opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="inline-block"
              >
                {ch}
              </m.span>
            </AnimatePresence>
          </span>
        ))}
      </div>
      <span className="eyebrow mt-3 !text-[0.62rem] !tracking-[0.3em] sm:!text-xs">{label}</span>
    </div>
  );
}

export function Countdown() {
  const { inv } = useInvitation();
  const c = useCountdown(inv.countdownDate);
  const when = new Date(inv.countdownDate);

  const summary = c.done
    ? 'The wedding day has arrived'
    : `${c.days} days, ${c.hours} hours and ${c.minutes} minutes until the wedding`;

  const hoursSince = c.elapsed / 3_600_000;
  const doneLine =
    hoursSince < 30
      ? { script: 'Today, two hearts become one', sub: 'The celebrations are underway — thank you for your blessings.' }
      : { script: 'With your blessings, we are married', sub: 'Thank you for being part of our story.' };

  return (
    <Section id="countdown" tone="light" labelledBy="countdown-title" className="!py-24 sm:!py-32" pattern>
      <Container>
        <SectionHeading id="countdown-title" eyebrow="Save the moment" title="Until We Become One" />

        <Reveal kind="scale" duration={1.6}>
          <div className="relative mx-auto max-w-4xl border border-line p-3 sm:p-5">
            <CornerFrame size={44} className="-m-px" />
            <div className="bg-card/60">
              <AnimatePresence mode="wait" initial={false}>
                {c.done ? (
                  <m.div
                    key="done"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: EASE }}
                    className="px-6 py-14 text-center sm:py-20"
                  >
                    <p className="script text-shimmer pb-2 text-[clamp(2.4rem,9vw,4.6rem)]">{doneLine.script}</p>
                    <p className="lede mx-auto mt-4">{doneLine.sub}</p>
                  </m.div>
                ) : (
                  <m.div
                    key="live"
                    role="timer"
                    aria-label={summary}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-4 divide-x divide-line"
                  >
                    <Digits value={c.days} label={c.days === 1 ? 'Day' : 'Days'} />
                    <Digits value={c.hours} label="Hours" />
                    <Digits value={c.minutes} label="Minutes" />
                    <Digits value={c.seconds} label="Seconds" />
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.3} className="mt-10 text-center">
          <p className="font-display text-lg italic text-fg-soft sm:text-xl">
            {longDate(when, inv.timeZone)} · {fmt(when, inv.timeZone, { hour: 'numeric', minute: '2-digit', hour12: true }, 'en-US')} · {inv.hero.city}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
