import React from 'react';
import { useHabits } from '../../context/HabitContext';
import { X } from 'lucide-react';

export function CosmicAnalyticsModal() {
  const { activeModal, setActiveModal, habits, habitLogs } = useHabits();

  if (activeModal !== 'analytics') return null;

  const totalLogs = habitLogs.length;
  const avgCompletion = Math.round(
    habits.reduce((acc, h) => acc + (h.monthlyCompletion ?? h.completionRate ?? 0), 0) / (habits.length || 1)
  );

  const rankedHabits = [...habits].sort((a, b) => (a.rank || 0) - (b.rank || 0));

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="modal-panel modal-panel-wide" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">Analytics</h2>
          <button
            className="btn-icon"
            onClick={() => setActiveModal(null)}
            aria-label="Close analytics"
          >
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">

          <div className="analytics-readout-line">
            <span className="readout-segment">
              <span className="readout-num">{totalLogs}</span> total logs
            </span>
            <span className="readout-sep">·</span>
            <span className="readout-segment">
              <span className="readout-num">{avgCompletion}%</span> consistency
            </span>
            <span className="readout-sep">·</span>
            <span className="readout-segment">
              <span className="readout-num">{habits.length}</span> active habits
            </span>
          </div>

          <div className="analytics-section">
            <h3 className="section-title">Progress</h3>
            <div className="rings-grid">
              {rankedHabits.map((habit) => {
                const percent = Math.min(100, Math.max(0, habit.monthlyCompletion ?? habit.completionRate ?? 0));
                const strokeDasharray = `${percent}, 100`;

                return (
                  <div key={habit.id} className="ring-cell">
                    <svg viewBox="0 0 36 36" className="ring-svg">
                      <path
                        className="ring-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        strokeWidth="1.8"
                      />
                      <path
                        className="ring-bar"
                        stroke={habit.color}
                        strokeDasharray={strokeDasharray}
                        strokeWidth="1.8"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="ring-percent">
                        {percent}%
                      </text>
                    </svg>
                    <div className="ring-label-group">
                      <span className="ring-name" title={habit.name}>
                        {habit.name}
                      </span>
                      <span className="ring-meta mono">
                        Orbit {habit.rank} · {habit.streak}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="analytics-section">
            <h3 className="section-title">Streaks</h3>
            <div className="ranked-table-wrapper">
              <table className="ranked-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px' }}>RANK</th>
                    <th>HABIT</th>
                    <th style={{ width: '100px' }}>ORBIT</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>STREAK</th>
                    <th style={{ width: '90px', textAlign: 'right' }}>COMPLETION</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedHabits.map((h) => (
                    <tr key={h.id}>
                      <td className="mono text-muted">{h.rank}</td>
                      <td>
                        <div className="table-habit-name">
                          <span
                            className="table-color-dot"
                            style={{ backgroundColor: h.color }}
                          />
                          <span>{h.name}</span>
                        </div>
                      </td>
                      <td className="mono text-muted">Orbit {h.rank}</td>
                      <td className="mono text-right font-medium">{h.streak}d</td>
                      <td className="mono text-right text-muted">
                        {h.monthlyCompletion ?? h.completionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => setActiveModal(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
