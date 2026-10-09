import type { ImageAsset, Invitation } from '../types';

/**
 * Helper for local image assets. Every asset has a full-size file and a 640px
 * variant (`-sm`) so the browser can pick an appropriate size via srcset.
 */
const img = (
  name: string,
  width: number,
  height: number,
  alt: string,
  opts: { sm?: boolean } = {},
): ImageAsset => ({
  src: `/images/${name}.jpg`,
  srcSm: opts.sm === false ? undefined : `/images/${name}-sm.jpg`,
  alt,
  width,
  height,
});

const mapsSearch = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE INVITATION
 *  Everything a guest sees comes from this object. To create a new invitation,
 *  duplicate this file (or fetch the same shape from an API / CMS) and the
 *  engine renders it in any theme.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const invitation: Invitation = {
  slug: 'kavita-yash',
  couple: {
    displayName: 'Kavita & Yash',
    monogram: 'K & Y',
    hashtag: '#KavitaWedsYash',
  },

  bride: {
    name: 'Kavita',
    fullName: 'Kavita Mehta',
    role: 'The Bride',
    relation: 'D/o.',
    mother: 'Mrs. Meera Mehta',
    father: 'Mr. Rajesh Mehta',
    city: 'Jaipur, Rajasthan',
    tagline: 'A dreamer with a pen, a passion for old films, and a laugh you can hear from the next room.',
    photo: img('bride', 864, 1152, 'Portrait of Kavita in a red and gold bridal lehenga'),
  },
  groom: {
    name: 'Yash',
    fullName: 'Yash Singh Rathore',
    role: 'The Groom',
    relation: 'S/o.',
    mother: 'Mrs. Sunita Rathore',
    father: 'Mr. Vikram Singh Rathore',
    city: 'Mumbai, Maharashtra',
    tagline: 'Quietly funny, endlessly patient, and the kind of person who remembers every small thing.',
    photo: img('groom', 864, 1152, 'Portrait of Yash in an ivory and gold sherwani'),
  },

  families: {
    bride: {
      title: "Bride's Family",
      surname: 'The Mehta Family',
      father: 'Mr. Rajesh Mehta',
      mother: 'Mrs. Meera Mehta',
      photo: img('family-bride', 1152, 864, "The bride's family seated together in a warm drawing room"),
      members: [
        { name: 'Shri Harishchandra Mehta', relation: 'Grandfather' },
        { name: 'Smt. Kamla Devi Mehta', relation: 'Grandmother' },
        { name: 'Aarav Mehta', relation: 'Brother' },
        { name: 'Ishita Mehta', relation: 'Sister-in-law' },
      ],
    },
    groom: {
      title: "Groom's Family",
      surname: 'The Rathore Family',
      father: 'Mr. Vikram Singh Rathore',
      mother: 'Mrs. Sunita Rathore',
      photo: img('family-groom', 1152, 864, "The groom's family dressed in maroon and gold in a heritage courtyard"),
      members: [
        { name: 'Shri Bhawani Singh Rathore', relation: 'Grandfather' },
        { name: 'Smt. Gulab Kanwar Rathore', relation: 'Grandmother' },
        { name: 'Riya Rathore', relation: 'Sister' },
        { name: 'Kunwar Devendra Singh', relation: 'Uncle' },
      ],
    },
  },

  weddingDate: '2026-11-25T17:30:00+05:30',
  countdownDate: '2026-11-25T17:30:00+05:30',
  timeZone: 'Asia/Kolkata',
  utcOffset: '+05:30',

  hero: {
    blessing: 'श्री गणेशाय नमः',
    blessingEn: 'With the blessings of Lord Ganesha',
    imageWide: img('hero-wide', 1280, 720, 'Kavita and Yash walking hand in hand through a palace courtyard at golden hour'),
    imageTall: img('hero-tall', 720, 1280, 'Kavita and Yash standing under a sandstone archway at sunset', { sm: false }),
    city: 'Udaipur, Rajasthan',
    ogImage: '/images/og-image.jpg',
  },

  story: {
    heading: 'How It All Began',
    subheading: 'Every love story has a beginning…',
    chapters: [
      {
        id: 'meeting',
        title: 'The Meeting',
        kicker: 'July, 2021 · Jaipur',
        text: 'A rainy afternoon in a tiny café in Jaipur. Kavita had stepped in to escape the downpour; Yash to finish a deadline. One shared table, two cups of masala chai, and a conversation that forgot how to end.',
        image: img('story-1', 1152, 864, 'Kavita and Yash laughing over cups of chai in a sunlit café'),
      },
      {
        id: 'knowing',
        title: 'The Knowing',
        kicker: 'Winter, 2022 · Mumbai',
        text: 'Late-night calls became rooftop evenings. The city lights turned into our own private constellation, and somewhere between the laughter and the comfortable silences, we both simply knew.',
        image: img('story-2', 1152, 864, 'The couple sitting close on a rooftop above the glowing city at night'),
      },
      {
        id: 'promise',
        title: 'The Promise',
        kicker: 'December, 2025 · Jaipur',
        text: 'Her hands still stained with her cousin’s mehendi, he asked the only question that mattered. She said yes before he could finish — and our families have been celebrating ever since.',
        image: img('story-3', 1152, 864, 'A ring being slipped onto a henna-decorated hand among rose petals'),
      },
      {
        id: 'forever',
        title: 'Forever Begins',
        kicker: 'November, 2026 · Udaipur',
        text: 'With the blessings of our families, we are ready for the greatest chapter of all — and it would mean the world to have you beside us as we take our seven steps together.',
        image: img('story-4', 1152, 864, 'The couple standing before a flower-covered mandap lit by crystal chandeliers'),
      },
    ],
  },

  events: [
    {
      id: 'mehendi',
      name: 'Mehendi',
      date: '2026-11-23',
      startTime: '16:00',
      endTime: '20:00',
      description:
        'An afternoon of henna, folk songs and long conversations over chaat and chai, as intricate designs bloom on every hand.',
      venue: 'Rangmahal Haveli Gardens',
      address: '12, Lake Pichola Road, Udaipur, Rajasthan 313001',
      city: 'Udaipur',
      mapsUrl: mapsSearch('Lake Pichola, Udaipur, Rajasthan'),
      mapsQuery: 'Lake Pichola, Udaipur, Rajasthan',
      dressCode: 'Colourful & festive — pastels, greens and marigold hues',
      dressPalette: ['#9DB88A', '#E7A9B3', '#F2C46B', '#F6E7CF'],
      image: img('event-mehendi', 1152, 864, 'Hands decorated with intricate mehendi holding a bowl of rose petals'),
      calendarEnabled: true,
    },
    {
      id: 'haldi',
      name: 'Haldi',
      date: '2026-11-24',
      startTime: '10:30',
      endTime: '13:30',
      description:
        'A morning bathed in gold. Turmeric, marigold petals and blessings from the elders — come ready to be adorned (and a little messy).',
      venue: 'Rangmahal Haveli Gardens',
      address: '12, Lake Pichola Road, Udaipur, Rajasthan 313001',
      city: 'Udaipur',
      mapsUrl: mapsSearch('Lake Pichola, Udaipur, Rajasthan'),
      mapsQuery: 'Lake Pichola, Udaipur, Rajasthan',
      dressCode: 'Yellow, white or ivory — something you don’t mind staining',
      dressPalette: ['#F2C230', '#F7E08A', '#FFFFFF', '#F6EBD0'],
      image: img('event-haldi', 1152, 864, 'Family members applying turmeric during the haldi ceremony as petals fall'),
      calendarEnabled: true,
    },
    {
      id: 'sangeet',
      name: 'Sangeet',
      date: '2026-11-24',
      startTime: '19:30',
      endTime: '00:30',
      description:
        'A night of music, dance and rehearsed-but-mostly-improvised performances by both families, followed by a gala dinner under the stars.',
      venue: 'Amrit Bagh Lawns',
      address: 'Fateh Sagar Road, Udaipur, Rajasthan 313004',
      city: 'Udaipur',
      mapsUrl: mapsSearch('Fateh Sagar Lake, Udaipur, Rajasthan'),
      mapsQuery: 'Fateh Sagar Lake, Udaipur, Rajasthan',
      dressCode: 'Glamorous Indo-western — jewel tones, sequins and shimmer',
      dressPalette: ['#8E1F4A', '#C79A2B', '#1F5F5B', '#2B2342'],
      image: img('event-sangeet', 1152, 864, 'Guests dancing under magenta stage lights as golden confetti falls'),
      calendarEnabled: true,
    },
    {
      id: 'wedding',
      name: 'The Wedding',
      date: '2026-11-25',
      startTime: '17:30',
      endTime: '23:30',
      description:
        'The baraat arrives at 5:30 PM, followed by the varmala, pheras and the sacred vows beside the holy fire. Dinner will be served after the ceremony.',
      venue: 'Chandra Vilas Palace',
      address: 'City Palace Complex, Udaipur, Rajasthan 313001',
      city: 'Udaipur',
      mapsUrl: mapsSearch('City Palace, Udaipur, Rajasthan'),
      mapsQuery: 'City Palace, Udaipur, Rajasthan',
      dressCode: 'Traditional Indian — rich silks, gold and deep jewel tones',
      dressPalette: ['#6E1A2B', '#B8893B', '#0F5C4A', '#F4EAD3'],
      image: img('event-wedding', 1152, 864, 'The sacred wedding fire with marigold garlands and brass kalash'),
      calendarEnabled: true,
    },
    {
      id: 'reception',
      name: 'Reception',
      date: '2026-11-26',
      startTime: '19:30',
      endTime: '23:00',
      description:
        'An evening of candlelight, fine dining and heartfelt toasts as we celebrate the newlyweds in the palace ballroom.',
      venue: 'Chandra Vilas Palace',
      address: 'City Palace Complex, Udaipur, Rajasthan 313001',
      city: 'Udaipur',
      mapsUrl: mapsSearch('City Palace, Udaipur, Rajasthan'),
      mapsQuery: 'City Palace, Udaipur, Rajasthan',
      dressCode: 'Black tie / evening formals — champagne, ivory & gold',
      dressPalette: ['#1C1A18', '#E8D5A8', '#F8F3E7', '#B79A63'],
      image: img('event-reception', 1152, 864, 'A candlelit palace ballroom with crystal chandeliers and white floral centrepieces'),
      calendarEnabled: true,
    },
  ],

  gallery: [
    { id: 'g-palace', ...img('gallery-3', 1280, 720, 'A palace glowing at dusk, reflected in a pool dotted with diyas and petals'), caption: 'Where it all begins' },
    { id: 'g-forehead', ...img('gallery-2', 864, 1152, 'The couple, foreheads touching, in a garden of white flowers at golden hour'), caption: 'Quiet, golden moments' },
    { id: 'g-jewels', ...img('gallery-1', 864, 1152, 'Bridal jewellery and a red dupatta laid on ivory silk with rose petals'), caption: 'Heirlooms & new beginnings' },
    { id: 'g-chadar', ...img('gallery-7', 1152, 864, 'The bride walking beneath a canopy of flowers held by her sisters'), caption: 'Phoolon ki chadar' },
    { id: 'g-hands', ...img('gallery-8', 1024, 1024, 'Joined hands with bangles, a ring and henna against golden bokeh'), caption: 'Hand in hand' },
    { id: 'g-baraat', ...img('gallery-6', 864, 1152, 'The groom on a decorated white horse as fireworks light the dusk sky'), caption: 'The baraat' },
    { id: 'g-father', ...img('gallery-5', 1152, 864, 'A father kissing his daughter’s forehead before the wedding'), caption: 'A father’s blessing' },
    { id: 'g-card', ...img('gallery-4', 1024, 1024, 'An embossed ivory invitation card with a gold wax seal and a ring on silk ribbon'), caption: 'Save the date' },
    { id: 'g-mandap', ...img('story-4', 1152, 864, 'The couple before a flower mandap lit by chandeliers'), caption: 'Under the mandap' },
  ],

  venue: {
    name: 'Chandra Vilas Palace',
    address: 'City Palace Complex, Udaipur, Rajasthan 313001',
    city: 'Udaipur, Rajasthan',
    mapsUrl: mapsSearch('City Palace, Udaipur, Rajasthan'),
    mapsQuery: 'City Palace, Udaipur, Rajasthan',
    notes: [
      { icon: 'plane', title: 'By air', text: 'Maharana Pratap Airport (UDR) is about 45 minutes from the palace. Complimentary pickups will be arranged.' },
      { icon: 'train', title: 'By rail', text: 'Udaipur City Station is about 15 minutes away. Our hosts will meet you at the station.' },
      { icon: 'bed', title: 'Stay', text: 'A block of rooms is reserved at the palace hotels. Please share your arrival details with us.' },
      { icon: 'car', title: 'Parking', text: 'Valet parking is available at every venue. Shuttles will run between venues on all days.' },
    ],
  },

  music: {
    // Leave `src` empty to use the built-in generative ambient score. To use your own track,
    // drop an MP3 in /public/audio and set e.g. src: '/audio/invitation.mp3'.
    src: undefined,
    title: 'Ambient raga',
    volume: 0.6,
  },

  rsvp: {
    enabled: true,
    deadline: '2026-11-01',
    endpoint: undefined,
    whatsapp: undefined,
    maxGuests: 6,
  },

  wishes: [
    {
      id: 'seed-1',
      name: 'Nani & Nana',
      message: 'May your home always be filled with chai, laughter and the kind of love that grows quietly every day. Our blessings are always with you both.',
      createdAt: 1,
    },
    {
      id: 'seed-2',
      name: 'Aarav',
      message: 'Didi, I have never seen you smile the way you do when Yash calls. Can’t wait to dance my heart out at your sangeet!',
      createdAt: 2,
    },
    {
      id: 'seed-3',
      name: 'Riya Rathore',
      message: 'Welcome to the family, Kavita — we’ve been waiting for you for years. Bhai, you chose very, very well.',
      createdAt: 3,
    },
    {
      id: 'seed-4',
      name: 'Kabir & Naina',
      message: 'From a rainy café to the grandest of palaces — we were there for chapter one and are so honoured to witness the next.',
      createdAt: 4,
    },
  ],

  theme: 'royal',

  socialLinks: [
    { kind: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
    { kind: 'email', label: 'Email', href: 'mailto:hello@example.com' },
  ],

  demo: { themeSwitcher: true },
};
