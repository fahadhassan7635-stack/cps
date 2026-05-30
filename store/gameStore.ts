import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestMode, PlayerProfile, Achievement, DailyChallenge } from '../types';

interface HistoryEntry {
  testType: string;
  score: number;
  unit: string;
  accuracy?: number;
  timestamp: string;
}

interface GameState {
  currentMode: TestMode;
  setMode: (mode: TestMode) => void;
  
  profile: PlayerProfile;
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  
  history: HistoryEntry[];
  addScore: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  
  personalBests: Record<string, number>;
  updatePB: (testType: string, score: number) => void;
  
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  
  dailyChallenges: DailyChallenge[];
  completeDailyChallenge: (id: string) => void;
  
  xp: number;
  addXP: (amount: number) => void;
  
  streak: number;
  settings: {
    colorBlindMode: boolean;
    uiScale: number;
    soundEnabled: boolean;
    showFPS: boolean;
    theme: 'cyan' | 'purple' | 'green';
  };
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'first-click', name: 'First Click', description: 'Complete your first click test', icon: '🖱️', unlocked: false, progress: 0, maxProgress: 1, rarity: 'Common', xpReward: 50 },
  { id: 'cps-10', name: '10 CPS Club', description: 'Reach 10 clicks per second', icon: '⚡', unlocked: false, progress: 0, maxProgress: 10, rarity: 'Common', xpReward: 100 },
  { id: 'cps-15', name: '15 CPS Club', description: 'Reach 15 clicks per second', icon: '🔥', unlocked: false, progress: 0, maxProgress: 15, rarity: 'Rare', xpReward: 200 },
  { id: 'cps-20', name: '20 CPS Club', description: 'Reach 20 clicks per second', icon: '💎', unlocked: false, progress: 0, maxProgress: 20, rarity: 'Epic', xpReward: 500 },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Get 25+ CPS in any test', icon: '😈', unlocked: false, progress: 0, maxProgress: 25, rarity: 'Legendary', xpReward: 1000 },
  { id: 'aim-master', name: 'Aim Master', description: 'Get 95%+ accuracy in aim trainer', icon: '🎯', unlocked: false, progress: 0, maxProgress: 95, rarity: 'Epic', xpReward: 500 },
  { id: 'keyboard-warrior', name: 'Keyboard Warrior', description: 'Type at 100+ WPM', icon: '⌨️', unlocked: false, progress: 0, maxProgress: 100, rarity: 'Rare', xpReward: 300 },
  { id: 'reaction-god', name: 'Reaction God', description: 'Sub 150ms reaction time', icon: '⚡', unlocked: false, progress: 0, maxProgress: 150, rarity: 'Epic', xpReward: 500 },
  { id: 'legend-rank', name: 'Legend Rank', description: 'Reach Legend rank', icon: '👑', unlocked: false, progress: 0, maxProgress: 10000, rarity: 'Legendary', xpReward: 5000 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day login streak', icon: '🔥', unlocked: false, progress: 0, maxProgress: 7, rarity: 'Rare', xpReward: 250 },
  { id: 'tests-100', name: 'Centurion', description: 'Complete 100 tests', icon: '💯', unlocked: false, progress: 0, maxProgress: 100, rarity: 'Common', xpReward: 200 },
  { id: 'accuracy-perfect', name: 'Perfectionist', description: '100% accuracy in aim test', icon: '✨', unlocked: false, progress: 0, maxProgress: 100, rarity: 'Legendary', xpReward: 2000 },
];

const defaultDailyChallenges: DailyChallenge[] = [
  { id: 'dc-1', title: 'Speed Clicker', description: 'Get 12+ CPS in the 10-second CPS test', type: 'click', target: 12, unit: 'CPS', xpReward: 150, completed: false, progress: 0, expiresAt: new Date(Date.now() + 86400000).toISOString() },
  { id: 'dc-2', title: 'Quick Fingers', description: 'Type at 60+ WPM in the typing test', type: 'keyboard', target: 60, unit: 'WPM', xpReward: 150, completed: false, progress: 0, expiresAt: new Date(Date.now() + 86400000).toISOString() },
  { id: 'dc-3', title: 'Lightning Reflexes', description: 'Sub 200ms reaction time', type: 'reaction', target: 200, unit: 'ms', xpReward: 200, completed: false, progress: 0, expiresAt: new Date(Date.now() + 86400000).toISOString() },
  { id: 'dc-4', title: 'Sharpshooter', description: '90%+ accuracy in aim trainer', type: 'aim', target: 90, unit: '%', xpReward: 200, completed: false, progress: 0, expiresAt: new Date(Date.now() + 86400000).toISOString() },
];

const defaultProfile: PlayerProfile = {
  id: 'player-1',
  username: 'GamerPro',
  avatar: '🎮',
  rank: 'Silver',
  xp: 1250,
  level: 8,
  streak: 3,
  joinDate: new Date().toISOString(),
  country: 'US',
  stats: {
    bestCPS: 0,
    avgCPS: 0,
    bestWPM: 0,
    avgWPM: 0,
    bestReaction: 9999,
    avgReaction: 0,
    bestAimAccuracy: 0,
    totalClicks: 0,
    totalTests: 0,
    totalPlayTime: 0,
  },
  achievements: [],
  recentScores: [],
};

function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getRankFromXP(xp: number): PlayerProfile['rank'] {
  if (xp >= 10000) return 'Legend';
  if (xp >= 7000) return 'Grandmaster';
  if (xp >= 5000) return 'Master';
  if (xp >= 3500) return 'Diamond';
  if (xp >= 2000) return 'Platinum';
  if (xp >= 1000) return 'Gold';
  if (xp >= 400) return 'Silver';
  return 'Bronze';
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentMode: 'home',
      setMode: (mode) => set({ currentMode: mode }),

      profile: defaultProfile,
      updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
      })),

      history: [],
      addScore: (entry) => {
        const timestamp = new Date().toISOString();
        const newEntry: HistoryEntry = { ...entry, timestamp };
        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 200),
          profile: {
            ...state.profile,
            stats: {
              ...state.profile.stats,
              totalTests: state.profile.stats.totalTests + 1,
            }
          }
        }));
      },

      personalBests: {},
      updatePB: (testType, score) => {
        const current = get().personalBests[testType];
        if (!current || score > current) {
          set((state) => ({
            personalBests: { ...state.personalBests, [testType]: score }
          }));
          return;
        }
      },

      achievements: defaultAchievements,
      unlockAchievement: (id) => set((state) => ({
        achievements: state.achievements.map(a =>
          a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        )
      })),

      dailyChallenges: defaultDailyChallenges,
      completeDailyChallenge: (id) => set((state) => ({
        dailyChallenges: state.dailyChallenges.map(c =>
          c.id === id ? { ...c, completed: true } : c
        )
      })),

      xp: 1250,
      addXP: (amount) => set((state) => {
        const newXP = state.xp + amount;
        return {
          xp: newXP,
          profile: {
            ...state.profile,
            xp: newXP,
            level: getLevelFromXP(newXP),
            rank: getRankFromXP(newXP),
          }
        };
      }),

      streak: 3,
      settings: {
        colorBlindMode: false,
        uiScale: 1,
        soundEnabled: true,
        showFPS: false,
        theme: 'cyan',
      },
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),

      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'cps-test-tools-store',
      partialize: (state) => ({
        history: state.history,
        personalBests: state.personalBests,
        achievements: state.achievements,
        xp: state.xp,
        streak: state.streak,
        profile: state.profile,
        settings: state.settings,
        dailyChallenges: state.dailyChallenges,
      }),
    }
  )
);
