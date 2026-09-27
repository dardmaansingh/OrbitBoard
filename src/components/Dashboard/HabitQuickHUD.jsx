import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { Check, Flame, ChevronDown, ChevronUp, Sparkles, Orbit } from 'lucide-react';

export function HabitQuickHUD() {
  const {
    habits,
    isHabitCompletedToday,
    toggleHabitToday,
    focusOnHabitPlanet,
    selectedPlanetHabit
  } = useHabits();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className="habit-hud-dock"
      style={{
        transform: isCollapsed ? 'translate(-50%, calc(100% - 44px))' : 'translate(-50%, 0)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div className="hud-header">
        <div className="hud-title-group">
          <Orbit size={16} color="#38bdf8" />
          <span className="hud-title">Orbital Log • Quick Dock</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8'
            }}
          >
            {habits.length} Active Planets
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px'
          }}
        >
          {isCollapsed ? (
            <>
              <span>Expand</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>Collapse</span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="hud-cards-row">
          {habits.map((habit) => {
            const completed = isHabitCompletedToday(habit.id);
            const isSelected = selectedPlanetHabit?.id === habit.id;

            return (
              <div
                key={habit.id}
                className={`habit-quick-card ${completed ? 'completed' : ''}`}
                style={{
                  borderLeft: `3px solid ${habit.color}`,
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : undefined
                }}
                onClick={() => focusOnHabitPlanet(habit)}
              >
                <div className="habit-card-left">
                  <div
                    className="planet-orb-indicator"
                    style={{
                      backgroundColor: habit.color,
                      color: habit.color
                    }}
                  />
                  <div className="habit-card-info">
                    <span className="habit-card-name" title={habit.name}>
                      {habit.name}
                    </span>
                    <div className="habit-card-meta">
                      <span className="streak-flame">
                        <Flame size={12} />
                        {habit.streak}d
                      </span>
                      <span>•</span>
                      <span>{habit.category}</span>
                    </div>
                  </div>
                </div>

                {/* Direct check completion button */}
                <button
                  className={`check-circle-btn ${completed ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHabitToday(habit.id);
                  }}
                  title={completed ? 'Completed today! Click to undo' : 'Mark completed today'}
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
