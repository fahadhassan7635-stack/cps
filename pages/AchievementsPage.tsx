import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { useGameStore } from '../store/gameStore';

export const AchievementsPage: React.FC = () => {
  const { achievements } = useGameStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary'>('all');

  const rarityColors: Record<string, string> = {
    Common: '#94a3b8',
    Rare: '#00f5ff',
    Epic: '#b400ff',
    Legendary: '#ffd700',
  };

  const filtered = achievements.filter(a => {
    const statusMatch = filter === 'all' || (filter === 'unlocked' ? a.unlocked : !a.unlocked);
    const rarityMatch = rarityFilter === 'all' || a.rarity === rarityFilter;
    return statusMatch && rarityMatch;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXPFromAchievements = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black font-orbitron gradient-text-gaming mb-1">🏆 Achievements</h1>
        <p className="text-sm text-gray-500">Unlock achievements to earn XP and showcase your skills</p>
      </motion.div>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center" animate={false}>
          <div className="text-3xl mb-1">🏅</div>
          <div className="text-2xl font-black font-orbitron text-cyan-400">{unlockedCount}</div>
          <div className="text-xs text-gray-500">Unlocked / {achievements.length}</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" animate={false}>
          <div className="text-3xl mb-1">✨</div>
          <div className="text-2xl font-black font-orbitron text-purple-400">{totalXPFromAchievements.toLocaleString()}</div>
          <div className="text-xs text-gray-500">XP from Achievements</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" animate={false}>
          <div className="text-3xl mb-1">📊</div>
          <div className="text-2xl font-black font-orbitron text-green-400">{Math.round(unlockedCount / achievements.length * 100)}%</div>
          <div className="text-xs text-gray-500">Completion Rate</div>
        </GlassCard>
      </div>

      {/* Overall Progress */}
      <GlassCard className="p-4" animate={false}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-300">Overall Progress</span>
          <span className="text-sm text-cyan-400">{unlockedCount}/{achievements.length}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full shimmer"
            style={{ background: 'linear-gradient(90deg, #00f5ff, #b400ff, #ff0080)' }}
            animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </GlassCard>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f ? '#00f5ff' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f ? '#00f5ff' : '#64748b',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'Common', 'Rare', 'Epic', 'Legendary'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: rarityFilter === r ? `${r !== 'all' ? rarityColors[r] : '#00f5ff'}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${rarityFilter === r ? (r !== 'all' ? rarityColors[r] : '#00f5ff') : 'rgba(255,255,255,0.08)'}`,
                color: rarityFilter === r ? (r !== 'all' ? rarityColors[r] : '#00f5ff') : '#64748b',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((achievement, i) => {
          const color = rarityColors[achievement.rarity] || '#94a3b8';
          const progress = Math.min(achievement.progress / achievement.maxProgress * 100, 100);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: achievement.unlocked ? `${color}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${achievement.unlocked ? color + '40' : 'rgba(255,255,255,0.06)'}`,
                opacity: achievement.unlocked ? 1 : 0.6,
              }}
            >
              {/* Rarity glow */}
              {achievement.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-20" style={{ background: color, filter: 'blur(20px)' }} />
              )}

              <div className="flex gap-3 relative">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: achievement.unlocked ? `${color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${achievement.unlocked ? color + '40' : 'rgba(255,255,255,0.08)'}`,
                    filter: achievement.unlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white truncate">{achievement.name}</span>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-semibold whitespace-nowrap"
                        style={{ background: `${color}15`, color }}
                      >
                        {achievement.rarity}
                      </span>
                      {achievement.unlocked && (
                        <span className="text-xs text-green-400">✓ Done</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-2">{achievement.description}</div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/5 mb-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: achievement.unlocked ? color : `${color}80`, width: `${progress}%` }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {achievement.progress.toFixed(0)}/{achievement.maxProgress}
                    </span>
                    <span className="text-xs font-semibold" style={{ color }}>
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              {achievement.unlockedAt && (
                <div className="mt-2 text-xs text-gray-600 text-right">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No achievements match your filters
        </div>
      )}
    </div>
  );
};
