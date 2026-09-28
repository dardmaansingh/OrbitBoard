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
      <div className="hud-header flex items-center justify-between pb-2 border-b border-white/5">
        <div className="hud-title-group flex items-center gap-2.5">
          <Orbit size={15} className="text-slate-400" />
          <span className="hud-title text-xs font-semibold tracking-wide text-slate-200 uppercase">Orbital Log • Quick Dock</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {habits.length} Active Planets
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-transparent border-0 text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1 text-xs transition-colors duration-150"
        >
          {isCollapsed ? (
            <>
              <span>Expand</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Collapse</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="hud-cards-row pt-2">
          {habits.map((habit) => {
            const completed = isHabitCompletedToday(habit.id);
            const isSelected = selectedPlanetHabit?.id === habit.id;

            return (
              <div
                key={habit.id}
                className={`habit-quick-card group ${completed ? 'completed' : ''} ${isSelected ? 'ring-1 ring-blue-500/50' : ''}`}
                style={{
                  borderLeft: `3px solid ${habit.color}`,
                  background: isSelected ? 'rgba(37, 99, 235, 0.12)' : undefined
                }}
                onClick={() => focusOnHabitPlanet(habit)}
              >
                <div className="habit-card-left flex items-center gap-2.5 min-w-0">
                  <div
                    className="planet-orb-indicator"
                    style={{
                      backgroundColor: habit.color,
                      color: habit.color
                    }}
                    title={`${habit.name} (${habit.category})`}
                  />
                  <div className="habit-card-info flex flex-col min-w-0">
                    <span className="habit-card-name text-[13px] font-medium text-slate-200 truncate" title={habit.name}>
                      {habit.name}
                    </span>
                    <div className="habit-card-meta flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="streak-flame flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Flame size={11} className="text-amber-500" />
                        {habit.streak}d
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{habit.category}</span>
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
                  <Check size={13} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
