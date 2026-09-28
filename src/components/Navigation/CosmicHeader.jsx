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
    <header className="orbit-header flex items-center justify-between">
      {/* Left: Brand Identity */}
      <div className="brand-section flex items-center gap-2.5">
        <div
          className="brand-logo-icon cursor-pointer"
          onClick={resetCameraToOverview}
          title="Reset to Solar Center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="brand-title text-sm font-semibold tracking-tight text-slate-100">ORBITBOARD</span>
            <span className="brand-tag text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-white/5 border border-white/10 text-slate-400">
              v2.0
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            Living Habit Solar System
          </span>
        </div>
      </div>

      {/* Middle: Cosmic Metrics */}
      <div className="nav-metrics flex items-center gap-3">
        {/* Total Streak Velocity */}
        <div className="metric-pill" title="Total accumulated consistency streaks across all orbits">
          <Flame size={14} className="text-amber-500" />
          <span className="text-slate-400">System Streak:</span>
          <span className="metric-val text-slate-200 font-semibold">{totalStreakSum}d</span>
        </div>

        {/* Orbit Completion Status */}
        <div className="metric-pill" title="Habits completed today">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-400">In Orbit:</span>
          <span className="font-semibold text-slate-200">
            {completedTodayCount} / {habits.length}
          </span>
        </div>

        {/* Lunar Phase Widget */}
        <div className="metric-pill" title={`Lunar Phase: ${currentMoon.phaseName} (${currentMoon.illumination}% illuminated)`}>
          <span className="text-xs">{currentMoon.icon}</span>
          <span className="text-slate-400">Moon:</span>
          <span className="text-slate-200 font-medium">
            {currentMoon.phaseName}
          </span>
        </div>
      </div>

      {/* Right: Modals & Actions */}
      <div className="header-actions flex items-center gap-2">
        {/* Audio Ambient Synth Toggle */}
        <button
          className="cosmic-btn p-2"
          onClick={toggleSound}
          title={isMuted ? 'Unmute Cosmic Ambient Audio' : 'Mute Cosmic Ambient Audio'}
        >
          {isMuted ? <VolumeX size={14} className="text-slate-400" /> : <Volume2 size={14} className="text-slate-300" />}
        </button>

        {/* AI Habit Coach */}
        <button
          className="cosmic-btn"
          onClick={() => setActiveModal('ai')}
          title="Open AI Habit Coach"
        >
          <Sparkles size={14} className="text-slate-400" />
          <span>AI Coach</span>
        </button>

        {/* Analytics & Progress Rings */}
        <button
          className="cosmic-btn"
          onClick={() => setActiveModal('analytics')}
          title="View Habit Analytics & Progress Rings"
        >
          <BarChart3 size={14} className="text-slate-400" />
          <span>Analytics</span>
        </button>

        {/* Space Feed */}
        <button
          className="cosmic-btn"
          onClick={() => setActiveModal('feed')}
          title="Explore Cosmic Community Milestones"
        >
          <Users size={14} className="text-slate-400" />
          <span>Space Feed</span>
        </button>

        {/* Add Habit */}
        <button
          className="cosmic-btn cosmic-btn-primary"
          onClick={() => setActiveModal('create')}
          title="Create New Orbit Habit"
        >
          <Plus size={14} />
          <span>New Planet</span>
        </button>
      </div>
    </header>
  );
}
