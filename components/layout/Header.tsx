import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export const Header: React.FC = () => {
  const { profile, xp, setMode, currentMode } = useGameStore();

  const xpToNextLevel = (profile.level * profile.level) * 100;
  const xpProgress = Math.min((xp % xpToNextLevel) / xpToNextLevel * 100, 100);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-4 py-2"
      style={{
        background: 'rgba(5,5,16,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
        marginLeft: 'var(--sidebar-width, 240px)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500 capitalize">
          {currentMode.replace(/-/g, ' ')}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* XP Bar */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-500">Lv.{profile.level}</span>
          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00f5ff, #b400ff)' }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-cyan-400">{xp.toLocaleString()} XP</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}>
          <span className="text-sm">🔥</span>
          <span className="text-xs font-semibold text-orange-400">{profile.streak}</span>
        </div>

        {/* Daily Challenge */}
        <button
          onClick={() => setMode('daily-challenge')}
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-purple-400 transition-all"
          style={{ background: 'rgba(180,0,255,0.1)', border: '1px solid rgba(180,0,255,0.2)' }}
        >
          <span>📅</span>
          <span>Daily</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setMode('profile')}
          className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all hover:bg-white/5"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(180,0,255,0.2))', border: '1px solid rgba(0,245,255,0.3)' }}>
            {profile.avatar}
          </div>
          <span className="hidden sm:block text-xs font-medium text-gray-300">{profile.username}</span>
          <span className="hidden sm:block text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: getRankBg(profile.rank), color: getRankColor(profile.rank) }}>
            {profile.rank}
          </span>
        </button>
      </div>
    </header>
  );
};

function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#ffd700',
    Platinum: '#00ffff', Diamond: '#00bfff', Master: '#b400ff',
    Grandmaster: '#ff6b00', Legend: '#ff0080',
  };
  return colors[rank] || '#ffffff';
}

function getRankBg(rank: string): string {
  const colors: Record<string, string> = {
    Bronze: 'rgba(205,127,50,0.15)', Silver: 'rgba(192,192,192,0.15)',
    Gold: 'rgba(255,215,0,0.15)', Platinum: 'rgba(0,255,255,0.15)',
    Diamond: 'rgba(0,191,255,0.15)', Master: 'rgba(180,0,255,0.15)',
    Grandmaster: 'rgba(255,107,0,0.15)', Legend: 'rgba(255,0,128,0.15)',
  };
  return colors[rank] || 'rgba(255,255,255,0.1)';
}
