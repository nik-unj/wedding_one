import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { postJson, storage } from '../lib/storage';
import { longDate } from '../lib/dates';
import { Field } from './ui/Field';
import { CalendarButton } from './CalendarButton';
import { EASE } from './ui/Reveal';
import { cn } from '../lib/cn';

interface RsvpData {
  name: string;
  contact: string;
  attending: 'yes' | 'no' | '';
  guests: number;
  events: string[];
  notes: string;
}

interface Saved extends RsvpData {
  submittedAt: number;
  delivered: boolean | null;
}

type Errors = Partial<Record<'name' | 'contact' | 'attending' | 'events', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d][\d\s().-]{6,}$/;

export function RsvpForm() {
  const { inv, guest } = useInvitation();
  const key = `rsvp:${inv.slug}`;
  const saved = useMemo(() => storage.get<Saved | null>(key, null), [key]);

  const [data, setData] = useState<RsvpData>(
    () =>
      saved ?? {
        name: guest ?? '',
        contact: '',
        attending: '',
        guests: 1,
        events: inv.events.map((e) => e.id),
        notes: '',
      },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>(saved ? 'done' : 'idle');
  const [delivered, setDelivered] = useState<boolean | null>(saved?.delivered ?? null);

  const set = <K extends keyof RsvpData>(k: K, v: RsvpData[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (data.name.trim().length < 2) e.name = 'Please tell us your name.';
    const c = data.contact.trim();
    if (c && !EMAIL.test(c) && !PHONE.test(c)) e.contact = 'Enter a valid phone number or email address.';
    if (!data.attending) e.attending = 'Please let us know if you can join us.';
    if (data.attending === 'yes' && data.events.length === 0) e.events = 'Choose at least one celebration.';
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      // move focus to the first problem
      const first = Object.keys(e)[0];
      document.querySelector<HTMLElement>(`[data-rsvp="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    const payload = {
      type: 'rsvp',
      invitation: inv.slug,
      ...data,
      name: data.name.trim(),
      contact: data.contact.trim(),
      notes: data.notes.trim(),
      guests: data.attending === 'yes' ? data.guests : 0,
      events: data.attending === 'yes' ? data.events : [],
      submittedAt: new Date().toISOString(),
    };
    let ok: boolean | null = null;
    if (inv.rsvp.endpoint) ok = await postJson(inv.rsvp.endpoint, payload);
    storage.set(key, { ...payload, submittedAt: Date.now(), delivered: ok } satisfies Saved);
    setDelivered(ok);
    setStatus('done');
  };

  const edit = () => setStatus('idle');

  const whatsappHref = useMemo(() => {
    if (!inv.rsvp.whatsapp) return null;
    const attending = data.attending === 'yes';
    const text = attending
      ? `Hello! This is ${data.name.trim()}. We will be joining the wedding celebrations of ${inv.couple.displayName} (${data.guests} guest${data.guests > 1 ? 's' : ''}).`
      : `Hello! This is ${data.name.trim()}. Sadly we won't be able to make it to the wedding of ${inv.couple.displayName}, but we send our love and blessings.`;
    return `https://wa.me/${inv.rsvp.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  }, [inv.rsvp.whatsapp, inv.couple.displayName, data.attending, data.name, data.guests]);

  const deadline = longDate(new Date(`${inv.rsvp.deadline}T12:00:00${inv.utcOffset}`), inv.timeZone);

  return (
    <div className="border border-line bg-card p-6 sm:p-10" style={{ borderRadius: 'var(--r-card)' }}>
      <p className="eyebrow">RSVP</p>
      <h3 className="mt-3 font-display text-3xl font-light text-fg sm:text-4xl">Will you join us?</h3>
      <p className="mt-2 text-fg-soft">
        Kindly respond by <span className="text-fg">{deadline}</span>.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {status === 'done' ? (
          <m.div
            key="done"
            role="status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-8 flex flex-col items-start gap-5"
          >
            <CheckCircle2 size={38} strokeWidth={1.2} className="text-accent" aria-hidden="true" />
            <p className="font-display text-2xl leading-snug text-fg">
              {data.attending === 'yes'
                ? `Thank you, ${data.name.split(' ')[0]}! We can’t wait to celebrate with you.`
                : `Thank you, ${data.name.split(' ')[0]}. You’ll be dearly missed — and always in our hearts.`}
            </p>
            {data.attending === 'yes' && (
              <p className="text-fg-soft">
                We’ve noted {data.guests} guest{data.guests > 1 ? 's' : ''} for {data.events.length} celebration{data.events.length > 1 ? 's' : ''}.
              </p>
            )}
            {delivered === false && (
              <p className="text-sm text-[#b0503f]">We couldn’t reach our server just now — your reply is saved on this device. Please also let us know on WhatsApp.</p>
            )}
            <div className="flex flex-wrap gap-3">
              {data.attending === 'yes' && <CalendarButton event={inv.events.filter((e) => e.calendarEnabled && data.events.includes(e.id))} label="Add to my calendar" variant="solid" />}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  <MessageCircle size={15} strokeWidth={1.5} aria-hidden="true" />
                  Confirm on WhatsApp
                </a>
              )}
              <button type="button" onClick={edit} className="btn btn-outline btn-sm">
                Edit response
              </button>
            </div>
            {import.meta.env.DEV && !inv.rsvp.endpoint && (
              <p className="text-xs text-fg-soft/80">Demo: replies are stored in this browser only. Set <code>rsvp.endpoint</code> in the invitation config to receive them.</p>
            )}
          </m.div>
        ) : (
          <m.form
            key="form"
            noValidate
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-col gap-6"
          >
            <Field label="Your name" required error={errors.name}>
              {(a) => (
                <input
                  {...a}
                  data-rsvp="name"
                  className="field"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="e.g. Kabir Malhotra"
                  value={data.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              )}
            </Field>

            <Field label="Phone or email" error={errors.contact} hint="So we can reach you with updates.">
              {(a) => (
                <input
                  {...a}
                  data-rsvp="contact"
                  className="field"
                  type="text"
                  name="contact"
                  autoComplete="email tel"
                  placeholder="+91 98765 43210"
                  value={data.contact}
                  onChange={(e) => set('contact', e.target.value)}
                />
              )}
            </Field>

            <fieldset className="flex flex-col gap-3" aria-describedby={errors.attending ? 'attending-err' : undefined}>
              <legend className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-fg-soft">
                Will you attend? <span className="text-accent" aria-hidden="true">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['yes', 'Joyfully accept'],
                    ['no', 'Regretfully decline'],
                  ] as const
                ).map(([val, label], i) => (
                  <label key={val} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="attending"
                      value={val}
                      checked={data.attending === val}
                      onChange={() => set('attending', val)}
                      data-rsvp={i === 0 ? 'attending' : undefined}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-14 items-center justify-center border border-line px-3 py-3 text-center text-sm tracking-wide text-fg transition peer-checked:border-accent peer-checked:bg-gold/20 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)] hover:border-accent" style={{ borderRadius: 'min(var(--r-card), 10px)' }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.attending && (
                <p id="attending-err" role="alert" className="text-sm text-[#c0504f]">
                  {errors.attending}
                </p>
              )}
            </fieldset>

            <AnimatePresence initial={false}>
              {data.attending === 'yes' && (
                <m.div
                  key="more"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-6 pb-1">
                    <Field label="Number of guests" required>
                      {(a) => (
                        <select {...a} className="field" name="guests" value={data.guests} onChange={(e) => set('guests', Number(e.target.value))}>
                          {Array.from({ length: inv.rsvp.maxGuests }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? 'guest (just me)' : 'guests'}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>

                    <fieldset className="flex flex-col gap-3">
                      <legend className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-fg-soft">Celebrations you’ll attend</legend>
                      <div className="flex flex-wrap gap-2">
                        {inv.events.map((ev, i) => (
                          <label key={ev.id} className="relative cursor-pointer">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={data.events.includes(ev.id)}
                              data-rsvp={i === 0 ? 'events' : undefined}
                              onChange={(e) =>
                                set('events', e.target.checked ? [...data.events, ev.id] : data.events.filter((x) => x !== ev.id))
                              }
                            />
                            <span className={cn('block border border-line px-4 py-2 text-sm tracking-wide text-fg transition hover:border-accent peer-checked:border-accent peer-checked:bg-gold/20 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)]')} style={{ borderRadius: 'var(--r-btn)' }}>
                              {ev.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors.events && (
                        <p role="alert" className="text-sm text-[#c0504f]">
                          {errors.events}
                        </p>
                      )}
                    </fieldset>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            <Field label="Dietary needs or a note for us">
              {(a) => (
                <textarea
                  {...a}
                  className="field min-h-24 resize-y"
                  name="notes"
                  rows={3}
                  maxLength={400}
                  placeholder="Vegetarian, Jain, allergies, travelling from afar…"
                  value={data.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              )}
            </Field>

            <button type="submit" className="btn btn-solid mt-1 self-start" disabled={status === 'sending'}>
              {status === 'sending' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={15} strokeWidth={1.6} aria-hidden="true" />}
              {status === 'sending' ? 'Sending…' : 'Send RSVP'}
            </button>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
