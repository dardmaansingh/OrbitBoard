import React, { useEffect, useRef, useState } from 'react';
import { SolarSystemScene } from './SolarSystemScene';
import { useHabits } from '../context/HabitContext';
import { TooltipState, RankedHabit, HabitContextType } from '../types';

export function ThreeCanvas(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneInstanceRef = useRef<any>(null);
  const {
    habits,
    isHabitCompletedToday,
    selectedPlanetHabit,
    focusOnHabitPlanet,
    cameraMode
  } = useHabits();

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    habit: null,
    screenX: 0,
    screenY: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new SolarSystemScene(containerRef.current, {
      onPlanetClick: (habit: RankedHabit) => {
        focusOnHabitPlanet(habit);
      },
      onPlanetHover: (info: RankedHabit | null) => {
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
  }, [focusOnHabitPlanet]);

  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.syncHabits(
        habits,
        isHabitCompletedToday,
        selectedPlanetHabit ? selectedPlanetHabit.id : null
      );
    }
  }, [habits, selectedPlanetHabit, isHabitCompletedToday]);

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
