import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../three/AudioEngine';
import { rankHabits, getCategoryColor, calculateMonthlyCompletion } from '../utils/ranking';

const HabitContext = createContext(null);

// Astronomical Moon Phase Calculator
export function getMoonPhaseDetails(date = new Date()) {
  const d = new Date(date);
  const refDate = new Date('2024-01-11T11:57:00Z');
  const synodicMonth = 29.53058867; // Average lunar synodic month in days
  const diffDays = (d.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24);
  const phaseValue = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;

  let phaseName = 'New Moon';
  let illumination = 0;

  if (phaseValue < 1.84) {
    phaseName = 'New Moon';
    illumination = 1;
  } else if (phaseValue < 7.38) {
    phaseName = 'Waxing Crescent';
    illumination = Math.round((phaseValue / 7.38) * 50);
  } else if (phaseValue < 9.22) {
    phaseName = 'First Quarter';
    illumination = 50;
  } else if (phaseValue < 14.76) {
    phaseName = 'Waxing Gibbous';
    illumination = 50 + Math.round(((phaseValue - 7.38) / 7.38) * 50);
  } else if (phaseValue < 16.61) {
    phaseName = 'Full Moon';
    illumination = 100;
  } else if (phaseValue < 22.15) {
    phaseName = 'Waning Gibbous';
    illumination = 100 - Math.round(((phaseValue - 14.76) / 7.38) * 50);
  } else if (phaseValue < 23.99) {
    phaseName = 'Last Quarter';
    illumination = 50;
  } else {
    phaseName = 'Waning Crescent';
    illumination = Math.max(1, 50 - Math.round(((phaseValue - 22.15) / 7.38) * 50));
  }

  return { phaseName, illumination, dayOfCycle: Math.floor(phaseValue) };
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
      notes: i === 0 ? 'Logged today' : 'Consistent entry'
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
        notes: 'Consistent routine entry'
      });
    }
  }

  return logs;
}

// Default Seed Habits with Authentic Desaturated Pigments (NO purple)
const DEFAULT_HABITS = [
  {
    id: 'habit-1',
    name: 'Morning Running & Cardio',
    category: 'Health',
    frequency: 'Daily',
    streak: 18,
    bestStreak: 25,
    completionRate: 88,
    planetRadius: 1.4,
    createdAt: 1700000001000,
    description: '30-minute sunrise outdoor running to boost cardiovascular energy.'
  },
  {
    id: 'habit-2',
    name: 'Deep Focus Coding',
    category: 'Focus',
    frequency: 'Daily',
    streak: 24,
    bestStreak: 30,
    completionRate: 94,
    planetRadius: 1.7,
    createdAt: 1700000002000,
    description: '2 uninterrupted hours building core systems and solving algorithms.'
  },
  {
    id: 'habit-3',
    name: 'Creative Writing & Notes',
    category: 'Creativity',
    frequency: 'Daily',
    streak: 9,
    bestStreak: 15,
    completionRate: 72,
    planetRadius: 1.5,
    hasRings: true,
    createdAt: 1700000003000,
    description: 'Daily essay drafting, architecture sketching, and mental model journaling.'
  },
  {
    id: 'habit-4',
    name: 'Mindfulness & Meditation',
    category: 'Mindfulness',
    frequency: 'Daily',
    streak: 14,
    bestStreak: 21,
    completionRate: 82,
    planetRadius: 1.3,
    createdAt: 1700000004000,
    description: '15-minute guided breathwork and meditation practice at dusk.'
  },
  {
    id: 'habit-5',
    name: 'Strength & Core Workout',
    category: 'Fitness',
    frequency: 'Daily',
    streak: 7,
    bestStreak: 19,
    completionRate: 68,
    planetRadius: 1.4,
    createdAt: 1700000005000,
    description: 'High intensity resistance training and core stability regimen.'
  },
  {
    id: 'habit-6',
    name: 'Read 30 Mins Non-Fiction',
    category: 'Knowledge',
    frequency: 'Daily',
    streak: 31,
    bestStreak: 45,
    completionRate: 96,
    planetRadius: 1.9,
    hasRings: true,
    createdAt: 1700000006000,
    description: 'Reading high-signal books in computer science, philosophy, and history.'
  }
];

export function HabitProvider({ children }) {
  const [rawHabits, setRawHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('orbitboard_habits_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(h => ({
          ...h,
          color: getCategoryColor(h.category)
        }));
      }
      return DEFAULT_HABITS.map(h => ({
        ...h,
        color: getCategoryColor(h.category)
      }));
    } catch {
      return DEFAULT_HABITS.map(h => ({
        ...h,
        color: getCategoryColor(h.category)
      }));
    }
  });

  const [habitLogs, setHabitLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('orbitboard_logs_v3');
      if (saved) return JSON.parse(saved);

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
  const [cameraMode, setCameraMode] = useState('free');
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'analytics'

  // Persist habits & logs
  useEffect(() => {
    try {
      localStorage.setItem('orbitboard_habits_v3', JSON.stringify(rawHabits));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }, [rawHabits]);

  useEffect(() => {
    try {
      localStorage.setItem('orbitboard_logs_v3', JSON.stringify(habitLogs));
    } catch (e) {
      console.warn('Logs save error:', e);
    }
  }, [habitLogs]);

  // Today's ISO date string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute Ranked Habits
  const rankedHabits = useMemo(() => {
    return rankHabits(rawHabits, habitLogs, new Date());
  }, [rawHabits, habitLogs]);

  // Keep selected habit in sync with ranked data
  const currentSelectedHabit = useMemo(() => {
    if (!selectedPlanetHabit) return null;
    return rankedHabits.find(h => h.id === selectedPlanetHabit.id) || selectedPlanetHabit;
  }, [selectedPlanetHabit, rankedHabits]);

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
        notes: 'Logged today'
      };
      setHabitLogs(prev => [newLog, ...prev]);

      setRawHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const newStreak = (h.streak || 0) + 1;
          const best = Math.max(newStreak, h.bestStreak || newStreak);
          return {
            ...h,
            streak: newStreak,
            bestStreak: best,
            completionRate: Math.min(100, (h.completionRate || 50) + 1)
          };
        }
        return h;
      }));

      audioEngine.playCompletionChime();
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.88 },
        colors: ['#F2A33A', '#E8E4DC', '#7A4E16']
      });
    } else {
      // Unmark Complete
      setHabitLogs(prev => prev.filter(log => !(log.habitId === habitId && log.completedAt === todayStr)));
      setRawHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            streak: Math.max(0, (h.streak || 1) - 1),
            completionRate: Math.max(10, (h.completionRate || 50) - 1)
          };
        }
        return h;
      }));
    }
  };

  // Add new Habit
  const addHabit = (habitData) => {
    const newHabit = {
      id: `habit-${Date.now()}`,
      streak: 1,
      bestStreak: 1,
      completionRate: 50,
      createdAt: Date.now(),
      color: getCategoryColor(habitData.category),
      ...habitData
    };

    setRawHabits(prev => [...prev, newHabit]);

    const initialLog = {
      id: `log_${Date.now()}`,
      habitId: newHabit.id,
      completedAt: todayStr,
      notes: 'Initial creation entry'
    };
    setHabitLogs(prev => [initialLog, ...prev]);

    audioEngine.playCompletionChime();
  };

  // Delete Habit
  const deleteHabit = (habitId) => {
    setRawHabits(prev => prev.filter(h => h.id !== habitId));
    setHabitLogs(prev => prev.filter(log => log.habitId !== habitId));
    if (selectedPlanetHabit?.id === habitId) {
      setSelectedPlanetHabit(null);
    }
  };

  // Heatmap Data ( past 365 days )
  const getYearlyHeatmap = (habitId) => {
    const datesMap = {};
    habitLogs
      .filter(l => l.habitId === habitId)
      .forEach(l => {
        datesMap[l.completedAt] = (datesMap[l.completedAt] || 0) + 1;
      });

    const days = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const count = datesMap[iso] || 0;
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;
      days.push({ date: iso, count, level, dayOfWeek: d.getDay() });
    }
    return days;
  };

  const focusOnHabitPlanet = (habit) => {
    setSelectedPlanetHabit(habit);
    audioEngine.playPlanetZoomSound();
    setCameraMode('focus');
  };

  const resetCameraToOverview = () => {
    setSelectedPlanetHabit(null);
    setCameraMode('solar');
  };

  const totalStreakSum = rankedHabits.reduce((acc, h) => acc + (h.streak || 0), 0);
  const completedTodayCount = rankedHabits.filter(h => isHabitCompletedToday(h.id)).length;
  const currentMoon = getMoonPhaseDetails();

  return (
    <HabitContext.Provider
      value={{
        habits: rankedHabits,
        rawHabits,
        habitLogs,
        selectedPlanetHabit: currentSelectedHabit,
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
