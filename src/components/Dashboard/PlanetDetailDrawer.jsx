import React from 'react';
import { useHabits, getMoonPhaseDetails } from '../../context/HabitContext';
import { X, Check, Calendar, Trash2 } from 'lucide-react';

export function PlanetDetailDrawer() {
  const {
    selectedPlanetHabit,
    setSelectedPlanetHabit,
    isHabitCompletedToday,
    toggleHabitToday,
    getYearlyHeatmap,
    deleteHabit,
    resetCameraToOverview
  } = useHabits();

  if (!selectedPlanetHabit) return null;

  const habit = selectedPlanetHabit;
  const isDoneToday = isHabitCompletedToday(habit.id);
  const heatmapDays = getYearlyHeatmap(habit.id);
  const moon = getMoonPhaseDetails();

  const handleClose = () => {
    setSelectedPlanetHabit(null);
    resetCameraToOverview();
  };

  const handleDelete = () => {
    if (window.confirm(`Decommission planet orbit for "${habit.name}"?`)) {
      deleteHabit(habit.id);
    }
  };

  return (
    <aside className="planet-drawer">
      {/* Header */}
      <div className="drawer-header">
        <div className="drawer-meta-tags">
          <span
            className="drawer-category-bar"
            style={{ backgroundColor: habit.color }}
          />
          <span className="drawer-category-name">{habit.category}</span>
          <span className="drawer-sep">/</span>
          <span className="drawer-rank mono">Orbit {habit.rank}</span>
        </div>

        <button
          className="btn-icon"
          onClick={handleClose}
          aria-label="Close drawer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="drawer-content">
        {/* Habit Identity */}
        <div className="drawer-title-block">
          <h2 className="drawer-habit-title">{habit.name}</h2>
          <p className="drawer-habit-desc">
            {habit.description || 'Continuous daily discipline.'}
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          className={isDoneToday ? 'btn-done-today' : 'btn-primary'}
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => toggleHabitToday(habit.id)}
        >
          <Check size={14} strokeWidth={2.5} />
          <span>{isDoneToday ? 'Completed Today (Undo)' : 'Complete Today'}</span>
        </button>

        {/* Monospaced Key Metrics */}
        <div className="drawer-metrics-strip">
          <div className="metric-box">
            <span className="metric-box-val mono">{habit.streak}d</span>
            <span className="metric-box-label">CURRENT</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-val mono">{habit.bestStreak || habit.streak}d</span>
            <span className="metric-box-label">BEST</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-val mono">
              {habit.monthlyCompletion ?? habit.completionRate}%
            </span>
            <span className="metric-box-label">MONTHLY</span>
          </div>
        </div>

        {/* Lunar Status */}
        <div className="drawer-lunar-row">
          <span className="drawer-lunar-label">LUNAR CYCLE</span>
          <span className="drawer-lunar-val mono">
            {moon.phaseName} ({moon.illumination}%)
          </span>
        </div>

        {/* 365-Day Monochromatic Heatmap (Heat scale: #3A2A14 -> #7A4E16 -> #C27A1E -> #F2A33A -> #FFD27A) */}
        <div className="drawer-heatmap-section">
          <div className="heatmap-header">
            <span className="heatmap-title">
              <Calendar size={13} />
              <span>365-Day Log</span>
            </span>
            <span className="heatmap-legend">
              <span>Less</span>
              <span className="legend-cell level-0" />
              <span className="legend-cell level-1" />
              <span className="legend-cell level-2" />
              <span className="legend-cell level-3" />
              <span className="legend-cell level-4" />
              <span>More</span>
            </span>
          </div>

          <div className="heatmap-grid-scroll">
            <div className="heatmap-grid">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`heatmap-cell level-${day.level}`}
                  title={`${day.date}: ${day.count > 0 ? `${day.count} entries` : 'No logs'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orbit Mechanics Note */}
        <div className="drawer-telemetry-note mono">
          RANK {habit.rank} · RADIUS {habit.orbitDistance?.toFixed(1) || '12.0'}AU · SPEED ∝ r^-1.5
        </div>

        {/* Danger Action */}
        <div className="drawer-footer-actions">
          <button
            onClick={handleDelete}
            className="btn-danger-link"
          >
            <Trash2 size={13} />
            <span>Decommission Orbit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
