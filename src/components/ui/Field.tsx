import { useId, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: (a11y: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; 'aria-required'?: boolean }) => ReactNode;
}

/** Label + control + error wiring so every field is announced properly. */
export function Field({ label, required, error, hint, className, children }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-fg-soft">
        {label}
        {required ? (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 normal-case tracking-normal text-fg-soft/70">(optional)</span>
        )}
      </label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy, 'aria-required': required })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-sm text-[#c0504f]">
          {error}
        </p>
      )}
    </div>
  );
}
