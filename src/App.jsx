import React from 'react';
import { HabitProvider } from './context/HabitContext';
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D Photorealistic Three.js Solar System Canvas */}
      <ThreeCanvas />

      {/* Top Cosmic Header & Metrics */}
      <CosmicHeader />

      {/* Left Perspective Camera Dock */}
      <CameraHUD />

      {/* Bottom Floating Quick Habit Dock */}
      <HabitQuickHUD />

      {/* Right Planet Inspection Drawer */}
      <PlanetDetailDrawer />

      {/* Modals */}
      <HabitModal />
      <CosmicAnalyticsModal />
      <CosmicCoachModal />
      <SpaceFeedModal />
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
