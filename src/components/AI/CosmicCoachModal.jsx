import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { X, Sparkles, Send, Bot, RefreshCw, Compass, Lightbulb, Zap } from 'lucide-react';

export function CosmicCoachModal() {
  const { activeModal, setActiveModal, habits, totalStreakSum } = useHabits();
  const [mode, setMode] = useState('cosmic'); // 'cosmic' | 'practical'
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: `Greetings, Commander of the Cosmos. I have scanned your solar system coordinates. You have ${habits.length} planets in stable orbit, anchored by a total gravitational streak of ${totalStreakSum} days. How can I guide your planetary orbits today?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (activeModal !== 'ai') return null;

  // Generate dynamic contextual analysis based on actual habits
  const handleGenerateAdvice = (userQuery) => {
    setIsAnalyzing(true);

    const lowestHabit = [...habits].sort((a, b) => a.completionRate - b.completionRate)[0];
    const highestHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];

    setTimeout(() => {
      let adviceText = '';
      if (mode === 'cosmic') {
        adviceText = `🔭 **Cosmic Orbital Telemetry Analysis:**\n\n` +
          `• **Gravitational Core:** Your **${highestHabit.name}** orbit burns bright at a ${highestHabit.streak}-day streak! Its orbital velocity is at peak momentum, warping spacetime favorably.\n` +
          `• **Perturbation Detected:** Your **${lowestHabit.name}** orbit (${lowestHabit.completionRate}% completion) has entered a slight retrograde wobble. Anchor it immediately before tomorrow's perihelion.\n` +
          `• **Cosmic Recommendation:** Habit stacking: Pair your **${lowestHabit.name}** immediately after your hyper-consistent **${highestHabit.name}** to harness its gravitational momentum!`;
      } else {
        adviceText = `📊 **Habit Performance Review:**\n\n` +
          `• **Strongest Habit:** "${highestHabit.name}" with a ${highestHabit.streak}-day streak. Keep your current cue and reward system intact.\n` +
          `• **Area for Growth:** "${lowestHabit.name}" has ${lowestHabit.completionRate}% completion rate. To prevent streak decay, reduce friction: prepare your gear the night before.\n` +
          `• **Action Item:** Complete your scheduled log before 8:00 PM today to maintain streak parity.`;
      }

      setMessages(prev => [
        ...prev,
        { role: 'user', text: userQuery || 'Run systemic orbit diagnostics.' },
        { role: 'assistant', text: adviceText }
      ]);
      setIsAnalyzing(false);
      setInputText('');
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#c084fc" />
            <h2 className="modal-title">AI Habit Coach • Cosmic Telemetry</h2>
          </div>
          <button className="drawer-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '360px', maxHeight: '55vh' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '10px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Coach Tone Mode:</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`cosmic-btn ${mode === 'cosmic' ? 'cosmic-btn-primary' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setMode('cosmic')}
              >
                ✨ Cosmic Metaphor
              </button>
              <button
                className={`cosmic-btn ${mode === 'practical' ? 'cosmic-btn-primary' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setMode('practical')}
              >
                ⚡ Practical Coaching
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {m.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Bot size={16} color="#fff" />
                  </div>
                )}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    background: m.role === 'user' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(30, 41, 59, 0.7)',
                    border: m.role === 'user' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12px' }}>
                <RefreshCw size={14} className="spin-animation" />
                <span>AI Coach calculating celestial orbital telemetry...</span>
              </div>
            )}
          </div>
        </div>

        {/* Preset Prompt Buttons */}
        <div style={{ padding: '0 24px 12px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="cosmic-btn"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => handleGenerateAdvice('Analyze my habit weak spots and orbital decay.')}
          >
            <Lightbulb size={12} color="#fbbf24" />
            <span>Analyze Weak Spots</span>
          </button>
          <button
            className="cosmic-btn"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => handleGenerateAdvice('Suggest a new habit to balance my solar system.')}
          >
            <Zap size={12} color="#34d399" />
            <span>Suggest New Planet Orbit</span>
          </button>
        </div>

        <div className="modal-footer">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) handleGenerateAdvice(inputText);
            }}
            style={{ display: 'flex', gap: '8px', width: '100%' }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask your AI habit coach..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="cosmic-btn cosmic-btn-primary">
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
