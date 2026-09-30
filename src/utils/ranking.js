

export const MIN_ORBIT_RADIUS = 12.0;
export const MAX_ORBIT_RADIUS = 44.0;

export const CATEGORY_COLORS = {
  'Health': '#C1583A',        
  'Fitness': '#C1583A',       
  'Health / Fitness': '#C1583A',
  'Knowledge': '#D4A55A',     
  'Mindfulness': '#4E9F98',   
  'Focus': '#4A6FA5',         
  'Creativity': '#B5667A',    
  'Other': '#B08D6E'          
};

export function getCategoryColor(category) {
  if (!category) return CATEGORY_COLORS['Other'];
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

export function calculateMonthlyCompletion(habitId, habitLogs = [], date = new Date(), fallbackRate = 50) {
  const year = date.getFullYear();
  const month = date.getMonth(); 
  const dayOfMonth = Math.max(1, date.getDate());

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const loggedDaysInMonth = new Set(
    habitLogs
      .filter(l => l.habitId === habitId && l.completedAt && l.completedAt.startsWith(monthPrefix))
      .map(l => l.completedAt)
  );

  if (loggedDaysInMonth.size === 0 && fallbackRate != null) {
    return Math.min(100, Math.max(0, Math.round(fallbackRate)));
  }

  const rate = Math.round((loggedDaysInMonth.size / dayOfMonth) * 100);
  return Math.min(100, Math.max(0, rate));
}

export function rankHabits(habits = [], habitLogs = [], date = new Date()) {
  if (!habits || habits.length === 0) {
    return [];
  }

  const enriched = habits.map((h, idx) => {
    const streak = Math.max(0, Number(h.streak) || 0);
    const bestStreak = Math.max(streak, Number(h.bestStreak) || streak);
    const monthlyCompletion = calculateMonthlyCompletion(h.id, habitLogs, date, h.completionRate);
    const createdAt = h.createdAt ? Number(h.createdAt) : (1700000000000 + idx * 86400000);
    const categoryColor = getCategoryColor(h.category);

    return {
      ...h,
      streak,
      bestStreak,
      monthlyCompletion,
      createdAt,
      color: categoryColor
    };
  });

  enriched.sort((a, b) => {
    
    if (b.streak !== a.streak) {
      return b.streak - a.streak;
    }

    if (b.monthlyCompletion !== a.monthlyCompletion) {
      return b.monthlyCompletion - a.monthlyCompletion;
    }

    if (b.bestStreak !== a.bestStreak) {
      return b.bestStreak - a.bestStreak;
    }

    if (a.createdAt !== b.createdAt) {
      return a.createdAt - b.createdAt;
    }

    return String(a.id).localeCompare(String(b.id));
  });

  const count = enriched.length;

  return enriched.map((habit, index) => {
    const rank = index + 1;
    let targetRadius;

    if (count === 1) {
      
      targetRadius = 16.0;
    } else {
      
      const fraction = index / (count - 1);
      targetRadius = MIN_ORBIT_RADIUS + fraction * (MAX_ORBIT_RADIUS - MIN_ORBIT_RADIUS);
    }

    return {
      ...habit,
      rank,
      orbitDistance: targetRadius
    };
  });
}

export function getKeplerianSpeed(radius) {
  const safeRadius = Math.max(8.0, radius || MIN_ORBIT_RADIUS);
  
  return 18.0 * Math.pow(safeRadius, -1.5);
}
