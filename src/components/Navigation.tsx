import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import { useBodyScrollLock, useEscape } from '../lib/hooks';
import { cn } from '../lib/cn';

const links = [
  { id: 'story', label: 'Our Story' },
  { id: 'events', label: 'Celebrations' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'venue', label: 'Venue' },
  { id: 'rsvp', label: 'RSVP' },
] as const;

export function Navigation() {
  const { inv, opened } = useInvitation();
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState<string>('');
  const lastY = useRef(0);
  const menuBtn = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(menu);
  useEscape(() => {
    setMenu(false);
    menuBtn.current?.focus();
  }, menu);

  // show on scroll-up once the hero has passed, hide on scroll-down
  useEffect(() => {
    if (!opened) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const pastHero = y > window.innerHeight * 0.7;
        const delta = y - lastY.current;
        if (!pastHero) setVisible(false);
        else if (delta < -6) setVisible(true);
        else if (delta > 6) setVisible(false);
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => {
      window.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, [opened]);

  // highlight the chapter in view
  useEffect(() => {
    const els = links.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const show = visible || menu;

  return (
    <>
      <m.header
        className="tone-dark glass fixed inset-x-0 top-0 z-[60] !border-x-0 !border-t-0 !bg-[color-mix(in_srgb,var(--deep-2)_92%,transparent)]"
        initial={false}
        animate={{ y: opened && show ? '0%' : '-110%' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!opened}
      >
        <nav aria-label="Invitation sections" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-10">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMenu(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="script text-3xl leading-none text-gold-light"
            aria-label={`${inv.couple.displayName} — back to top`}
          >
            {inv.couple.monogram}
          </a>

          <ul className="hidden items-center gap-9 md:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={go(l.id)}
                  aria-current={active === l.id ? 'true' : undefined}
                  className={cn(
                    'relative py-2 text-[0.7rem] uppercase tracking-[0.28em] text-on-deep-soft transition-colors hover:text-gold-light',
                    active === l.id && 'text-gold-light',
                  )}
                >
                  {l.label}
                  <span
                    className={cn('absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold-light transition-transform duration-500', active === l.id && 'scale-x-100')}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>

          <button
            ref={menuBtn}
            type="button"
            className="grid h-11 w-11 place-items-center text-on-deep md:hidden"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? 'Close menu' : 'Open menu'}
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={22} strokeWidth={1.4} /> : <Menu size={22} strokeWidth={1.4} />}
          </button>
        </nav>
      </m.header>

      <AnimatePresence>
        {menu && (
          <m.div
            id="mobile-menu"
            className="tone-darker fixed inset-0 z-[55] flex flex-col items-center justify-center bg-deep-2/97 px-8 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ul className="flex flex-col items-center gap-6 text-center">
              {links.map((l, i) => (
                <m.li
                  key={l.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a href={`#${l.id}`} onClick={go(l.id)} className="font-display text-4xl font-light text-on-deep transition-colors hover:text-gold-light">
                    {l.label}
                  </a>
                </m.li>
              ))}
            </ul>
            <p className="script mt-12 text-3xl text-gold-light">{inv.couple.monogram}</p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
