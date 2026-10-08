import type { Invitation, WeddingEvent } from '../types';
import { eventRange, pad } from './dates';

/** 20261125T120000Z */
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}${pad(d.getUTCSeconds())}Z`;

const location = (ev: WeddingEvent) => `${ev.venue}, ${ev.address}`;

const description = (inv: Invitation, ev: WeddingEvent) =>
  [
    `${ev.name} — ${inv.couple.displayName}`,
    '',
    ev.description,
    '',
    `Dress code: ${ev.dressCode}`,
    `Venue: ${location(ev)}`,
    `Map: ${ev.mapsUrl}`,
  ].join('\n');

const title = (inv: Invitation, ev: WeddingEvent) => `${ev.name} · ${inv.couple.displayName}`;

export function googleCalendarUrl(inv: Invitation, ev: WeddingEvent): string {
  const { start, end } = eventRange(ev, inv.utcOffset);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: title(inv, ev),
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    details: description(inv, ev),
    location: location(ev),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function outlookCalendarUrl(inv: Invitation, ev: WeddingEvent): string {
  const { start, end } = eventRange(ev, inv.utcOffset);
  const p = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title(inv, ev),
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description(inv, ev),
    location: location(ev),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

/* ───────────────────────────── ICS (Apple / iCal / Outlook desktop) ───────────────────────────── */

const escapeText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** RFC 5545 line folding at 75 octets (approximated by characters). */
function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return parts.join('\r\n');
}

function vevent(inv: Invitation, ev: WeddingEvent): string[] {
  const { start, end } = eventRange(ev, inv.utcOffset);
  return [
    'BEGIN:VEVENT',
    `UID:${ev.id}-${inv.slug}@invitation`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeText(title(inv, ev))}`,
    `DESCRIPTION:${escapeText(description(inv, ev))}`,
    `LOCATION:${escapeText(location(ev))}`,
    `URL:${ev.mapsUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(`Tomorrow: ${ev.name}`)}`,
    'END:VALARM',
    'END:VEVENT',
  ];
}

export function buildIcs(inv: Invitation, events: WeddingEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(inv.couple.displayName)} — Wedding`,
    ...events.flatMap((ev) => vevent(inv, ev)),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(inv: Invitation, events: WeddingEvent[], filename: string) {
  const blob = new Blob([buildIcs(inv, events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ───────────────────────────── Maps ───────────────────────────── */

const query = (v: { mapsQuery?: string; venue?: string; name?: string; address: string }) =>
  v.mapsQuery ?? `${v.venue ?? v.name ?? ''} ${v.address}`.trim();

export const mapsEmbedUrl = (v: Parameters<typeof query>[0]) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query(v))}&z=15&output=embed`;

export const mapsDirectionsUrl = (v: Parameters<typeof query>[0]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query(v))}`;
