import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import type { TestMode } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface QuickTestCard {
  title: string;
  description: string;
  icon: string;
  mode: TestMode;
  color: 'cyan' | 'purple' | 'green' | 'orange' | 'pink';
  badge?: string;
}

const quickTests: QuickTestCard[] = [
  { title: 'CPS Test', description: 'Measure clicks per second', icon: '⚡', mode: 'cps-test', color: 'cyan', badge: 'Popular' },
  { title: 'Reaction Time', description: 'Test your reflexes', icon: '🎯', mode: 'reaction-test', color: 'purple', badge: 'Hot' },
  { title: 'Aim Trainer', description: 'Improve your precision', icon: '🔯', mode: 'aim-basic', color: 'green' },
  { title: 'WPM Test', description: 'Typing speed challenge', icon: '⌨️', mode: 'wpm-test', color: 'orange' },
  { title: 'Jitter Click', description: 'High-speed jitter test', icon: '🌊', mode: 'jitter-click', color: 'pink' },
  { title: 'Memory Game', description: 'Train your brain', icon: '🧠', mode: 'memory-game', color: 'cyan' },
];

const colorMap = {
  cyan: { text: '#00f5ff', border: 'rgba(0,245,255,0.2)', bg: 'rgba(0,245,255,0.05)', badge: 'rgba(0,245,255,0.15)' },
  purple: { text: '#b400ff', border: 'rgba(180,0,255,0.2)', bg: 'rgba(180,0,255,0.05)', badge: 'rgba(180,0,255,0.15)' },
  green: { text: '#00ff88', border: 'rgba(0,255,136,0.2)', bg: 'rgba(0,255,136,0.05)', badge: 'rgba(0,255,136,0.15)' },
  orange: { text: '#ff6b00', border: 'rgba(255,107,0,0.2)', bg: 'rgba(255,107,0,0.05)', badge: 'rgba(255,107,0,0.15)' },
  pink: { text: '#ff0080', border: 'rgba(255,0,128,0.2)', bg: 'rgba(255,0,128,0.05)', badge: 'rgba(255,0,128,0.15)' },
};

const mockChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  cps: Math.random() * 8 + 6,
  reaction: Math.random() * 60 + 180,
}));

const leaderboardData = [
  { rank: 1, name: 'NightOwl99', score: '28.4 CPS', country: '🇰🇷', rankTier: 'Legend' },
  { rank: 2, name: 'SpeedDemon', score: '26.1 CPS', country: '🇺🇸', rankTier: 'Grandmaster' },
  { rank: 3, name: 'ClickMaster', score: '25.8 CPS', country: '🇯🇵', rankTier: 'Grandmaster' },
  { rank: 4, name: 'ProClicker', score: '24.2 CPS', country: '🇩🇪', rankTier: 'Master' },
  { rank: 5, name: 'FastFingers', score: '23.9 CPS', country: '🇬🇧', rankTier: 'Master' },
];

export const HomePage: React.FC = () => {
  const { setMode, profile, history, personalBests } = useGameStore();

  const recentHistory = history.slice(0, 5);

  return (
    <div className="min-h-screen p-6 space-y-8 grid-bg">
      {/* Hero */}
      <section className="relative py-12 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(ellipse, #00f5ff, transparent)' }} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)', color: '#00f5ff' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 pulse-neon" />
            🌍 42,891 Players Online
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black font-orbitron mb-4">
            <span className="gradient-text-gaming">CPS TEST TOOLS</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            The #1 Competitive Gaming Benchmark Platform
          </p>
          <p className="text-sm text-gray-600 max-w-xl mx-auto mb-8">
            Test your CPS, reaction time, aim precision, typing speed & more. Compete globally, track progress, dominate the leaderboards.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <NeonButton onClick={() => setMode('cps-test')} variant="cyan" size="lg">
              ⚡ Start CPS Test
            </NeonButton>
            <NeonButton onClick={() => setMode('aim-basic')} variant="purple" size="lg">
              🎯 Aim Trainer
            </NeonButton>
            <NeonButton onClick={() => setMode('reaction-test')} variant="green" size="lg">
              ⚡ Reaction Test
            </NeonButton>
          </div>
        </motion.div>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-lg font-bold text-gray-300 mb-4 font-rajdhani">📊 Your Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Best CPS" value={personalBests['cps-test'] ? personalBests['cps-test'].toFixed(1) : '--'} unit="CPS" icon="⚡" glow="cyan" />
          <StatCard label="Best Reaction" value={personalBests['reaction-test'] ? Math.round(personalBests['reaction-test']) : '--'} unit="ms" icon="⚡" glow="purple" />
          <StatCard label="Best WPM" value={personalBests['wpm-test'] || '--'} unit="WPM" icon="⌨️" glow="green" />
          <StatCard label="Total Tests" value={profile.stats.totalTests} icon="🎮" glow="orange" />
        </div>
      </section>

      {/* Quick Tests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-300 font-rajdhani">⚡ Quick Tests</h2>
          <span className="text-xs text-gray-600">Click to start</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {quickTests.map((test, i) => {
            const c = colorMap[test.color];
            return (
              <motion.button
                key={test.mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(test.mode)}
                className="rounded-xl p-4 text-left relative overflow-hidden group"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 0%, ${c.border}, transparent 70%)` }} />
                {test.badge && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: c.badge, color: c.text }}>
                    {test.badge}
                  </span>
                )}
                <div className="text-3xl mb-2">{test.icon}</div>
                <div className="font-bold text-white text-sm">{test.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{test.description}</div>
                <div className="mt-3 text-xs font-semibold" style={{ color: c.text }}>Play Now →</div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">📈 Performance Trend (14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="cpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="cps" stroke="#00f5ff" fill="url(#cpsGrad)" strokeWidth={2} name="CPS" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Mini Leaderboard */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300">🏆 Global Top 5 – CPS</h3>
            <button
              onClick={() => setMode('leaderboard')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {leaderboardData.map((entry) => {
              const rankColors: Record<number, string> = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
              return (
                <div key={entry.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-sm font-bold w-5 text-center" style={{ color: rankColors[entry.rank] || '#64748b' }}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </span>
                  <span className="text-sm">{entry.country}</span>
                  <span className="text-sm text-gray-300 flex-1 font-medium">{entry.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,107,0,0.1)', color: '#ff6b00' }}>
                    {entry.rankTier}
                  </span>
                  <span className="text-sm font-bold text-cyan-400">{entry.score}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Daily Challenges */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-300 font-rajdhani">📅 Daily Challenges</h2>
          <button onClick={() => setMode('daily-challenge')} className="text-xs text-cyan-400">View All →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '⚡', title: 'Speed Clicker', desc: 'Get 12+ CPS', xp: 150, progress: 0, color: '#00f5ff' },
            { icon: '⌨️', title: 'Quick Fingers', desc: 'Type 60+ WPM', xp: 150, progress: 0, color: '#b400ff' },
            { icon: '🎯', title: 'Sharpshooter', desc: '90% accuracy in aim', xp: 200, progress: 0, color: '#00ff88' },
            { icon: '⚡', title: 'Reflexes', desc: 'Sub 200ms reaction', xp: 200, progress: 0, color: '#ff6b00' },
          ].map((c) => (
            <motion.div
              key={c.title}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl p-4 relative overflow-hidden"
              style={{ background: `${c.color}08`, border: `1px solid ${c.color}20` }}
            >
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-sm font-bold text-white">{c.title}</div>
              <div className="text-xs text-gray-500 mb-3">{c.desc}</div>
              <div className="w-full h-1 rounded-full bg-white/5 mb-2">
                <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: c.color }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: c.color }}>+{c.xp} XP</span>
                <span className="text-xs text-gray-600">0/{c.progress === 100 ? '✓' : '1'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      {recentHistory.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-300 mb-4 font-rajdhani">🕐 Recent Activity</h2>
          <GlassCard className="overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {recentHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-300 capitalize">{entry.testType.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-gray-600">{new Date(entry.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400">{typeof entry.score === 'number' ? entry.score.toFixed(2) : entry.score} {entry.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      )}

      {/* Feature Grid */}
      <section>
        <h2 className="text-lg font-bold text-gray-300 mb-4 font-rajdhani">🎮 Platform Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '📊', title: '50+ Tests', desc: 'Comprehensive gaming benchmarks' },
            { icon: '🏆', title: 'Global Ranks', desc: '8-tier competitive ranking' },
            { icon: '📈', title: 'Analytics', desc: 'Detailed progress tracking' },
            { icon: '🎯', title: 'Aim Training', desc: 'Professional aim trainer' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="text-sm font-bold text-white mb-1">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
