import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { audioEngine } from '../../three/AudioEngine';
import {
  Flame,
  Volume2,
  VolumeX,
  Plus,
  Sparkles,
  BarChart3,
  Users,
  Compass
} from 'lucide-react';

export function CosmicHeader() {
  const {
    totalStreakSum,
    completedTodayCount,
    habits,
    currentMoon,
    setActiveModal,
    resetCameraToOverview
  } = useHabits();

  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioEngine.playCelestialChime(660);
    }
  };

  return (
    <header className="orbit-header">
      {/* Left: Brand Identity */}
      <div className="brand-section">
        <div className="brand-logo-icon" onClick={resetCameraToOverview} style={{ cursor: 'pointer' }} title="Reset to Solar Center">
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">ORBITBOARD</span>
            <span className="brand-tag">MERN 2.0</span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Living Habit Solar System
          </span>
        </div>
      </div>

      {/* Middle: Cosmic Metrics */}
      <div className="nav-metrics">
        {/* Total Streak Velocity */}
        <div className="metric-pill" title="Total accumulated consistency streaks across all orbits">
          <Flame size={16} color="#f97316" />
          <span style={{ color: '#94a3b8' }}>System Streak:</span>
          <span className="metric-val">{totalStreakSum}d</span>
        </div>

        {/* Orbit Completion Status */}
        <div className="metric-pill" title="Habits completed today">
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ color: '#94a3b8' }}>In Orbit Today:</span>
          <span style={{ fontWeight: '700', color: '#f8fafc' }}>
            {completedTodayCount} / {habits.length}
          </span>
        </div>

        {/* Lunar Phase Widget (Astronomy Touch) */}
        <div className="metric-pill" title={`Lunar Phase: ${currentMoon.phaseName} (${currentMoon.illumination}% illuminated)`}>
          <span style={{ fontSize: '15px' }}>{currentMoon.icon}</span>
          <span style={{ color: '#94a3b8' }}>Moon:</span>
          <span style={{ color: '#e2e8f0', fontWeight: '600' }}>
            {currentMoon.phaseName}
          </span>
        </div>
      </div>

      {/* Right: Modals & Actions */}
      <div className="header-actions">
        {/* Audio Ambient Synth Toggle */}
        <button
          className="cosmic-btn"
          onClick={toggleSound}
          title={isMuted ? 'Unmute Cosmic Ambient Audio' : 'Mute Cosmic Ambient Audio'}
        >
          {isMuted ? <VolumeX size={15} color="#94a3b8" /> : <Volume2 size={15} color="#38bdf8" />}
        </button>

        {/* AI Habit Coach */}
        <button
          className="cosmic-btn"
          onClick={() => setActiveModal('ai')}
          title="Open AI Habit Coach"
        >
          <Sparkles size={15} color="#c084fc" />
          <span>AI Coach</span>
        </button>

        {/* Analytics & Progress Rings */}
        <button
          className="cosmic-btn"
          onClick={() => setActiveModal('analytics')}
          title="View Habit Analytics & Progress Rings"
        >
          <BarChart3 size={15} color="#38bdf8" />
          <span>Analytics</span>
        </button>

        {/* Space Feed */}
        <button
          className="cosmic-btn"
          onClick={() => setActiveModal('feed')}
          title="Explore Cosmic Community Milestones"
        >
          <Users size={15} color="#34d399" />
          <span>Space Feed</span>
        </button>

        {/* Add Habit */}
        <button
          className="cosmic-btn cosmic-btn-sun"
          onClick={() => setActiveModal('create')}
          title="Create New Orbit Habit"
        >
          <Plus size={16} />
          <span>New Planet</span>
        </button>
      </div>
    </header>
  );
}
