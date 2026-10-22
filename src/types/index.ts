export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Health / Fitness'
  | 'Knowledge'
  | 'Mindfulness'
  | 'Focus'
  | 'Creativity'
  | 'Other';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory | string;
  frequency: string;
  streak: number;
  bestStreak: number;
  completionRate?: number;
  planetRadius?: number;
  createdAt?: number;
  description?: string;
  color?: string;
  monthlyCompletion?: number;
}

export interface RankedHabit extends Habit {
  rank: number;
  orbitDistance: number;
  monthlyCompletion: number;
  createdAt: number;
  color: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string; // YYYY-MM-DD
  notes?: string;
}

export type CameraMode = 'solar' | 'tactical' | 'focus' | 'free';

export interface TooltipState {
  visible: boolean;
  habit: RankedHabit | null;
  screenX?: number;
  screenY?: number;
}

export interface MoonPhaseDetails {
  phaseName: string;
  illumination: number;
  dayOfCycle: number;
}

export interface SolarSystemSceneOptions {
  onPlanetClick?: (habit: RankedHabit) => void;
  onPlanetHover?: (info: RankedHabit | null) => void;
}

export interface HabitContextType {
  habits: RankedHabit[];
  rawHabits: Habit[];
  habitLogs: HabitLog[];
  selectedPlanetHabit: RankedHabit | null;
  setSelectedPlanetHabit: (habit: RankedHabit | null) => void;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  isHabitCompletedToday: (habitId: string) => boolean;
  toggleHabitToday: (habitId: string) => void;
  addHabit: (habitData: Partial<Habit>) => void;
  deleteHabit: (habitId: string) => void;
  getYearlyHeatmap: (habitId: string) => Array<{ date: string; count: number; level: number; dayOfWeek: number }>;
  focusOnHabitPlanet: (habit: RankedHabit) => void;
  resetCameraToOverview: () => void;
  totalStreakSum: number;
  completedTodayCount: number;
  currentMoon: MoonPhaseDetails;
  todayStr: string;
}
