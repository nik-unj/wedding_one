import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Check, Link2, MessageCircle, Share2 } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { canNativeShare, copyText, inviteUrl, nativeShare, whatsappShareUrl } from '../lib/share';
import { useClickOutside, useEscape } from '../lib/hooks';

const item =
  'flex w-full items-center gap-3 px-4 py-3 text-left text-sm tracking-wide text-on-deep transition-colors hover:bg-gold/15 focus-visible:bg-gold/15 focus-visible:outline-none';

export function ShareButton() {
  const { inv, opened } = useInvitation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrap, close, open);
  useEscape(() => {
    close();
    btn.current?.focus();
  }, open);

  const copy = async () => {
    const ok = await copyText(inviteUrl());
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <div ref={wrap} className="relative" style={{ pointerEvents: opened ? 'auto' : 'none' }}>
      <m.button
        ref={btn}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share this invitation"
        className="glass grid h-12 w-12 place-items-center rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-colors hover:border-gold-light"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={opened ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Share2 size={18} strokeWidth={1.4} aria-hidden="true" />
      </m.button>

      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            aria-label="Share"
            initial={{ opacity: 0, x: 10, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28 }}
            className="glass absolute bottom-0 right-14 z-50 w-60 origin-bottom-right overflow-hidden py-1 shadow-2xl"
            style={{ borderRadius: 'min(var(--r-card), 10px)' }}
          >
            <a role="menuitem" className={item} href={whatsappShareUrl(inv)} target="_blank" rel="noopener noreferrer" onClick={close}>
              <MessageCircle size={18} strokeWidth={1.4} className="text-[#6fd48b]" aria-hidden="true" />
              Share on WhatsApp
            </a>
            <button role="menuitem" type="button" className={item} onClick={copy}>
              {copied ? <Check size={18} strokeWidth={1.6} className="text-gold-light" aria-hidden="true" /> : <Link2 size={18} strokeWidth={1.4} className="text-gold-light" aria-hidden="true" />}
              {copied ? 'Link copied' : 'Copy invitation link'}
            </button>
            {canNativeShare() && (
              <button
                role="menuitem"
                type="button"
                className={item}
                onClick={async () => {
                  if (await nativeShare(inv)) close();
                }}
              >
                <Share2 size={18} strokeWidth={1.4} className="text-gold-light" aria-hidden="true" />
                More options…
              </button>
            )}
            <p className="sr-only" role="status" aria-live="polite">
              {copied ? 'Invitation link copied to clipboard' : ''}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
