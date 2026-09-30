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
      {/* 3D Solar System Canvas */}
      <ThreeCanvas />

      {/* Top Header & Telemetry Readout */}
      <CosmicHeader />

      {/* Camera Mode Dock */}
      <CameraHUD />

      {/* Bottom Today Habit Dock */}
      <HabitQuickHUD />

      {/* Planet Inspection Drawer */}
      <PlanetDetailDrawer />

      {/* Core Modals */}
      <HabitModal />
      <CosmicAnalyticsModal />

      {/* Optional Features behind flag */}
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
