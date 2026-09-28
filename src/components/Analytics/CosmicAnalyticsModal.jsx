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
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-slate-400" />
            <h2 className="modal-title">Habit Analytics & Planetary Rings</h2>
          </div>
          <button className="drawer-close-btn text-slate-400 hover:text-slate-200" onClick={() => setActiveModal(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top High-level KPIs */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="stat-card">
              <span className="val text-slate-100">{totalLogs}</span>
              <span className="lbl">Total Completed Logs</span>
            </div>
            <div className="stat-card">
              <span className="val text-emerald-400">{avgCompletion}%</span>
              <span className="lbl">System-Wide Consistency</span>
            </div>
            <div className="stat-card">
              <span className="val text-amber-400">{habits.length}</span>
              <span className="lbl">Active Solar Bodies</span>
            </div>
          </div>

          {/* Section: Circular Apple-Watch Style Progress Rings */}
          <div className="mt-1">
            <h3 className="text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
              <Award size={14} className="text-amber-500" />
              Monthly Orbit Progress Rings
            </h3>
            <p className="text-[11.5px] text-slate-400 mb-3">
              Real-time completion percentage directly determining each planet's physical mass and orbit momentum.
            </p>

            <div className="rings-container">
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
                      className="text-[11.5px] font-medium text-slate-200 text-center max-w-[110px] truncate"
                      title={habit.name}
                    >
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-amber-500 font-semibold">
                      🔥 {habit.streak}d streak
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Streak Velocity Breakdown */}
          <div className="mt-2">
            <h3 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp size={14} className="text-emerald-500" />
              Orbital Velocity & Streak Health
            </h3>
            <div className="flex flex-col gap-1.5">
              {habits.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 px-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg border border-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="planet-orb-indicator"
                      style={{ backgroundColor: h.color, color: h.color }}
                    />
                    <span className="text-xs font-medium text-slate-200">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400">Orbit #{h.orbitDistance}AU</span>
                    <span className="text-amber-500 font-semibold">🔥 {h.streak}d</span>
                    <span className="text-slate-300 font-medium">{h.completionRate}% Mass</span>
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
