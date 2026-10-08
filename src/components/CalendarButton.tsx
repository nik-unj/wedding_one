import { CalendarPlus, ChevronDown, Download } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useCallback, useId, useRef, useState } from 'react';
import { useInvitation } from '../context/InvitationContext';
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl } from '../lib/calendar';
import { cn } from '../lib/cn';
import { useClickOutside, useEscape } from '../lib/hooks';
import type { WeddingEvent } from '../types';

interface Props {
  /** One event, or an array to export many into a single .ics */
  event: WeddingEvent | WeddingEvent[];
  label?: string;
  className?: string;
  variant?: 'outline' | 'solid';
}

const itemCls =
  'flex w-full items-center gap-3 px-4 py-3 text-left text-sm tracking-wide text-on-deep transition-colors hover:bg-gold/15 focus-visible:bg-gold/15 focus-visible:outline-none';

const LinkItem = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <a role="menuitem" className={itemCls} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
    {children}
  </a>
);

const ButtonItem = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button role="menuitem" type="button" className={itemCls} onClick={onClick}>
    {children}
  </button>
);

/** Add to Calendar: Google · Apple/iCal (.ics) · Outlook. Multiple events ⇒ a single .ics. */
export function CalendarButton({ event, label = 'Add to Calendar', className, variant = 'outline' }: Props) {
  const { inv } = useInvitation();
  const events = Array.isArray(event) ? event : [event];
  const single = events.length === 1 ? events[0] : null;

  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);
  useEscape(() => {
    close();
    btn.current?.focus();
  }, open);

  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      setUp(window.innerHeight - r.bottom < 230 && r.top > 230);
    }
    setOpen((o) => !o);
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    }
  };

  const filename = single ? `${single.id}-${inv.slug}` : `${inv.slug}-celebrations`;

  return (
    <div ref={wrap} className={cn('relative inline-block', className)}>
      <button
        ref={btn}
        type="button"
        className={cn('btn btn-sm', variant === 'solid' ? 'btn-solid' : 'btn-outline')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
      >
        <CalendarPlus size={15} strokeWidth={1.5} aria-hidden="true" />
        {label}
        <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" className={cn('transition-transform duration-300', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            role="menu"
            aria-label="Add to calendar"
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, y: up ? 8 : -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn('glass !bg-deep-2 absolute left-0 z-40 w-64 overflow-hidden py-1 shadow-2xl', up ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top')}
            style={{ borderRadius: 'min(var(--r-card), 10px)' }}
          >
            {single ? (
              <>
                <LinkItem href={googleCalendarUrl(inv, single)} onClick={close}>
                  <span className="grid h-6 w-6 place-items-center rounded-sm bg-white/90 font-sans text-[0.7rem] font-semibold text-[#4285F4]">G</span>
                  Google Calendar
                </LinkItem>
                <ButtonItem
                  onClick={() => {
                    downloadIcs(inv, events, filename);
                    close();
                  }}
                >
                  <Download size={18} strokeWidth={1.4} className="text-gold-light" aria-hidden="true" />
                  Apple / iCal (.ics)
                </ButtonItem>
                <LinkItem href={outlookCalendarUrl(inv, single)} onClick={close}>
                  <span className="grid h-6 w-6 place-items-center rounded-sm bg-[#0F6CBD] font-sans text-[0.7rem] font-semibold text-white">O</span>
                  Outlook
                </LinkItem>
              </>
            ) : (
              <ButtonItem
                onClick={() => {
                  downloadIcs(inv, events, filename);
                  close();
                }}
              >
                <Download size={18} strokeWidth={1.4} className="text-gold-light" aria-hidden="true" />
                Download all ({events.length}) — .ics
              </ButtonItem>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
