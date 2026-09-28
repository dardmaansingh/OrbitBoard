import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { X, Sparkles, Globe, Orbit } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Health',
    planetType: 'terran',
    color: '#2563eb',
    atmosphereColor: '#93c5fd',
    description: 'Earth-like Terran world with deep blue oceans, realistic continents, and active clouds'
  },
  {
    name: 'Focus',
    planetType: 'azure-gas',
    color: '#0284c7',
    atmosphereColor: '#7dd3fc',
    description: 'Atmospheric azure gas world with subtle meteorological storm bands'
  },
  {
    name: 'Creativity',
    planetType: 'purple-ringed',
    color: '#6366f1',
    atmosphereColor: '#a5b4fc',
    hasRings: true,
    description: 'Celestial slate-indigo world with concentric dust rings'
  },
  {
    name: 'Mindfulness',
    planetType: 'opal-ice',
    color: '#0d9488',
    atmosphereColor: '#5eead4',
    description: 'Glacial crystalline ice planet with shimmering oceanic fractures'
  },
  {
    name: 'Fitness',
    planetType: 'crimson-ember',
    color: '#c2410c',
    atmosphereColor: '#fdba74',
    description: 'Mars-like volcanic terrain with terracotta canyons and basalt vents'
  },
  {
    name: 'Knowledge',
    planetType: 'saturn-gold',
    color: '#d97706',
    atmosphereColor: '#fde68a',
    hasRings: true,
    description: 'Warm sandstone ochre giant with natural planetary rings'
  }
];

export function HabitModal() {
  const { activeModal, setActiveModal, addHabit } = useHabits();

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [frequency, setFrequency] = useState('Daily');
  const [description, setDescription] = useState('');

  if (activeModal !== 'create') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name: name.trim(),
      category: selectedCategory.name,
      planetType: selectedCategory.planetType,
      color: selectedCategory.color,
      atmosphereColor: selectedCategory.atmosphereColor,
      hasRings: selectedCategory.hasRings || false,
      frequency,
      description: description.trim() || `Daily ${selectedCategory.name.toLowerCase()} discipline.`
    });

    setName('');
    setDescription('');
    setActiveModal(null);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Orbit size={20} color="#fbbf24" />
            <h2 className="modal-title">Spawn New Planetary Habit</h2>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setActiveModal(null)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Habit Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 45-Min Heavy Weights or Read 20 Pages"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category & Planetary Biome</label>
              <div className="category-picker-grid">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.name === cat.name;
                  return (
                    <div
                      key={cat.name}
                      className={`category-option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                          boxShadow: `0 0 12px ${cat.color}88`
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc' }}>
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Preview: {selectedCategory.description}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Frequency Target</label>
              <select
                className="form-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Daily">Daily Orbit (7 days/week)</option>
                <option value="5x/week">5 Days per Week</option>
                <option value="Weekly">Weekly Milestone</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cosmic Intent / Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Why is this orbit crucial to your personal gravity?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cosmic-btn"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button type="submit" className="cosmic-btn cosmic-btn-sun">
              <Sparkles size={16} />
              <span>Launch Planet into Orbit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
