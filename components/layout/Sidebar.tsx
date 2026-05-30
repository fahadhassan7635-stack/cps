import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { TestMode } from '../../types';
import { cn } from '../../utils/cn';

interface NavItem {
  label: string;
  mode: TestMode;
  icon: string;
}

interface NavSection {
  title: string;
  icon: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Click Tests',
    icon: '⚡',
    items: [
      { label: 'CPS Test', mode: 'cps-test', icon: '🖱️' },
      { label: 'Jitter Click', mode: 'jitter-click', icon: '⚡' },
      { label: 'Butterfly Click', mode: 'butterfly-click', icon: '🦋' },
      { label: 'Drag Click', mode: 'drag-click', icon: '↔️' },
      { label: 'Kohi Click', mode: 'kohi-click', icon: '☕' },
      { label: 'Badlion Click', mode: 'badlion-click', icon: '🦁' },
      { label: 'Right Click', mode: 'right-click', icon: '🖱️' },
      { label: 'Double Click', mode: 'double-click', icon: '⏫' },
    ],
  },
  {
    title: 'Keyboard Tests',
    icon: '⌨️',
    items: [
      { label: 'WPM Test', mode: 'wpm-test', icon: '⌨️' },
      { label: 'Key Response', mode: 'key-response', icon: '⚡' },
      { label: 'WASD Test', mode: 'wasd-test', icon: '🎮' },
      { label: 'Arrow Speed', mode: 'arrow-speed', icon: '⬆️' },
      { label: 'Memory Keys', mode: 'memory-keys', icon: '🧠' },
    ],
  },
  {
    title: 'Reaction Tests',
    icon: '⚡',
    items: [
      { label: 'Reaction Test', mode: 'reaction-test', icon: '⚡' },
      { label: 'F1 Reaction', mode: 'f1-reaction', icon: '🏎️' },
      { label: 'Spacebar React', mode: 'spacebar-reaction', icon: '⎵' },
      { label: 'Audio Reaction', mode: 'audio-reaction', icon: '🔊' },
    ],
  },
  {
    title: 'Aim Trainer',
    icon: '🎯',
    items: [
      { label: 'Basic Aim', mode: 'aim-basic', icon: '🎯' },
      { label: 'Tracking', mode: 'aim-tracking', icon: '👁️' },
      { label: 'Flick Shot', mode: 'aim-flick', icon: '⚡' },
      { label: 'Sniper Mode', mode: 'aim-sniper', icon: '🔭' },
      { label: 'Headshot Only', mode: 'aim-headshot', icon: '💀' },
      { label: 'Precision', mode: 'aim-precision', icon: '✳️' },
    ],
  },
  {
    title: 'Brain Training',
    icon: '🧠',
    items: [
      { label: 'Memory Game', mode: 'memory-game', icon: '🧩' },
      { label: 'Pattern Recall', mode: 'pattern-recall', icon: '🔷' },
      { label: 'Focus Test', mode: 'focus-test', icon: '🎯' },
      { label: 'Peripheral Vision', mode: 'peripheral-vision', icon: '👁️' },
    ],
  },
];

const topNavItems: NavItem[] = [
  { label: 'Home', mode: 'home', icon: '🏠' },
  { label: 'Daily Challenge', mode: 'daily-challenge', icon: '📅' },
];

const bottomNavItems: NavItem[] = [
  { label: 'Leaderboard', mode: 'leaderboard', icon: '🏆' },
  { label: 'Achievements', mode: 'achievements', icon: '🥇' },
  { label: 'Profile', mode: 'profile', icon: '👤' },
  { label: 'Settings', mode: 'settings', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  const { currentMode, setMode, sidebarCollapsed, toggleSidebar, profile, xp } = useGameStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Click Tests', 'Reaction Tests'])
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const xpToNextLevel = (profile.level * profile.level) * 100;
  const xpProgress = Math.min((xp % xpToNextLevel) / xpToNextLevel * 100, 100);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full z-50 flex flex-col overflow-hidden"
      style={{ background: 'rgba(5,5,16,0.95)', borderRight: '1px solid rgba(0,245,255,0.1)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #00f5ff, #b400ff)' }}>
                ⚡
              </div>
              <span className="font-orbitron font-bold text-sm gradient-text-cyan">CPS TOOLS</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-all"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Profile mini */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-b" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(180,0,255,0.2))', border: '1px solid rgba(0,245,255,0.3)' }}>
              {profile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{profile.username}</div>
              <div className="text-xs" style={{ color: getRankColor(profile.rank) }}>Lv.{profile.level} {profile.rank}</div>
            </div>
          </div>
          <div className="w-full h-1 rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00f5ff, #b400ff)', width: `${xpProgress}%` }}
              animate={{ width: `${xpProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{xp.toLocaleString()} XP</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {/* Top items */}
        {topNavItems.map(item => (
          <SidebarItem
            key={item.mode}
            item={item}
            isActive={currentMode === item.mode}
            collapsed={sidebarCollapsed}
            onClick={() => setMode(item.mode)}
          />
        ))}

        <div className="h-2" />

        {/* Sections */}
        {navSections.map(section => (
          <div key={section.title}>
            {!sidebarCollapsed ? (
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors rounded"
              >
                <span>{section.icon} {section.title}</span>
                <span className="text-xs">{expandedSections.has(section.title) ? '▾' : '▸'}</span>
              </button>
            ) : (
              <div className="flex justify-center py-1 text-gray-500 text-xs">{section.icon}</div>
            )}

            <AnimatePresence>
              {(expandedSections.has(section.title) || sidebarCollapsed) && (
                <motion.div
                  initial={!sidebarCollapsed ? { height: 0, opacity: 0 } : {}}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={!sidebarCollapsed ? { height: 0, opacity: 0 } : {}}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {section.items.map(item => (
                    <SidebarItem
                      key={item.mode}
                      item={item}
                      isActive={currentMode === item.mode}
                      collapsed={sidebarCollapsed}
                      onClick={() => setMode(item.mode)}
                      indent
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="h-2" />

        {/* Bottom items */}
        {bottomNavItems.map(item => (
          <SidebarItem
            key={item.mode}
            item={item}
            isActive={currentMode === item.mode}
            collapsed={sidebarCollapsed}
            onClick={() => setMode(item.mode)}
          />
        ))}
      </nav>

      {/* Streak */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-t" style={{ borderColor: 'rgba(0,245,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <div className="text-xs font-semibold text-orange-400">{profile.streak} Day Streak</div>
              <div className="text-xs text-gray-600">Keep it going!</div>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  indent?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, collapsed, onClick, indent }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      'sidebar-item w-full flex items-center gap-2 rounded-lg transition-all text-left',
      collapsed ? 'justify-center px-2 py-2' : `px-2 py-1.5 ${indent ? 'pl-4' : ''}`,
      isActive
        ? 'text-cyan-400 bg-cyan-400/10 border-l-2 border-cyan-400'
        : 'text-gray-400 hover:text-gray-200',
    )}
    style={isActive ? { boxShadow: 'inset 0 0 20px rgba(0,245,255,0.05)' } : {}}
    title={collapsed ? item.label : undefined}
  >
    <span className="text-sm flex-shrink-0">{item.icon}</span>
    {!collapsed && (
      <span className="text-xs font-medium truncate">{item.label}</span>
    )}
    {isActive && !collapsed && (
      <motion.div
        layoutId="activeIndicator"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
        style={{ boxShadow: '0 0 6px #00f5ff' }}
      />
    )}
  </motion.button>
);

function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#00ffff',
    Diamond: '#00bfff',
    Master: '#b400ff',
    Grandmaster: '#ff6b00',
    Legend: '#ff0080',
  };
  return colors[rank] || '#ffffff';
}
