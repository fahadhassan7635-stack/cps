import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { useGameStore } from '../store/gameStore';
import type { TestMode } from '../types';

const challengeIcons: Record<string, string> = {
  click: '⚡',
  keyboard: '⌨️',
  reaction: '⚡',
  aim: '🎯',
};

const challengeColors: Record<string, string> = {
  click: '#00f5ff',
  keyboard: '#ff6b00',
  reaction: '#b400ff',
  aim: '#00ff88',
};

const challengeTargetModes: Record<string, TestMode> = {
  click: 'cps-test',
  keyboard: 'wpm-test',
  reaction: 'reaction-test',
  aim: 'aim-basic',
};

export const DailyChallengePage: React.FC = () => {
  const { dailyChallenges, setMode } = useGameStore();

  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const completedCount = dailyChallenges.filter(c => c.completed).length;
  const allCompleted = completedCount === dailyChallenges.length;



  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black font-orbitron gradient-text-purple mb-1">📅 Daily Challenges</h1>
            <p className="text-sm text-gray-500">Complete all 4 challenges for a bonus reward!</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Resets in</div>
            <div className="text-lg font-bold text-cyan-400">{timeUntilReset()}</div>
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <GlassCard className="p-4" animate={false}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-300">Daily Progress</span>
          <span className="text-sm font-bold text-cyan-400">{completedCount}/{dailyChallenges.length}</span>
        </div>
        <div className="w-full h-3 rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00f5ff, #b400ff)' }}
            animate={{ width: `${(completedCount / dailyChallenges.length) * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 text-center py-2 rounded-lg text-sm font-bold"
            style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}
          >
            🎉 All challenges complete! Bonus +500 XP earned!
          </motion.div>
        )}
      </GlassCard>

      {/* Challenges */}
      <div className="space-y-4">
        {dailyChallenges.map((challenge, i) => {
          const icon = challengeIcons[challenge.type];
          const color = challengeColors[challenge.type];
          const targetMode = challengeTargetModes[challenge.type];
          const progressPct = Math.min(challenge.progress / challenge.target * 100, 100);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: challenge.completed ? `${color}05` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${challenge.completed ? color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {challenge.completed && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${color}20`, color }}>
                  ✓
                </div>
              )}

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{challenge.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize font-semibold" style={{ background: `${color}15`, color }}>
                      {challenge.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{challenge.description}</p>
                  
                  <div className="w-full h-1.5 rounded-full bg-white/5 mb-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color, width: `${progressPct}%` }}
                      animate={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Target: <span style={{ color }}>{challenge.target} {challenge.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color }}>+{challenge.xpReward} XP</span>
                      {!challenge.completed && (
                        <NeonButton
                          onClick={() => setMode(targetMode)}
                          size="sm"
                          variant={challenge.type === 'click' ? 'cyan' : challenge.type === 'keyboard' ? 'orange' : challenge.type === 'aim' ? 'green' : 'purple'}
                        >
                          Play →
                        </NeonButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming Rewards */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-4">🎁 Challenge Rewards</h3>
        <div className="space-y-2">
          {[
            { milestone: '1 Challenge', xp: 150, icon: '✨' },
            { milestone: '2 Challenges', xp: 300, icon: '🌟' },
            { milestone: '3 Challenges', xp: 450, icon: '⭐' },
            { milestone: 'All 4 Challenges', xp: 1100, icon: '👑', bonus: true },
          ].map((reward, i) => (
            <div
              key={reward.milestone}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{
                background: completedCount > i ? 'rgba(0,245,255,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${completedCount > i ? 'rgba(0,245,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{completedCount > i ? '✅' : reward.icon}</span>
                <span className="text-sm text-gray-300">{reward.milestone}</span>
                {reward.bonus && <span className="text-xs px-1.5 py-0.5 rounded text-orange-400" style={{ background: 'rgba(255,107,0,0.1)' }}>BONUS</span>}
              </div>
              <span className="text-sm font-bold" style={{ color: completedCount > i ? '#00ff88' : '#00f5ff' }}>+{reward.xp} XP</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Streak Bonus */}
      <GlassCard className="p-5" animate={false}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">🔥</span>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-400 mb-1">Daily Streak Bonus</h3>
            <p className="text-xs text-gray-500">Complete daily challenges every day to maintain your streak for bonus XP multipliers!</p>
            <div className="flex gap-2 mt-2">
              {[1, 3, 7, 14, 30].map(days => (
                <div key={days} className="text-center px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
                  <div className="font-bold text-orange-400">{days}d</div>
                  <div className="text-gray-500">×{(1 + days * 0.1).toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
