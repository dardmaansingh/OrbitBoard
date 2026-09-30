import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { audioEngine } from '../../three/AudioEngine';
import { FEATURES } from '../../config/features';
import { Volume2, VolumeX, Plus, Sparkles, Users } from 'lucide-react';

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

      <div className="brand-section" onClick={resetCameraToOverview} title="Reset to solar center">
        <span className="brand-wordmark">OrbitBoard</span>
      </div>

      <div className="readout-strip">
        <span className="readout-item">
          <span className="readout-label">STREAK</span>
          <span className="readout-value">{totalStreakSum}d</span>
        </span>
        <span className="readout-divider">|</span>
        <span className="readout-item">
          <span className="readout-label">DONE TODAY</span>
          <span className="readout-value">{completedTodayCount}/{habits.length}</span>
        </span>
        <span className="readout-divider">|</span>
        <span className="readout-item">
          <span className="readout-label">MOON</span>
          <span className="readout-value">{currentMoon.phaseName}</span>
        </span>
      </div>

      <div className="header-actions">

        <button
          className="btn-icon"
          onClick={toggleSound}
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {FEATURES.aiCoach && (
          <button className="btn-ghost" onClick={() => setActiveModal('ai')}>
            <Sparkles size={14} />
            <span>AI Coach</span>
          </button>
        )}

        {FEATURES.spaceFeed && (
          <button className="btn-ghost" onClick={() => setActiveModal('feed')}>
            <Users size={14} />
            <span>Space Feed</span>
          </button>
        )}

        <button
          className="btn-ghost"
          onClick={() => setActiveModal('analytics')}
        >
          Analytics
        </button>

        <button
          className="btn-primary"
          onClick={() => setActiveModal('create')}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Planet</span>
        </button>
      </div>
    </header>
  );
}
