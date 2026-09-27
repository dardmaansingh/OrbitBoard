import React from 'react';
import { useHabits, getMoonPhaseDetails } from '../../context/HabitContext';
import {
  X,
  Flame,
  Check,
  Calendar,
  Sparkles,
  Trash2,
  TrendingUp,
  Moon,
  Compass
} from 'lucide-react';

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
    if (window.confirm(`Are you sure you want to decommission planet orbit for "${habit.name}"?`)) {
      deleteHabit(habit.id);
    }
  };

  return (
    <aside className="planet-drawer">
      {/* Drawer Header */}
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="cosmic-badge"
            style={{
              backgroundColor: `${habit.color}25`,
              color: habit.color,
              borderColor: `${habit.color}50`
            }}
          >
            {habit.category} Planet
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Orbit #{habit.orbitDistance}AU</span>
        </div>
        <button className="drawer-close-btn" onClick={handleClose} title="Close planet inspection">
          <X size={18} />
        </button>
      </div>

      <div className="drawer-content">
        {/* Planet Hero Preview */}
        <div className="planet-hero">
          <div
            className="planet-hero-preview"
            style={{
              backgroundColor: habit.color,
              color: habit.color,
              boxShadow: `0 0 25px ${habit.color}88`
            }}
          />
          <div className="planet-hero-info">
            <h2 className="planet-hero-title">{habit.name}</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              {habit.description || 'Persistent celestial routine.'}
            </p>
          </div>
        </div>

        {/* Astronomy Lunar Banner (Blueprint feature) */}
        <div className="lunar-phase-banner">
          <div className="lunar-icon">{moon.icon}</div>
          <div className="lunar-text-group">
            <span className="lunar-title">
              Lunar Alignment: {moon.phaseName}
            </span>
            <span className="lunar-sub">
              {moon.illumination}% illuminated • Day {moon.dayOfCycle} of synodic orbit
            </span>
          </div>
        </div>

        {/* Quick Mark Complete Button */}
        <button
          className={`cosmic-btn ${isDoneToday ? 'cosmic-btn' : 'cosmic-btn-primary'}`}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '12px 20px',
            fontSize: '14px',
            background: isDoneToday ? 'rgba(16, 185, 129, 0.2)' : undefined,
            borderColor: isDoneToday ? '#10b981' : undefined
          }}
          onClick={() => toggleHabitToday(habit.id)}
        >
          <Check size={18} />
          <span>{isDoneToday ? 'Completed Today! (Click to Undo)' : 'Mark Orbit Complete Today'}</span>
        </button>

        {/* Stats Grid */}
        <div className="drawer-stats-grid">
          <div className="stat-card">
            <span className="val" style={{ color: '#f97316' }}>
              🔥 {habit.streak}d
            </span>
            <span className="lbl">Current Streak</span>
          </div>
          <div className="stat-card">
            <span className="val" style={{ color: '#38bdf8' }}>
              {habit.bestStreak || habit.streak}d
            </span>
            <span className="lbl">Best Streak</span>
          </div>
          <div className="stat-card">
            <span className="val" style={{ color: '#34d399' }}>
              {habit.completionRate}%
            </span>
            <span className="lbl">Consistency</span>
          </div>
        </div>

        {/* 365-Day Contribution Heatmap Grid (GitHub style as specified in blueprint 2.3 & 2.4) */}
        <div className="heatmap-section">
          <div className="heatmap-header">
            <span style={{ fontWeight: '600', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#38bdf8" />
              Annual Orbit Heatmap (365 Days)
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              GitHub style
            </span>
          </div>

          <div className="heatmap-container">
            <div className="heatmap-grid">
              {heatmapDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`heatmap-cell ${day.level > 0 ? `level-${day.level}` : ''}`}
                  title={`${day.date}: ${day.count > 0 ? 'Completed' : 'No record'}`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
              <span>Less</span>
              <div className="heatmap-cell" style={{ cursor: 'default' }} />
              <div className="heatmap-cell level-1" style={{ cursor: 'default' }} />
              <div className="heatmap-cell level-2" style={{ cursor: 'default' }} />
              <div className="heatmap-cell level-3" style={{ cursor: 'default' }} />
              <div className="heatmap-cell level-4" style={{ cursor: 'default' }} />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Orbit Mechanics Note */}
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            color: '#94a3b8',
            lineHeight: '1.5'
          }}
        >
          <strong style={{ color: '#e2e8f0' }}>Cosmic Physics:</strong> Planet size scales with your {habit.completionRate}% completion rate. Orbital velocity dynamically accelerates as your {habit.streak}-day streak increases!
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px' }}>
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
          >
            <Trash2 size={14} />
            <span>Archive Planet</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
