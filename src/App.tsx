import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { Countdown } from './components/Countdown';
import { CoupleSection } from './components/CoupleSection';
import { EventTimeline } from './components/EventTimeline';
import { FamilySection } from './components/FamilySection';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { HeroSection } from './components/HeroSection';
import { MusicPlayer } from './components/MusicPlayer';
import { Navigation } from './components/Navigation';
import { OpeningExperience } from './components/OpeningExperience';
import { ScratchReveal } from './components/ScratchReveal';
import { ShareButton } from './components/ShareButton';
import { StoryTimeline } from './components/StoryTimeline';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { VenueSection } from './components/VenueSection';
import { WishesSection } from './components/WishesSection';
import { InvitationProvider, useInvitation } from './context/InvitationContext';
import { invitation } from './data/invitation';

function Experience() {
  const { opened } = useInvitation();
  return (
    <div className="tone-light">
      <OpeningExperience />
      <Navigation />

      {/* `inert` keeps keyboard/AT focus on the cover until the invitation is opened */}
      <main id="main" inert={!opened}>
        <HeroSection />
        <Countdown />
        <ScratchReveal />
        <StoryTimeline />
        <CoupleSection />
        <EventTimeline />
        <Gallery />
        <FamilySection />
        <VenueSection />
        <WishesSection />
      </main>
      <Footer />

      {/* floating controls */}
      <div className="tone-dark pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto">
          <ShareButton />
        </div>
        <div className="pointer-events-auto">
          <MusicPlayer />
        </div>
      </div>
      {/* sits above the cover so the demo themes can be previewed before opening */}
      <div className="tone-dark pointer-events-none fixed bottom-0 left-0 z-[105] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    // reducedMotion="user": transform/layout animations are skipped for guests who ask for less motion
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <InvitationProvider inv={invitation}>
          <Experience />
        </InvitationProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
