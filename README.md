# Royal Invitation Engine

A cinematic, mobile-first Indian wedding invitation. React 19 · TypeScript · Tailwind v4 · Motion · Lucide.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## Make it yours — one file

Everything (names, dates, events, story, gallery, venues, families, RSVP, music, theme) lives in
[`src/data/invitation.ts`](src/data/invitation.ts). Replace the demo content; no component changes needed.

- **Events** are an unlimited array. Each one gets a card, a venue entry, and Add-to-Calendar
  (Google, Apple/ICS, Outlook) generated from its `date`, `startTime`, `endTime` and the
  invitation-level `timeZone` / `utcOffset`.
- **Images**: drop files in `public/images/` and reference them with the `img()` helper. A `-sm.jpg`
  sibling (about 640px wide) is used as the small `srcset` candidate.
- **Maps**: set `mapsQuery` (or `address`) per event or venue; embeds, "View on map" and "Directions" derive from it.

## Themes

Three themes: `royal` (ivory, antique gold, maroon), `ivory` (champagne and charcoal) and
`emerald` (emerald, champagne, cream). Set the default with `theme` in the data file. Guests can switch with the
palette button (set `demo.themeSwitcher: false` to hide it for a real invitation). Preview any theme with `?theme=ivory` or `?theme=emerald`. Theme tokens are CSS variables in
`src/index.css`.

## Personal links

`/?guest=Kabir%20%26%20Naina` greets that guest on the cover and pre-fills the guest-book name.

## RSVP & guest book

By default replies are stored in the visitor's browser only (demo mode). To receive them:

- set `rsvp.endpoint` to any URL that accepts a JSON `POST` (Google Apps Script, Formspree, your own API), and/or
- set `rsvp.whatsapp` (digits with country code) to offer a "confirm on WhatsApp" fallback.

## Music

Without a file, a soft generative raga-style score plays after the guest taps **Open Invitation**.
To use a real track, put an MP3 in `public/audio/` and set `music.src: '/audio/invitation.mp3'`.
Music pauses when the tab is hidden, and the floating button mutes or unmutes it.

## Sharing / Open Graph

Set `VITE_SITE_URL` in `.env` to the deployed URL before building. It is baked into the canonical,
`og:*` and `twitter:*` tags in `index.html`. Social crawlers don't run JavaScript, so every invitation
shares the same preview image (`public/images/og-image.jpg`). For a different preview per invitation, deploy
one build per couple.

## Accessibility & performance

- Semantic landmarks. Focus is managed in the lightbox and menus, and the main content is `inert` until the cover is opened.
- `prefers-reduced-motion` is respected, both in Motion (`reducedMotion="user"`) and in CSS.
- The scratch card has a visible "reveal instantly" button and a progress bar for non-pointer users.
- Images are lazy-loaded with `srcset`, the hero uses art-directed `<picture>`, and map iframes load only when scrolled into view.
