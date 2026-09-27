import React from 'react';
import { useHabits } from '../../context/HabitContext';
import { Compass, Eye, Grid, RotateCcw } from 'lucide-react';

export function CameraHUD() {
  const { cameraMode, setCameraMode, resetCameraToOverview } = useHabits();

  return (
    <div className="camera-controls-dock">
      {/* Overview Perspective */}
      <button
        className={`camera-dock-btn ${cameraMode === 'solar' || cameraMode === 'free' ? 'active' : ''}`}
        onClick={() => {
          resetCameraToOverview();
        }}
        title="Solar Perspective View"
      >
        <Eye size={18} />
        <span className="tooltip">Solar Overview (3D)</span>
      </button>

      {/* Top-down Tactical Orbit View */}
      <button
        className={`camera-dock-btn ${cameraMode === 'tactical' ? 'active' : ''}`}
        onClick={() => {
          setCameraMode('tactical');
        }}
        title="Top-down Tactical Orbits Map"
      >
        <Grid size={18} />
        <span className="tooltip">Tactical Orbit Map (Top-Down)</span>
      </button>

      {/* Reset Camera */}
      <button
        className="camera-dock-btn"
        onClick={() => {
          resetCameraToOverview();
        }}
        title="Reset Camera View to Origin"
      >
        <RotateCcw size={18} />
        <span className="tooltip">Reset View</span>
      </button>
    </div>
  );
}
