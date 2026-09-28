import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../three/AudioEngine';

const HabitContext = createContext(null);

// Astronomical Moon Phase Calculator
export function getMoonPhaseDetails(date = new Date()) {
  const d = new Date(date);
  // Known new moon reference: Jan 11, 2024
  const refDate = new Date('2024-01-11T11:57:00Z');
  const synodicMonth = 29.53058867; // average lunar cycle in days
  const diffDays = (d.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  const phaseValue = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth; // 0 to ~29.53

  let phaseName = 'New Moon';
  let icon = '🌑';
  let illumination = 0;

  if (phaseValue < 1.84) {
    phaseName = 'New Moon';
    icon = '🌑';
    illumination = 1;
  } else if (phaseValue < 7.38) {
    phaseName = 'Waxing Crescent';
    icon = '🌒';
    illumination = Math.round((phaseValue / 7.38) * 50);
  } else if (phaseValue < 9.22) {
    phaseName = 'First Quarter';
    icon = '🌓';
    illumination = 50;
  } else if (phaseValue < 14.76) {
    phaseName = 'Waxing Gibbous';
    icon = '🌔';
    illumination = 50 + Math.round(((phaseValue - 7.38) / 7.38) * 50);
  } else if (phaseValue < 16.61) {
    phaseName = 'Full Moon';
    icon = '🌕';
    illumination = 100;
  } else if (phaseValue < 22.15) {
    phaseName = 'Waning Gibbous';
    icon = '🌖';
    illumination = 100 - Math.round(((phaseValue - 14.76) / 7.38) * 50);
  } else if (phaseValue < 23.99) {
    phaseName = 'Last Quarter';
    icon = '🌗';
    illumination = 50;
  } else {
    phaseName = 'Waning Crescent';
    icon = '🌘';
    illumination = Math.max(1, 50 - Math.round(((phaseValue - 22.15) / 7.38) * 50));
  }

  return { phaseName, icon, illumination, dayOfCycle: Math.floor(phaseValue) };
}

// Generate realistic 365-day history for pre-seeded habits
function generateSampleLogs(habitId, streak, completionRate) {
  const logs = [];
  const today = new Date();
  
  // Mark today and previous consecutive days for streak
  for (let i = 0; i < streak; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    logs.push({
      id: `${habitId}_log_${i}`,
      habitId,
      completedAt: d.toISOString().split('T')[0],
      notes: i === 0 ? 'Logged today!' : 'Consistency achieved.'
    });
  }

  // Prepopulate previous days based on completion rate
  for (let i = streak + 1; i < 365; i++) {
    if (Math.random() < (completionRate / 100)) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      logs.push({
        id: `${habitId}_log_${i}`,
        habitId,
        completedAt: d.toISOString().split('T')[0],
        notes: 'Consistent routine entry.'
      });
    }
  }

  return logs;
}

// Natural Earth & Celestial Palette (Neutral, startup-like, Google Earth inspired)
const NATURAL_COLOR_MAP = {
  '#10b981': { color: '#2563eb', atmosphereColor: '#93c5fd' }, // Terran Blue & Cloud White
  '#06b6d4': { color: '#0284c7', atmosphereColor: '#7dd3fc' }, // Atmospheric Azure
  '#a855f7': { color: '#6366f1', atmosphereColor: '#a5b4fc' }, // Celestial Indigo
  '#14b8a6': { color: '#0d9488', atmosphereColor: '#5eead4' }, // Deep Glacial Teal
  '#f43f5e': { color: '#c2410c', atmosphereColor: '#fdba74' }, // Mars Terracotta
  '#f59e0b': { color: '#d97706', atmosphereColor: '#fde68a' }  // Sandstone Ochre
};

function normalizeHabitColor(h) {
  if (NATURAL_COLOR_MAP[h.color]) {
    return {
      ...h,
      color: NATURAL_COLOR_MAP[h.color].color,
      atmosphereColor: NATURAL_COLOR_MAP[h.color].atmosphereColor
    };
  }
  return h;
}

const DEFAULT_HABITS = [
  {
    id: 'habit-1',
    name: 'Morning Running & Cardio',
    category: 'Health',
    planetType: 'terran', // Earth-like with blue oceans, landmass, clouds & atmospheric glow
    frequency: 'Daily',
    orbitDistance: 12,
    baseSpeed: 0.8,
    streak: 18,
    bestStreak: 25,
    completionRate: 88,
    color: '#2563eb', // Earth Blue
    atmosphereColor: '#93c5fd', // Soft atmospheric haze
    planetRadius: 1.4,
    description: '30-minute sunrise outdoor running to boost cardiovascular energy and dopamine.'
  },
  {
    id: 'habit-2',
    name: 'Deep Focus Coding',
    category: 'Focus',
    planetType: 'azure-gas', // Deep azure atmospheric giant
    frequency: 'Daily',
    orbitDistance: 18,
    baseSpeed: 0.65,
    streak: 24,
    bestStreak: 30,
    completionRate: 94,
    color: '#0284c7', // Slate Azure
    atmosphereColor: '#7dd3fc',
    planetRadius: 1.7,
    description: '2 uninterrupted hours building core systems and solving algorithms.'
  },
  {
    id: 'habit-3',
    name: 'Creative Writing & Notes',
    category: 'Creativity',
    planetType: 'purple-ringed', // Indigo celestial world with subtle rings
    frequency: 'Daily',
    orbitDistance: 24,
    baseSpeed: 0.5,
    streak: 9,
    bestStreak: 15,
    completionRate: 72,
    color: '#6366f1', // Refined Indigo Slate
    atmosphereColor: '#a5b4fc',
    planetRadius: 1.5,
    hasRings: true,
    description: 'Daily essay drafting, architecture sketching, and mental model journaling.'
  },
  {
    id: 'habit-4',
    name: 'Mindfulness & Meditation',
    category: 'Mindfulness',
    planetType: 'opal-ice', // Crystalline glacial oceanic world
    frequency: 'Daily',
    orbitDistance: 30,
    baseSpeed: 0.42,
    streak: 14,
    bestStreak: 21,
    completionRate: 82,
    color: '#0d9488', // Glacial Teal
    atmosphereColor: '#5eead4',
    planetRadius: 1.3,
    description: '15-minute guided breathwork and meditation practice at dusk.'
  },
  {
    id: 'habit-5',
    name: 'Strength & Core Workout',
    category: 'Fitness',
    planetType: 'crimson-ember', // Mars-like volcanic terracotta world
    frequency: 'Daily',
    orbitDistance: 36,
    baseSpeed: 0.35,
    streak: 7,
    bestStreak: 19,
    completionRate: 68,
    color: '#c2410c', // Mars Terracotta
    atmosphereColor: '#fdba74',
    planetRadius: 1.4,
    description: 'High intensity resistance training and core stability regimen.'
  },
  {
    id: 'habit-6',
    name: 'Read 30 Mins Non-Fiction',
    category: 'Knowledge',
    planetType: 'saturn-gold', // Warm sandstone ochre giant with natural dust rings
    frequency: 'Daily',
    orbitDistance: 43,
    baseSpeed: 0.28,
    streak: 31,
    bestStreak: 45,
    completionRate: 96,
    color: '#d97706', // Sandstone Ochre
    atmosphereColor: '#fde68a',
    planetRadius: 1.9,
    hasRings: true,
    description: 'Reading high-signal books in computer science, philosophy, and history.'
  }
];

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('orbitboard_habits_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(normalizeHabitColor);
      }
      return DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });

  const [habitLogs, setHabitLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('orbitboard_logs_v2');
      if (saved) return JSON.parse(saved);
      // Generate default logs
      const initialLogs = [];
      DEFAULT_HABITS.forEach(h => {
        initialLogs.push(...generateSampleLogs(h.id, h.streak, h.completionRate));
      });
      return initialLogs;
    } catch {
      return [];
    }
  });

  const [selectedPlanetHabit, setSelectedPlanetHabit] = useState(null);
  const [cameraMode, setCameraMode] = useState('free'); // 'free' | 'solar' | 'tactical' | 'focus'
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'analytics' | 'ai' | 'feed'

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('orbitboard_habits_v2', JSON.stringify(habits));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem('orbitboard_logs_v2', JSON.stringify(habitLogs));
    } catch (e) {
      console.warn('Logs save error:', e);
    }
  }, [habitLogs]);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Check if a habit is completed today
  const isHabitCompletedToday = (habitId) => {
    return habitLogs.some(log => log.habitId === habitId && log.completedAt === todayStr);
  };

  // Toggle completion for today
  const toggleHabitToday = (habitId) => {
    const isCompleted = isHabitCompletedToday(habitId);
    if (!isCompleted) {
      // Mark Complete
      const newLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        habitId,
        completedAt: todayStr,
        notes: 'Completed today via Quick Dock'
      };
      setHabitLogs(prev => [newLog, ...prev]);

      // Update habit streak & completion rate
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const newStreak = h.streak + 1;
          const best = Math.max(newStreak, h.bestStreak || newStreak);
          return {
            ...h,
            streak: newStreak,
            bestStreak: best,
            completionRate: Math.min(100, h.completionRate + 1)
          };
        }
        return h;
      }));

      // Audio feedback & Confetti
      audioEngine.playCompletionChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#38bdf8', '#fbbf24', '#10b981', '#a855f7']
      });
    } else {
      // Unmark Complete
      setHabitLogs(prev => prev.filter(log => !(log.habitId === habitId && log.completedAt === todayStr)));
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            streak: Math.max(0, h.streak - 1),
            completionRate: Math.max(10, h.completionRate - 1)
          };
        }
        return h;
      }));
    }
  };

  // Add new Habit
  const addHabit = (habitData) => {
    const nextDistance = habits.length > 0 ? habits[habits.length - 1].orbitDistance + 6 : 14;
    const newHabit = {
      id: `habit-${Date.now()}`,
      streak: 1,
      bestStreak: 1,
      completionRate: 50,
      orbitDistance: nextDistance,
      baseSpeed: Math.max(0.2, 0.9 - habits.length * 0.08),
      planetRadius: 1.3,
      ...habitData
    };

    setHabits(prev => [...prev, newHabit]);
    
    // Add initial log for today
    const initialLog = {
      id: `log_${Date.now()}`,
      habitId: newHabit.id,
      completedAt: todayStr,
      notes: 'Creation log.'
    };
    setHabitLogs(prev => [initialLog, ...prev]);

    audioEngine.playCompletionChime();
  };

  // Delete Habit
  const deleteHabit = (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setHabitLogs(prev => prev.filter(log => log.habitId !== habitId));
    if (selectedPlanetHabit?.id === habitId) {
      setSelectedPlanetHabit(null);
    }
  };

  // Get Yearly Heatmap Data for a Habit
  const getYearlyHeatmap = (habitId) => {
    const datesMap = {};
    habitLogs
      .filter(l => l.habitId === habitId)
      .forEach(l => {
        datesMap[l.completedAt] = (datesMap[l.completedAt] || 0) + 1;
      });

    // Generate past 365 days
    const days = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const count = datesMap[iso] || 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count >= 2) level = 2;
      days.push({ date: iso, count, level, dayOfWeek: d.getDay() });
    }
    return days;
  };

  // Select and focus on a planet
  const focusOnHabitPlanet = (habit) => {
    setSelectedPlanetHabit(habit);
    audioEngine.playPlanetZoomSound();
    setCameraMode('focus');
  };

  const resetCameraToOverview = () => {
    setSelectedPlanetHabit(null);
    setCameraMode('solar');
  };

  const totalStreakSum = habits.reduce((acc, h) => acc + h.streak, 0);
  const completedTodayCount = habits.filter(h => isHabitCompletedToday(h.id)).length;
  const currentMoon = getMoonPhaseDetails();

  return (
    <HabitContext.Provider
      value={{
        habits,
        habitLogs,
        selectedPlanetHabit,
        setSelectedPlanetHabit,
        cameraMode,
        setCameraMode,
        activeModal,
        setActiveModal,
        isHabitCompletedToday,
        toggleHabitToday,
        addHabit,
        deleteHabit,
        getYearlyHeatmap,
        focusOnHabitPlanet,
        resetCameraToOverview,
        totalStreakSum,
        completedTodayCount,
        currentMoon,
        todayStr
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
