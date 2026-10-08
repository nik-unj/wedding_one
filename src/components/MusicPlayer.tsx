import { m } from 'motion/react';
import { Music2 } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';

function Equalizer() {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 0.35, 0.15, 0.5].map((d, i) => (
        <span
          key={i}
          className="h-full w-[2px] origin-bottom rounded-full bg-gold-light"
          style={{ animation: `eq ${0.9 + i * 0.17}s ease-in-out ${d}s infinite` }}
        />
      ))}
    </span>
  );
}

/** A quiet floating control — not a media player. */
export function MusicPlayer() {
  const { music, opened, inv } = useInvitation();
  const { playing, toggle } = music;

  return (
    <m.button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Mute background music' : 'Play background music'}
      title={playing ? `Music on — ${inv.music.title}` : 'Music off'}
      className="glass relative grid h-12 w-12 place-items-center rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] transition-colors hover:border-gold-light"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={opened ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: opened ? 'auto' : 'none' }}
    >
      {playing ? (
        <Equalizer />
      ) : (
        <span className="relative text-on-deep-soft">
          <Music2 size={19} strokeWidth={1.4} aria-hidden="true" />
          <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gold-light" aria-hidden="true" />
        </span>
      )}
    </m.button>
  );
}
