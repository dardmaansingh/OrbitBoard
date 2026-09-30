import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';
import { X, Plus } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Health',
    color: '#C1583A',
    description: 'Mars rust pigment · Endurance & bodily health'
  },
  {
    name: 'Knowledge',
    color: '#D4A55A',
    description: 'Saturn ochre pigment · Reading & mental models'
  },
  {
    name: 'Mindfulness',
    color: '#4E9F98',
    description: 'Ocean teal pigment · Meditation & calmness'
  },
  {
    name: 'Focus',
    color: '#4A6FA5',
    description: 'Neptune blue pigment · Deep technical work'
  },
  {
    name: 'Creativity',
    color: '#B5667A',
    description: 'Dusty rose pigment · Writing & design'
  },
  {
    name: 'Fitness',
    color: '#B08D6E',
    description: 'Jupiter sand pigment · Strength conditioning'
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
      color: selectedCategory.color,
      frequency,
      description: description.trim() || `Daily ${selectedCategory.name.toLowerCase()} routine.`
    });

    setName('');
    setDescription('');
    setActiveModal(null);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2 className="modal-title">New Planet</h2>
          <button
            className="btn-icon"
            onClick={() => setActiveModal(null)}
            aria-label="Close dialog"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            <div className="form-group">
              <label className="form-label">NAME</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 45m Running or 20 Pages Non-fiction"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">CATEGORY</label>
              <div className="category-grid">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.name === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      className={`category-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span
                        className="category-color-swatch"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="category-item-name">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
              <span className="form-hint">{selectedCategory.description}</span>
            </div>

            <div className="form-group">
              <label className="form-label">FREQUENCY</label>
              <select
                className="form-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Daily">Daily (7 days/week)</option>
                <option value="5x/week">5 days/week</option>
                <option value="Weekly">Weekly milestone</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">NOTE (OPTIONAL)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief routine intent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={14} strokeWidth={2.5} />
              <span>Create Orbit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
