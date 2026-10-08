import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Heart, Quote } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import type { Wish } from '../types';
import { postJson, storage } from '../lib/storage';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, EASE } from './ui/Reveal';
import { Field } from './ui/Field';
import { RsvpForm } from './RsvpForm';

const MAX = 280;

function WishCard({ wish }: { wish: Wish }) {
  return (
    <m.li
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative border border-line bg-card p-6"
      style={{ borderRadius: 'var(--r-card)' }}
    >
      <Quote size={22} strokeWidth={1.2} className="absolute right-5 top-5 text-accent/50" aria-hidden="true" />
      <blockquote className="pr-6 font-display text-lg italic leading-relaxed text-fg">“{wish.message}”</blockquote>
      <p className="mt-4 text-[0.72rem] uppercase tracking-[0.26em] text-accent">— {wish.name}</p>
    </m.li>
  );
}

function Wishes() {
  const { inv, guest } = useInvitation();
  const key = `wishes:${inv.slug}`;
  const [mine, setMine] = useState<Wish[]>(() => storage.get<Wish[]>(key, []));
  const [name, setName] = useState(guest ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState('');
  const [all, setAll] = useState(false);

  const wishes = useMemo(() => [...[...mine].sort((a, b) => b.createdAt - a.createdAt), ...[...inv.wishes].sort((a, b) => b.createdAt - a.createdAt)], [mine, inv.wishes]);
  const shown = all ? wishes : wishes.slice(0, 4);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = 'Please add your name.';
    if (message.trim().length < 4) errs.message = 'Write a few words for the couple.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    const wish: Wish = { id: `w-${Date.now()}`, name: name.trim(), message: message.trim(), createdAt: Date.now() };
    if (inv.rsvp.endpoint) await postJson(inv.rsvp.endpoint, { type: 'wish', invitation: inv.slug, ...wish });
    const next = [wish, ...mine];
    setMine(next);
    storage.set(key, next);
    setMessage('');
    setSending(false);
    setThanks(`Thank you, ${wish.name.split(' ')[0]} — your blessing means the world to us.`);
    window.setTimeout(() => setThanks(''), 7000);
  };

  return (
    <div className="flex flex-col">
      <div className="border border-line bg-card p-6 sm:p-10" style={{ borderRadius: 'var(--r-card)' }}>
        <p className="eyebrow">Guest book</p>
        <h3 className="mt-3 font-display text-3xl font-light text-fg sm:text-4xl">Leave a blessing</h3>
        <form noValidate onSubmit={submit} className="mt-7 flex flex-col gap-5">
          <Field label="Your name" required error={errors.name}>
            {(a) => <input {...a} className="field" type="text" name="wish-name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} placeholder="Your name" />}
          </Field>
          <Field label="Your wishes" required error={errors.message} hint={`${message.length}/${MAX}`}>
            {(a) => (
              <textarea
                {...a}
                className="field min-h-28 resize-y"
                name="wish-message"
                rows={4}
                maxLength={MAX}
                value={message}
                onChange={(e) => { setMessage(e.target.value); setErrors((x) => ({ ...x, message: undefined })); }}
                placeholder="Write your blessing, a memory, or a little advice for the newlyweds…"
              />
            )}
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-solid" disabled={sending}>
              <Heart size={15} strokeWidth={1.6} aria-hidden="true" />
              {sending ? 'Sending…' : 'Send blessings'}
            </button>
            <p role="status" aria-live="polite" className="min-h-6 text-sm text-accent">
              {thanks}
            </p>
          </div>
        </form>
      </div>

      <ul className="mt-6 grid gap-4" aria-label="Wishes from family and friends">
        <AnimatePresence initial={false}>
          {shown.map((w) => (
            <WishCard key={w.id} wish={w} />
          ))}
        </AnimatePresence>
      </ul>

      {wishes.length > 4 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="btn btn-outline btn-sm mt-6 self-center">
          {all ? 'Show fewer' : `Read all ${wishes.length} wishes`}
        </button>
      )}
    </div>
  );
}

export function WishesSection() {
  const { inv } = useInvitation();
  return (
    <Section id="rsvp" tone="alt" pattern labelledBy="rsvp-title">
      <Container>
        <SectionHeading
          id="rsvp-title"
          eyebrow="With love"
          title="Your Presence, Our Blessing"
          subtitle="Your warm wishes and heartfelt blessings would mean the world to us."
        />
        <div className={inv.rsvp.enabled ? 'grid items-start gap-10 lg:grid-cols-2 lg:gap-12' : 'mx-auto max-w-2xl'}>
          {inv.rsvp.enabled && (
            <Reveal>
              <RsvpForm />
            </Reveal>
          )}
          <Reveal delay={0.15}>
            <Wishes />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
