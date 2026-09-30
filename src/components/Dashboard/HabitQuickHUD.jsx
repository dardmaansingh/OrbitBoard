import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

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
    <aside className="today-dock">
      {/* Dock Bar Header */}
      <div className="dock-header">
        <div className="dock-title-group">
          <span className="dock-title">Today</span>
          <span className="dock-count">
            {habits.filter(h => isHabitCompletedToday(h.id)).length}/{habits.length}
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="dock-toggle-btn"
          aria-label={isCollapsed ? 'Expand dock' : 'Collapse dock'}
        >
          {isCollapsed ? (
            <>
              <span>Expand</span>
              <ChevronUp size={13} />
            </>
          ) : (
            <>
              <span>Collapse</span>
              <ChevronDown size={13} />
            </>
          )}
        </button>
      </div>

      {/* Flat tray of rows: no cards inside cards */}
      {!isCollapsed && (
        <div className="dock-rows-tray">
          {habits.map((habit) => {
            const completed = isHabitCompletedToday(habit.id);
            const isSelected = selectedPlanetHabit?.id === habit.id;

            return (
              <div
                key={habit.id}
                className={`dock-row ${completed ? 'is-completed' : ''} ${isSelected ? 'is-selected' : ''}`}
                style={{ borderLeftColor: habit.color }}
                onClick={() => focusOnHabitPlanet(habit)}
              >
                {/* Left: Rank & Habit Title */}
                <div className="dock-row-left">
                  <span className="dock-row-rank">O{habit.rank}</span>
                  <span className="dock-row-name" title={habit.name}>
                    {habit.name}
                  </span>
                </div>

                {/* Right: Streak & Checkbox */}
                <div className="dock-row-right">
                  <span className="dock-row-streak" title={`Current streak: ${habit.streak} days`}>
                    {habit.streak}d
                  </span>

                  <button
                    className={`dock-checkbox ${completed ? 'checked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHabitToday(habit.id);
                    }}
                    title={completed ? 'Completed today (click to undo)' : 'Mark completed today'}
                    aria-label={`Mark ${habit.name} complete`}
                  >
                    {completed && <Check size={12} strokeWidth={3} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
