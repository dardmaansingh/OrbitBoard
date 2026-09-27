import React, { useEffect, useRef, useState } from 'react';
import { SolarSystemScene } from './SolarSystemScene';
import { useHabits } from '../context/HabitContext';

export function ThreeCanvas() {
  const containerRef = useRef(null);
  const sceneInstanceRef = useRef(null);
  const {
    habits,
    isHabitCompletedToday,
    selectedPlanetHabit,
    focusOnHabitPlanet,
    cameraMode
  } = useHabits();

  const [tooltip, setTooltip] = useState({ visible: false, habit: null, screenX: 0, screenY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new SolarSystemScene(containerRef.current, {
      onPlanetClick: (habit) => {
        focusOnHabitPlanet(habit);
      },
      onPlanetHover: (info) => {
        setTooltip(info);
      }
    });

    sceneInstanceRef.current = scene;

    return () => {
      scene.dispose();
      sceneInstanceRef.current = null;
    };
  }, []);

  // Sync habits to scene
  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.syncHabits(
        habits,
        isHabitCompletedToday,
        selectedPlanetHabit ? selectedPlanetHabit.id : null
      );
    }
  }, [habits, selectedPlanetHabit]);

  // Handle camera mode commands
  useEffect(() => {
    if (!sceneInstanceRef.current) return;
    if (cameraMode === 'solar' || cameraMode === 'free') {
      if (!selectedPlanetHabit) {
        sceneInstanceRef.current.setCameraOverview();
      }
    } else if (cameraMode === 'tactical') {
      sceneInstanceRef.current.setCameraTactical();
    } else if (cameraMode === 'focus' && selectedPlanetHabit) {
      sceneInstanceRef.current.focusPlanet(selectedPlanetHabit.id);
    }
  }, [cameraMode, selectedPlanetHabit]);

  return (
    <div className="three-canvas-container" ref={containerRef}>
      {tooltip.visible && tooltip.habit && (
        <div
          className="space-tooltip"
          style={{
            left: `${tooltip.screenX}px`,
            top: `${tooltip.screenY}px`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: tooltip.habit.color,
                boxShadow: `0 0 6px ${tooltip.habit.color}`
              }}
            />
            <span>{tooltip.habit.name}</span>
          </div>
          <div className="space-tooltip-streak">
            🔥 {tooltip.habit.streak} day streak • {tooltip.habit.completionRate}% rate
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            Click to zoom in
          </span>
        </div>
      )}
    </div>
  );
}
