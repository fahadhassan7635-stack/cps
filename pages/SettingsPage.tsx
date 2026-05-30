import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { NeonButton } from '../components/ui/NeonButton';
import { useGameStore } from '../store/gameStore';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useGameStore();

  const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({ value, onChange, label, desc }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div>
        <div className="text-sm font-medium text-gray-200">{label}</div>
        {desc && <div className="text-xs text-gray-500">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-12 h-6 rounded-full transition-all"
        style={{ background: value ? '#00f5ff' : 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          animate={{ x: value ? 24 : 2 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white"
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </button>
    </div>
  );

  const themes = [
    { key: 'cyan', label: 'Cyber Blue', color: '#00f5ff' },
    { key: 'purple', label: 'Neon Purple', color: '#b400ff' },
    { key: 'green', label: 'Matrix Green', color: '#00ff88' },
  ] as const;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black font-orbitron gradient-text-cyan mb-1">⚙️ Settings</h1>
        <p className="text-sm text-gray-500">Customize your experience</p>
      </motion.div>

      {/* Theme */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-4">🎨 Theme</h3>
        <div className="flex gap-3">
          {themes.map(t => (
            <button
              key={t.key}
              onClick={() => updateSettings({ theme: t.key })}
              className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
              style={{
                background: settings.theme === t.key ? `${t.color}10` : 'rgba(255,255,255,0.02)',
                border: `2px solid ${settings.theme === t.key ? t.color : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="w-8 h-8 rounded-full" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}60` }} />
              <span className="text-xs font-medium" style={{ color: settings.theme === t.key ? t.color : '#64748b' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Accessibility */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-3">♿ Accessibility</h3>
        <Toggle
          value={settings.colorBlindMode}
          onChange={v => updateSettings({ colorBlindMode: v })}
          label="Color Blind Mode"
          desc="Uses patterns instead of colors for differentiation"
        />
        <Toggle
          value={settings.soundEnabled}
          onChange={v => updateSettings({ soundEnabled: v })}
          label="Sound Effects"
          desc="Enable audio feedback for tests"
        />
        <Toggle
          value={settings.showFPS}
          onChange={v => updateSettings({ showFPS: v })}
          label="Show FPS Counter"
          desc="Display frames per second in corner"
        />
      </GlassCard>

      {/* UI Scale */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-4">🔍 UI Scale</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-8">80%</span>
            <input
              type="range"
              min={0.8}
              max={1.4}
              step={0.1}
              value={settings.uiScale}
              onChange={e => updateSettings({ uiScale: parseFloat(e.target.value) })}
              className="flex-1"
              style={{ accentColor: '#00f5ff' }}
            />
            <span className="text-xs text-gray-500 w-8">140%</span>
          </div>
          <div className="text-center text-sm font-bold text-cyan-400">{Math.round(settings.uiScale * 100)}%</div>
        </div>
      </GlassCard>

      {/* Keyboard Navigation */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-4">⌨️ Keyboard Navigation</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Tab', 'Navigate menus'],
            ['Enter/Space', 'Select/Click'],
            ['Escape', 'Close/Reset'],
            ['Arrow Keys', 'Navigate options'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {key}
              </kbd>
              <span className="text-xs text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* About */}
      <GlassCard className="p-5" animate={false}>
        <h3 className="text-sm font-bold text-gray-300 mb-4">ℹ️ About CPS Test Tools</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Version 2.0.0 — The #1 Competitive Gaming Benchmark Platform</p>
          <p>50+ unique tests across clicking, keyboard, reaction, aim training and brain training categories.</p>
          <div className="flex gap-3 mt-4">
            <NeonButton variant="ghost" size="sm">Privacy Policy</NeonButton>
            <NeonButton variant="ghost" size="sm">Terms of Service</NeonButton>
            <NeonButton variant="ghost" size="sm">Contact</NeonButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
