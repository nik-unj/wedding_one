import { useState } from 'react';
import { useInvitation } from '../../context/InvitationContext';
import { cn } from '../../lib/cn';

interface Props {
  className?: string;
  position?: string;
  priority?: boolean;
}

/** Art-directed background: portrait crop on phones, wide crop on tablets and up. */
export function HeroPicture({ className, position = 'center 35%', priority }: Props) {
  const { inv } = useInvitation();
  const { imageTall, imageWide } = inv.hero;
  const [loaded, setLoaded] = useState(false);

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={imageWide.src} width={imageWide.width} height={imageWide.height} />
      <img
        src={imageTall.src}
        width={imageTall.width}
        height={imageTall.height}
        alt=""
        aria-hidden="true"
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        onLoad={() => setLoaded(true)}
        ref={(el) => {
          if (el?.complete && el.naturalWidth > 0) setLoaded(true);
        }}
        className={cn('h-full w-full object-cover transition-opacity duration-[1600ms]', loaded ? 'opacity-100' : 'opacity-0', className)}
        style={{ objectPosition: position }}
      />
    </picture>
  );
}
