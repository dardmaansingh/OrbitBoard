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
        if (info) {
          setTooltip({
            visible: true,
            habit: info
          });
        } else {
          setTooltip(prev => ({ ...prev, visible: false }));
        }
      }
    });

    sceneInstanceRef.current = scene;

    return () => {
      scene.dispose();
      sceneInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.syncHabits(
        habits,
        isHabitCompletedToday,
        selectedPlanetHabit ? selectedPlanetHabit.id : null
      );
    }
  }, [habits, selectedPlanetHabit]);

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
        <div className="planet-hover-tooltip">
          <div className="tooltip-header">
            <span
              className="tooltip-dot"
              style={{ backgroundColor: tooltip.habit.color }}
            />
            <span className="tooltip-title">{tooltip.habit.name}</span>
          </div>
          <div className="tooltip-meta mono">
            Orbit {tooltip.habit.rank} · {tooltip.habit.streak}d streak
          </div>
        </div>
      )}
    </div>
  );
}
