import type { WeddingEvent } from '../types';

export const pad = (n: number) => String(n).padStart(2, '0');

/** Build an absolute instant from a venue-local date + time + UTC offset. */
export function toInstant(date: string, time: string, offset: string): Date {
  return new Date(`${date}T${time}:00${offset}`);
}

/** Start/end of an event. An end time earlier than the start rolls to the next day. */
export function eventRange(ev: WeddingEvent, offset: string): { start: Date; end: Date } {
  const start = toInstant(ev.date, ev.startTime, offset);
  let end = toInstant(ev.date, ev.endTime, offset);
  if (end.getTime() <= start.getTime()) end = new Date(end.getTime() + 24 * 3600 * 1000);
  return { start, end };
}

export function fmt(
  d: Date | string,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions,
  locale = 'en-IN',
): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(date);
}

/** "25 November 2026" */
export const longDate = (d: Date | string, tz: string) =>
  fmt(d, tz, { day: 'numeric', month: 'long', year: 'numeric' }, 'en-GB');

/** "Wednesday" */
export const weekday = (d: Date | string, tz: string) => fmt(d, tz, { weekday: 'long' }, 'en-GB');

export const monthShort = (d: Date | string, tz: string) =>
  fmt(d, tz, { month: 'short' }, 'en-GB').toUpperCase();

export const dayNum = (d: Date | string, tz: string) => fmt(d, tz, { day: '2-digit' }, 'en-GB');

/** "4:00 PM" */
export const timeLabel = (d: Date, tz: string) =>
  fmt(d, tz, { hour: 'numeric', minute: '2-digit', hour12: true }, 'en-US');

/** "4:00 PM – 8:00 PM" */
export function timeRange(ev: WeddingEvent, tz: string, offset: string): string {
  const { start, end } = eventRange(ev, offset);
  return `${timeLabel(start, tz)} – ${timeLabel(end, tz)}`;
}
