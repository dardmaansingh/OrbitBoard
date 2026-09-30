/**
 * Pure ranking & orbital mechanics utility for OrbitBoard
 * Implements Phase 2 specifications & Design tokens.
 */

export const MIN_ORBIT_RADIUS = 12.0;
export const MAX_ORBIT_RADIUS = 44.0;

// Canonical Category Pigments (desaturated, drawn from real planetary pigments - NO purple)
export const CATEGORY_COLORS = {
  'Health': '#C1583A',        // Mars rust
  'Fitness': '#C1583A',       // Mars rust
  'Health / Fitness': '#C1583A',
  'Knowledge': '#D4A55A',     // Saturn ochre
  'Mindfulness': '#4E9F98',   // Ocean teal
  'Focus': '#4A6FA5',         // Neptune blue, muted
  'Creativity': '#B5667A',    // Dusty rose
  'Other': '#B08D6E'          // Jupiter sand
};

export function getCategoryColor(category) {
  if (!category) return CATEGORY_COLORS['Other'];
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

/**
 * Calculate this month's completion rate for a habit based on its completion logs.
 * Returns an integer between 0 and 100.
 */
export function calculateMonthlyCompletion(habitId, habitLogs = [], date = new Date(), fallbackRate = 50) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
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

/**
 * Rank habits according to Phase 2 rules:
 * 1. current streak, descending
 * 2. this month's completion %, descending
 * 3. longest streak, descending
 * 4. oldest habit first (createdAt ascending)
 * 
 * Habits with a 0 streak naturally sort to the end (outermost orbits).
 * Rank i gets an orbit radius spread evenly between MIN_ORBIT_RADIUS and MAX_ORBIT_RADIUS.
 */
export function rankHabits(habits = [], habitLogs = [], date = new Date()) {
  if (!habits || habits.length === 0) {
    return [];
  }

  // Enrich habits with monthly completion and normalized timestamps
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

  // Sort according to Phase 2 criteria
  enriched.sort((a, b) => {
    // 1. Current streak, descending
    if (b.streak !== a.streak) {
      return b.streak - a.streak;
    }

    // 2. This month's completion %, descending
    if (b.monthlyCompletion !== a.monthlyCompletion) {
      return b.monthlyCompletion - a.monthlyCompletion;
    }

    // 3. Longest streak, descending
    if (b.bestStreak !== a.bestStreak) {
      return b.bestStreak - a.bestStreak;
    }

    // 4. Oldest habit first (smaller timestamp = older)
    if (a.createdAt !== b.createdAt) {
      return a.createdAt - b.createdAt;
    }

    // Deterministic tie-breaker
    return String(a.id).localeCompare(String(b.id));
  });

  const count = enriched.length;

  return enriched.map((habit, index) => {
    const rank = index + 1;
    let targetRadius;

    if (count === 1) {
      // Single habit edge case
      targetRadius = 16.0;
    } else {
      // Spread evenly between MIN_ORBIT_RADIUS and MAX_ORBIT_RADIUS
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

/**
 * Keplerian angular velocity calculation (speed ∝ r^-1.5)
 * Inner planets move visibly faster.
 */
export function getKeplerianSpeed(radius) {
  const safeRadius = Math.max(8.0, radius || MIN_ORBIT_RADIUS);
  // Scale constant so rank 1 takes ~18-20s per full orbit
  return 18.0 * Math.pow(safeRadius, -1.5);
}
