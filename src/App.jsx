import React from 'react';
import { HabitProvider } from './context/HabitContext';
import { FEATURES } from './config/features';
import { ThreeCanvas } from './three/ThreeCanvas';
import { CosmicHeader } from './components/Navigation/CosmicHeader';
import { CameraHUD } from './components/Navigation/CameraHUD';
import { HabitQuickHUD } from './components/Dashboard/HabitQuickHUD';
import { PlanetDetailDrawer } from './components/Dashboard/PlanetDetailDrawer';
import { HabitModal } from './components/Dashboard/HabitModal';
import { CosmicAnalyticsModal } from './components/Analytics/CosmicAnalyticsModal';
import { CosmicCoachModal } from './components/AI/CosmicCoachModal';
import { SpaceFeedModal } from './components/Feed/SpaceFeedModal';

function OrbitBoardApp() {
  return (
    <div className="orbit-app-shell">

      <ThreeCanvas />

      <CosmicHeader />

      <CameraHUD />

      <HabitQuickHUD />

      <PlanetDetailDrawer />

      <HabitModal />
      <CosmicAnalyticsModal />

      {FEATURES.aiCoach && <CosmicCoachModal />}
      {FEATURES.spaceFeed && <SpaceFeedModal />}
    </div>
  );
}

export default function App() {
  return (
    <HabitProvider>
      <OrbitBoardApp />
    </HabitProvider>
  );
}
