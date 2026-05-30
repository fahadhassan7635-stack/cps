import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';

type Period = 'global' | 'daily' | 'weekly' | 'monthly';
type Category = 'cps' | 'reaction' | 'wpm' | 'aim';

const RANKS: Record<string, { color: string; emoji: string }> = {
  Bronze: { color: '#cd7f32', emoji: '🥉' },
  Silver: { color: '#c0c0c0', emoji: '🥈' },
  Gold: { color: '#ffd700', emoji: '🥇' },
  Platinum: { color: '#00ffff', emoji: '💎' },
  Diamond: { color: '#00bfff', emoji: '💠' },
  Master: { color: '#b400ff', emoji: '⚡' },
  Grandmaster: { color: '#ff6b00', emoji: '🔥' },
  Legend: { color: '#ff0080', emoji: '👑' },
};

const FLAG: Record<string, string> = {
  US: '🇺🇸', KR: '🇰🇷', JP: '🇯🇵', DE: '🇩🇪', GB: '🇬🇧', BR: '🇧🇷', CA: '🇨🇦', AU: '🇦🇺', FR: '🇫🇷', CN: '🇨🇳',
};

function generateLeaderboard(category: Category, period: Period) {
  const names = ['NightOwl99', 'SpeedDemon', 'ClickMaster', 'ProClicker', 'FastFingers',
    'AimGod', 'ReflexKing', 'TypeMaster', 'SwiftHands', 'NitroClick',
    'GhostClick', 'LightningLee', 'QuantumFist', 'HyperFlex', 'CyberClick'];
  const countries = ['KR', 'US', 'JP', 'DE', 'GB', 'BR', 'CA', 'AU', 'FR', 'CN'];
  const ranks = ['Legend', 'Grandmaster', 'Grandmaster', 'Master', 'Master', 'Diamond', 'Diamond', 'Platinum', 'Gold', 'Gold', 'Gold', 'Silver', 'Silver', 'Bronze', 'Bronze'];
  
  const scoreRanges: Record<Category, { min: number; max: number; unit: string }> = {
    cps: { min: 14, max: 30, unit: 'CPS' },
    reaction: { min: 100, max: 280, unit: 'ms' },
    wpm: { min: 80, max: 200, unit: 'WPM' },
    aim: { min: 78, max: 99, unit: '%' },
  };

  const { min, max, unit } = scoreRanges[category];
  const seed = period === 'daily' ? 0.1 : period === 'weekly' ? 0.2 : period === 'monthly' ? 0.3 : 0;

  return names.map((name, i) => {
    const score = category === 'reaction'
      ? Math.round(min + (max - min) * (i / names.length) + seed * 10)
      : parseFloat((max - (max - min) * (i / names.length) - seed * 2).toFixed(1));

    return { rank: i + 1, name, country: countries[i % countries.length], score, unit, rankTier: ranks[i], xp: Math.floor((15 - i) * 800 + Math.random() * 500) };
  });
}

export const LeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState<Period>('global');
  const [category, setCategory] = useState<Category>('cps');

  const data = generateLeaderboard(category, period);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black font-orbitron gradient-text-cyan mb-1">🏆 Leaderboards</h1>
        <p className="text-sm text-gray-500">Global competitive rankings</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {(['global', 'daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: period === p ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${period === p ? '#00f5ff' : 'rgba(255,255,255,0.08)'}`,
                color: period === p ? '#00f5ff' : '#64748b',
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {([
            { key: 'cps', label: '⚡ CPS' },
            { key: 'reaction', label: '⚡ Reaction' },
            { key: 'wpm', label: '⌨️ WPM' },
            { key: 'aim', label: '🎯 Aim' },
          ] as { key: Category; label: string }[]).map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: category === c.key ? 'rgba(180,0,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${category === c.key ? '#b400ff' : 'rgba(255,255,255,0.08)'}`,
                color: category === c.key ? '#b400ff' : '#64748b',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {[data[1], data[0], data[2]].map((entry, i) => {
          const pos = i === 1 ? 1 : i === 0 ? 2 : 3;
          const heights = ['h-28', 'h-36', 'h-24'];
          const rankInfo = RANKS[entry.rankTier] || { color: '#ffffff', emoji: '🎮' };
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${heights[i]} rounded-2xl flex flex-col items-center justify-end pb-4 relative overflow-hidden`}
              style={{
                background: pos === 1 ? 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,107,0,0.05))' 
                  : pos === 2 ? 'linear-gradient(135deg, rgba(192,192,192,0.1), rgba(100,116,139,0.05))'
                  : 'linear-gradient(135deg, rgba(205,127,50,0.1), rgba(139,90,50,0.05))',
                border: `1px solid ${pos === 1 ? 'rgba(255,215,0,0.3)' : pos === 2 ? 'rgba(192,192,192,0.2)' : 'rgba(205,127,50,0.2)'}`,
              }}
            >
              <div className="text-2xl mb-1">{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</div>
              <div className="text-sm font-bold text-white">{entry.name}</div>
              <div className="text-xs text-gray-400">{FLAG[entry.country]}</div>
              <div className="text-sm font-black font-orbitron mt-1" style={{ color: rankInfo.color }}>
                {entry.score} {entry.unit}
              </div>
              <div className="text-xs" style={{ color: rankInfo.color }}>{entry.rankTier}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Table */}
      <GlassCard className="overflow-hidden" animate={false}>
        <div className="px-4 py-3 border-b flex text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-10">#</div>
          <div className="flex-1">Player</div>
          <div className="hidden sm:block w-24 text-center">Rank</div>
          <div className="w-28 text-right">Score</div>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {data.map((entry, idx) => {
            const rankInfo = RANKS[entry.rankTier] || { color: '#ffffff', emoji: '🎮' };
            const isTop3 = entry.rank <= 3;
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center px-4 py-3 hover:bg-white/2 transition-colors"
              >
                <div className="w-10">
                  {isTop3 ? (
                    <span className="text-lg">{['🥇', '🥈', '🥉'][entry.rank - 1]}</span>
                  ) : (
                    <span className="text-sm text-gray-500">{entry.rank}</span>
                  )}
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `${rankInfo.color}20`, border: `1px solid ${rankInfo.color}40` }}>
                    {rankInfo.emoji}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{entry.name}</div>
                    <div className="text-xs text-gray-500">{FLAG[entry.country]} {entry.xp.toLocaleString()} XP</div>
                  </div>
                </div>
                <div className="hidden sm:flex w-24 justify-center">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${rankInfo.color}20`, color: rankInfo.color }}>
                    {entry.rankTier}
                  </span>
                </div>
                <div className="w-28 text-right">
                  <span className="text-sm font-black font-orbitron" style={{ color: isTop3 ? rankInfo.color : '#00f5ff' }}>
                    {entry.score}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">{entry.unit}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Rank System */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-4">🎮 Rank System</h3>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(RANKS).map(([name, { color, emoji }]) => (
            <div key={name} className="text-center p-3 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm font-bold" style={{ color }}>{name}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
