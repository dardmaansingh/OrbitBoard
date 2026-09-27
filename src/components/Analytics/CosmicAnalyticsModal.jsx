import React from 'react';
import { useHabits } from '../../context/HabitContext';
import { X, BarChart3, Flame, Award, TrendingUp, Compass } from 'lucide-react';

export function CosmicAnalyticsModal() {
  const { activeModal, setActiveModal, habits, habitLogs } = useHabits();

  if (activeModal !== 'analytics') return null;

  const totalLogs = habitLogs.length;
  const avgCompletion = Math.round(
    habits.reduce((acc, h) => acc + h.completionRate, 0) / (habits.length || 1)
  );

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#38bdf8" />
            <h2 className="modal-title">Habit Analytics & Planetary Rings</h2>
          </div>
          <button className="drawer-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top High-level KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <span className="val" style={{ color: '#38bdf8' }}>{totalLogs}</span>
              <span className="lbl">Total Completed Logs</span>
            </div>
            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <span className="val" style={{ color: '#10b981' }}>{avgCompletion}%</span>
              <span className="lbl">System-Wide Consistency</span>
            </div>
            <div className="stat-card" style={{ padding: '16px 12px' }}>
              <span className="val" style={{ color: '#f59e0b' }}>{habits.length}</span>
              <span className="lbl">Active Solar Bodies</span>
            </div>
          </div>

          {/* Section: Circular Apple-Watch Style Progress Rings (Blueprint 2.4) */}
          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#fbbf24" />
              Monthly Orbit Progress Rings (Apple Watch Inspired)
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
              Real-time monthly completion percentage directly scaling each planet's physical mass.
            </p>

            <div className="rings-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
              {habits.map((habit) => {
                const percent = Math.min(100, Math.max(0, habit.completionRate));
                const strokeDasharray = `${percent}, 100`;

                return (
                  <div key={habit.id} className="progress-ring-card">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        stroke={habit.color}
                        strokeDasharray={strokeDasharray}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">
                        {percent}%
                      </text>
                    </svg>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#f8fafc',
                        textAlign: 'center',
                        maxWidth: '120px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={habit.name}
                    >
                      {habit.name}
                    </span>
                    <span style={{ fontSize: '10px', color: '#f97316', fontWeight: '700' }}>
                      🔥 {habit.streak}d streak
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Streak Velocity Breakdown */}
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="#34d399" />
              Orbital Velocity & Streak Health
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {habits.map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: h.color }} />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#f8fafc' }}>{h.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
                    <span style={{ color: '#94a3b8' }}>Orbit #{h.orbitDistance}AU</span>
                    <span style={{ color: '#f97316', fontWeight: '700' }}>🔥 {h.streak} Days</span>
                    <span style={{ color: '#38bdf8', fontWeight: '600' }}>{h.completionRate}% Mass</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cosmic-btn" onClick={() => setActiveModal(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
