export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Legend';

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  rank: RankTier;
  xp: number;
  level: number;
  streak: number;
  joinDate: string;
  country: string;
  stats: PlayerStats;
  achievements: Achievement[];
  recentScores: ScoreEntry[];
}

export interface PlayerStats {
  bestCPS: number;
  avgCPS: number;
  bestWPM: number;
  avgWPM: number;
  bestReaction: number;
  avgReaction: number;
  bestAimAccuracy: number;
  totalClicks: number;
  totalTests: number;
  totalPlayTime: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  xpReward: number;
}

export interface ScoreEntry {
  id: string;
  testType: string;
  score: number;
  unit: string;
  accuracy?: number;
  timestamp: string;
  isPB: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  country: string;
  score: number;
  unit: string;
  rankTier: RankTier;
  timestamp: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'click' | 'aim' | 'reaction' | 'keyboard';
  target: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  expiresAt: string;
}

export interface TestResult {
  score: number;
  accuracy?: number;
  duration?: number;
  extras?: Record<string, number | string>;
}

export type TestMode = 
  | 'home'
  | 'cps-test'
  | 'jitter-click'
  | 'butterfly-click'
  | 'drag-click'
  | 'kohi-click'
  | 'badlion-click'
  | 'right-click'
  | 'double-click'
  | 'spacebar-cps'
  | 'stress-click'
  | 'wpm-test'
  | 'key-response'
  | 'wasd-test'
  | 'arrow-speed'
  | 'memory-keys'
  | 'reaction-test'
  | 'f1-reaction'
  | 'spacebar-reaction'
  | 'ping-reaction'
  | 'audio-reaction'
  | 'aim-basic'
  | 'aim-tracking'
  | 'aim-flick'
  | 'aim-sniper'
  | 'aim-headshot'
  | 'aim-precision'
  | 'memory-game'
  | 'pattern-recall'
  | 'focus-test'
  | 'peripheral-vision'
  | 'leaderboard'
  | 'profile'
  | 'settings'
  | 'achievements'
  | 'daily-challenge';
