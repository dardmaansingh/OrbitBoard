import React from 'react';
import { useHabits } from '../../context/HabitContext';
import { Eye, Grid, RotateCcw } from 'lucide-react';

export function CameraHUD() {
  const { cameraMode, setCameraMode, resetCameraToOverview } = useHabits();

  return (
    <nav className="camera-dock" aria-label="Camera controls">
      <button
        className={`camera-btn ${cameraMode === 'solar' || cameraMode === 'free' ? 'is-active' : ''}`}
        onClick={() => resetCameraToOverview()}
        title="3D Overview Perspective"
        aria-label="3D Overview"
      >
        <Eye size={15} />
      </button>

      <button
        className={`camera-btn ${cameraMode === 'tactical' ? 'is-active' : ''}`}
        onClick={() => setCameraMode('tactical')}
        title="Tactical Orbit Map (Top-Down)"
        aria-label="Tactical Top-Down View"
      >
        <Grid size={15} />
      </button>

      <button
        className="camera-btn"
        onClick={() => resetCameraToOverview()}
        title="Reset Camera Target"
        aria-label="Reset Camera"
      >
        <RotateCcw size={15} />
      </button>
    </nav>
  );
}
