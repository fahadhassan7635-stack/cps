import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, StatCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { useGameStore } from '../store/gameStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const RANK_DATA: Record<string, { color: string; emoji: string; minXP: number; maxXP: number }> = {
  Bronze: { color: '#cd7f32', emoji: '🥉', minXP: 0, maxXP: 400 },
  Silver: { color: '#c0c0c0', emoji: '🥈', minXP: 400, maxXP: 1000 },
  Gold: { color: '#ffd700', emoji: '🥇', minXP: 1000, maxXP: 2000 },
  Platinum: { color: '#00ffff', emoji: '💎', minXP: 2000, maxXP: 3500 },
  Diamond: { color: '#00bfff', emoji: '💠', minXP: 3500, maxXP: 5000 },
  Master: { color: '#b400ff', emoji: '⚡', minXP: 5000, maxXP: 7000 },
  Grandmaster: { color: '#ff6b00', emoji: '🔥', minXP: 7000, maxXP: 10000 },
  Legend: { color: '#ff0080', emoji: '👑', minXP: 10000, maxXP: 99999 },
};

const mockHistory = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  cps: +(Math.random() * 6 + 8).toFixed(1),
  wpm: Math.round(Math.random() * 30 + 50),
  reaction: Math.round(Math.random() * 80 + 180),
}));

const skillData = [
  { subject: 'CPS', value: 72 },
  { subject: 'Reaction', value: 85 },
  { subject: 'Aim', value: 68 },
  { subject: 'WPM', value: 79 },
  { subject: 'Memory', value: 61 },
  { subject: 'Focus', value: 74 },
];

const AVATARS = ['🎮', '⚡', '🔥', '💎', '🎯', '👑', '🦅', '🐉', '🌟', '🏆'];

export const ProfilePage: React.FC = () => {
  const { profile, xp, history, personalBests, achievements, updateProfile } = useGameStore();
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const rankInfo = RANK_DATA[profile.rank] || RANK_DATA.Bronze;
  const nextRank = Object.entries(RANK_DATA).find(([, v]) => v.minXP > xp);
  const rankProgress = nextRank
    ? ((xp - rankInfo.minXP) / (nextRank[1].minXP - rankInfo.minXP)) * 100
    : 100;

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6" animate={false}>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl cursor-pointer relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${rankInfo.color}20, rgba(180,0,255,0.1))`, border: `2px solid ${rankInfo.color}40` }}
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                {selectedAvatar}
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-tl-lg bg-black/50 flex items-center justify-center text-xs">✏️</div>
              </div>

              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-5 gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(10,10,26,0.95)', border: '1px solid rgba(0,245,255,0.2)' }}
                >
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => { setSelectedAvatar(av); updateProfile({ avatar: av }); setShowAvatarPicker(false); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
                    >
                      {av}
                    </button>
                  ))}
                </motion.div>
              )}

              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: `${rankInfo.color}15`, border: `1px solid ${rankInfo.color}40`, color: rankInfo.color }}>
                {rankInfo.emoji} {profile.rank}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {editingUsername ? (
                  <div className="flex gap-2">
                    <input
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="px-3 py-1 rounded-lg text-white text-lg font-bold bg-white/5 border border-cyan-400/50 outline-none"
                      maxLength={20}
                    />
                    <NeonButton
                      size="sm"
                      onClick={() => { updateProfile({ username: newUsername }); setEditingUsername(false); }}
                    >Save</NeonButton>
                    <NeonButton size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>Cancel</NeonButton>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-black text-white">{profile.username}</h1>
                    <button onClick={() => setEditingUsername(true)} className="text-gray-500 hover:text-gray-300 text-xs">✏️ Edit</button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
                <span>🎮 Level {profile.level}</span>
                <span>⚡ {xp.toLocaleString()} XP</span>
                <span>🔥 {profile.streak} Day Streak</span>
                <span>🏅 {unlockedAchievements} Achievements</span>
              </div>

              {/* Rank Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: rankInfo.color }}>{profile.rank}</span>
                  {nextRank && <span className="text-gray-500">{nextRank[0]} ({nextRank[1].minXP.toLocaleString()} XP)</span>}
                </div>
                <div className="w-full h-2 rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${rankInfo.color}, #b400ff)` }}
                    animate={{ width: `${Math.min(rankProgress, 100)}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,245,255,0.05)' }}>
                  <div className="text-xs text-gray-500">Best CPS</div>
                  <div className="text-sm font-bold text-cyan-400">{personalBests['cps-test'] ? personalBests['cps-test'].toFixed(1) : '--'}</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(180,0,255,0.05)' }}>
                  <div className="text-xs text-gray-500">Reaction</div>
                  <div className="text-sm font-bold text-purple-400">{personalBests['reaction-test'] ? `${personalBests['reaction-test']}ms` : '--'}</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,107,0,0.05)' }}>
                  <div className="text-xs text-gray-500">WPM</div>
                  <div className="text-sm font-bold text-orange-400">{personalBests['wpm-test'] || '--'}</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,255,136,0.05)' }}>
                  <div className="text-xs text-gray-500">Tests Done</div>
                  <div className="text-sm font-bold text-green-400">{profile.stats.totalTests}</div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['overview', 'history', 'achievements'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{
              background: activeTab === tab ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeTab === tab ? '#00f5ff' : 'rgba(255,255,255,0.08)'}`,
              color: activeTab === tab ? '#00f5ff' : '#64748b',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Best CPS" value={personalBests['cps-test'] ? personalBests['cps-test'].toFixed(1) : 0} unit="CPS" icon="⚡" glow="cyan" />
            <StatCard label="Best Reaction" value={personalBests['reaction-test'] || 0} unit="ms" icon="⚡" glow="purple" />
            <StatCard label="Best WPM" value={personalBests['wpm-test'] || 0} unit="WPM" icon="⌨️" glow="orange" />
            <StatCard label="Best Accuracy" value={personalBests['aim-basic'] || 0} unit="%" icon="🎯" glow="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <GlassCard className="p-4" animate={false}>
              <h3 className="text-sm font-bold text-gray-300 mb-4">📈 CPS Trend (30 Days)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mockHistory}>
                  <defs>
                    <linearGradient id="pgCPS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} tickCount={5} />
                  <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px', fontSize: 11 }} />
                  <Area type="monotone" dataKey="cps" stroke="#00f5ff" fill="url(#pgCPS)" strokeWidth={2} dot={false} name="CPS" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Skill Radar */}
            <GlassCard className="p-4" animate={false}>
              <h3 className="text-sm font-bold text-gray-300 mb-4">🕷️ Skill Profile</h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar name="Skills" dataKey="value" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <GlassCard className="overflow-hidden" animate={false}>
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No test history yet. Start playing!</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b flex text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex-1">Test</div>
                <div className="w-32 text-center">Score</div>
                <div className="w-40 text-right">Date</div>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {history.slice(0, 50).map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center px-4 py-3"
                  >
                    <div className="flex-1 text-sm text-gray-300 capitalize">{entry.testType.replace(/-/g, ' ')}</div>
                    <div className="w-32 text-center text-sm font-bold text-cyan-400">
                      {typeof entry.score === 'number' ? entry.score.toFixed(2) : entry.score} {entry.unit}
                    </div>
                    <div className="w-40 text-right text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement, i) => {
            const rarityColors: Record<string, string> = {
              Common: '#94a3b8', Rare: '#00f5ff', Epic: '#b400ff', Legendary: '#ffd700',
            };
            const color = rarityColors[achievement.rarity] || '#94a3b8';
            const progress = Math.min(achievement.progress / achievement.maxProgress * 100, 100);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl p-4 relative overflow-hidden achievement-card"
                style={{
                  background: achievement.unlocked ? `${color}08` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${achievement.unlocked ? color + '40' : 'rgba(255,255,255,0.06)'}`,
                  filter: achievement.unlocked ? 'none' : 'grayscale(0.8) opacity(0.5)',
                }}
              >
                <div className="flex gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white">{achievement.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: `${color}15`, color }}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{achievement.description}</div>
                    <div className="w-full h-1 rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-600">{achievement.progress}/{achievement.maxProgress}</span>
                      <span className="text-xs" style={{ color }}>+{achievement.xpReward} XP</span>
                    </div>
                  </div>
                </div>
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: `${color}20`, color }}>✓ Unlocked</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
