import { useInvitation } from '../context/InvitationContext';
import type { Family, FamilyMember } from '../types';
import { Container, Section, SectionHeading } from './ui/Section';
import { Reveal, RevealImage } from './ui/Reveal';
import { Img } from './ui/Img';
import { Particles } from './ui/Particles';

const initials = (name: string) =>
  name
    .replace(/^(Shri|Smt\.?|Mr\.?|Mrs\.?|Kunwar|Dr\.?)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

function Member({ member }: { member: FamilyMember }) {
  return (
    <li className="flex items-center gap-4">
      {member.photo ? (
        <Img asset={member.photo} sizes="64px" className="h-14 w-14 rounded-full border border-line object-cover" />
      ) : (
        <span
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line bg-card font-display text-lg tracking-wider text-accent"
          aria-hidden="true"
        >
          {initials(member.name)}
        </span>
      )}
      <span>
        <span className="block font-display text-lg leading-tight text-fg">{member.name}</span>
        <span className="block text-[0.7rem] uppercase tracking-[0.24em] text-fg-soft">{member.relation}</span>
      </span>
    </li>
  );
}

function FamilyBlock({ family, side }: { family: Family; side: 'bride' | 'groom' }) {
  return (
    <article aria-label={family.title} className="flex flex-col">
      {family.photo && (
        <div className="relative border border-line bg-card p-2 sm:p-3" style={{ borderRadius: 'var(--r-card)' }}>
          <RevealImage
            asset={family.photo}
            sizes="(min-width: 1024px) 34rem, 90vw"
            className="aspect-[4/3] w-full"
            from={side === 'bride' ? 'left' : 'right'}
          />
        </div>
      )}

      <Reveal delay={0.15} className="mt-9 text-center sm:text-left">
        <p className="eyebrow">{family.title}</p>
        <h3 className="mt-3 font-display text-[clamp(2rem,6vw,2.9rem)] font-light leading-tight text-fg">{family.surname}</h3>

        <dl className="mt-7 grid grid-cols-2 gap-6 border-y border-line py-7 text-left">
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.3em] text-fg-soft">Father</dt>
            <dd className="mt-1 font-display text-xl text-fg">{family.father}</dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.3em] text-fg-soft">Mother</dt>
            <dd className="mt-1 font-display text-xl text-fg">{family.mother}</dd>
          </div>
        </dl>

        <ul className="mt-7 grid gap-5 text-left sm:grid-cols-2">
          {family.members.map((m) => (
            <Member key={m.name} member={m} />
          ))}
        </ul>
      </Reveal>
    </article>
  );
}

export function FamilySection() {
  const { inv } = useInvitation();
  return (
    <Section id="families" tone="dark" pattern labelledBy="families-title" className="grain">
      <Particles count={26} className="-z-10 opacity-60" />
      <Container>
        <SectionHeading
          id="families-title"
          eyebrow="Our families"
          title="With the Blessings of Our Families"
          subtitle="The people who raised us, taught us and carried us to this day."
        />
        <div className="grid gap-20 lg:grid-cols-2 lg:gap-16">
          <FamilyBlock family={inv.families.bride} side="bride" />
          <FamilyBlock family={inv.families.groom} side="groom" />
        </div>
      </Container>
    </Section>
  );
}
