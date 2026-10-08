import { useCallback, useState, type CSSProperties } from 'react';
import type { ImageAsset } from '../../types';
import { cn } from '../../lib/cn';

interface Props {
  asset: ImageAsset;
  /** CSS `sizes` hint so the browser downloads the smallest adequate file */
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Override alt (use "" for purely decorative) */
  alt?: string;
}

/**
 * Responsive, lazy image with a soft fade-in and a graceful fallback, so a guest
 * never sees a broken-image icon.
 */
export function Img({ asset, sizes = '100vw', priority, className, style, alt }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // images served from cache can finish before React attaches onLoad
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt ?? asset.alt}
        className={cn('flex items-center justify-center bg-linear-to-br from-deep to-deep-2 text-gold-light', className)}
        style={style}
      >
        <span className="font-script text-4xl opacity-70">♥</span>
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={asset.src}
      srcSet={asset.srcSm ? `${asset.srcSm} 640w, ${asset.src} ${asset.width}w` : undefined}
      sizes={asset.srcSm ? sizes : undefined}
      alt={alt ?? asset.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn('transition-opacity duration-[1400ms] ease-out', loaded ? 'opacity-100' : 'opacity-0', className)}
      style={style}
    />
  );
}
