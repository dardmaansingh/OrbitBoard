import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { X, Sparkles, Send, Bot, RefreshCw, Compass, Lightbulb, Zap } from 'lucide-react';

export function CosmicCoachModal() {
  const { activeModal, setActiveModal, habits, totalStreakSum } = useHabits();
  const [mode, setMode] = useState('cosmic'); 
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: `Greetings, Commander of the Cosmos. I have scanned your solar system coordinates. You have ${habits.length} planets in stable orbit, anchored by a total gravitational streak of ${totalStreakSum} days. How can I guide your planetary orbits today?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (activeModal !== 'ai') return null;

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
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-slate-400" />
            <h2 className="modal-title">AI Habit Coach • Celestial Diagnostics</h2>
          </div>
          <button className="drawer-close-btn text-slate-400 hover:text-slate-200" onClick={() => setActiveModal(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '360px', maxHeight: '55vh' }}>
          <div className="flex items-center justify-between p-2 px-3 bg-white/[0.02] border border-white/5 rounded-lg">
            <span className="text-xs text-slate-400 font-medium">Coach Tone Mode:</span>
            <div className="flex gap-1.5">
              <button
                className={`cosmic-btn ${mode === 'cosmic' ? 'cosmic-btn-primary' : ''}`}
                style={{ padding: '3px 9px', fontSize: '11px' }}
                onClick={() => setMode('cosmic')}
              >
                🔭 Cosmic Metaphor
              </button>
              <button
                className={`cosmic-btn ${mode === 'practical' ? 'cosmic-btn-primary' : ''}`}
                style={{ padding: '3px 9px', fontSize: '11px' }}
                onClick={() => setMode('practical')}
              >
                ⚡ Practical Coaching
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[88%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-slate-300" />
                  </div>
                )}
                <div
                  className={`p-3 px-3.5 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600/25 border border-blue-500/40 text-slate-100'
                      : 'bg-white/[0.03] border border-white/5 text-slate-200'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
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
