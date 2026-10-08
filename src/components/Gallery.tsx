import { memo, useCallback, useState } from 'react';
import { Expand } from 'lucide-react';
import { useInvitation } from '../context/InvitationContext';
import type { Invitation } from '../types';
import { Container, Section, SectionHeading } from './ui/Section';
import { RevealImage } from './ui/Reveal';
import { Lightbox } from './Lightbox';
import { cn } from '../lib/cn';

type Photo = Invitation['gallery'][number];

const Tile = memo(function Tile({
  photo,
  index,
  onOpen,
  featured,
}: {
  photo: Photo;
  index: number;
  onOpen: (i: number) => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      aria-label={`Open photo: ${photo.caption ?? photo.alt}`}
      className={cn('group relative block w-full overflow-hidden text-left', featured && 'aspect-[16/10] sm:aspect-[21/9]')}
      style={{ borderRadius: 'var(--r-card)' }}
    >
      <RevealImage
        asset={photo}
        sizes={featured ? '(min-width: 1280px) 80rem, 100vw' : '(min-width: 1024px) 26rem, 50vw'}
        className={featured ? 'h-full w-full' : 'w-full'}
        imgClassName="transition-transform duration-[1800ms] ease-out group-hover:scale-[1.05]"
        delay={(index % 3) * 0.12}
        from={index % 2 ? 'bottom' : 'center'}
      />
      <span
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-deep-2/70 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-end justify-between gap-3 p-4 text-on-deep opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span className="font-display text-lg italic">{photo.caption}</span>
        <Expand size={16} strokeWidth={1.4} aria-hidden="true" className="shrink-0 text-gold-light" />
      </span>
    </button>
  );
});

export function Gallery() {
  const { inv } = useInvitation();
  const [open, setOpen] = useState<number | null>(null);
  const onOpen = useCallback((i: number) => setOpen(i), []);
  const close = useCallback(() => setOpen(null), []);
  const [feature, ...rest] = inv.gallery;

  return (
    <Section id="gallery" tone="light" labelledBy="gallery-title">
      <Container className="max-w-7xl">
        <SectionHeading id="gallery-title" eyebrow="Moments" title="A Glimpse of Us" subtitle="A few frames from the days we’ve loved so far — and many more still to come." />

        {feature && (
          <div className="mb-3 sm:mb-5">
            <Tile photo={feature} index={0} onOpen={onOpen} featured />
          </div>
        )}

        {/* editorial masonry */}
        <div className="columns-2 gap-3 sm:gap-5 lg:columns-3">
          {rest.map((g, k) => (
            <div key={g.id} className={cn('mb-3 break-inside-avoid sm:mb-5', k % 4 === 1 && 'lg:mt-10')}>
              <Tile photo={g} index={k + 1} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </Container>

      <Lightbox items={inv.gallery} index={open} onClose={close} onIndex={setOpen} />
    </Section>
  );
}
