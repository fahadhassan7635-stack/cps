import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '../../components/ui/NeonButton';
import { ResultModal } from '../../components/ui/ResultModal';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGameStore } from '../../store/gameStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CPSTestProps {
  mode?: 'cps-test' | 'jitter-click' | 'butterfly-click' | 'drag-click' | 'kohi-click' | 'badlion-click' | 'right-click' | 'double-click' | 'spacebar-cps';
}

const modeConfig = {
  'cps-test': { name: 'CPS Test', description: 'Click as fast as you can!', instruction: 'Left click as fast as possible', color: '#00f5ff', icon: '⚡' },
  'jitter-click': { name: 'Jitter Click Test', description: 'Use the jitter clicking technique', instruction: 'Tense your arm and rapidly click', color: '#b400ff', icon: '🌊' },
  'butterfly-click': { name: 'Butterfly Click Test', description: 'Alternate between two fingers rapidly', instruction: 'Use index + middle finger alternating', color: '#ff0080', icon: '🦋' },
  'drag-click': { name: 'Drag Click Test', description: 'Register multiple clicks per drag', instruction: 'Drag your finger across the button', color: '#ff6b00', icon: '↔️' },
  'kohi-click': { name: 'Kohi Click Test', description: 'The original Minecraft click test', instruction: 'Click as fast as you can', color: '#00ff88', icon: '☕' },
  'badlion-click': { name: 'Badlion Click Test', description: 'Competitive Minecraft click test', instruction: 'Prove your clicking speed', color: '#ffd700', icon: '🦁' },
  'right-click': { name: 'Right Click Test', description: 'Test your right click speed', instruction: 'Right click as fast as possible', color: '#00f5ff', icon: '🖱️' },
  'double-click': { name: 'Double Click Test', description: 'Test your double click speed', instruction: 'Double click as fast as you can', color: '#b400ff', icon: '⏫' },
  'spacebar-cps': { name: 'Spacebar CPS Test', description: 'How fast can you tap spacebar?', instruction: 'Press SPACE as fast as possible', color: '#ff6b00', icon: '⎵' },
};

const durations = [1, 5, 10, 30, 60, 100];

function getCPSRating(cps: number): { rating: string; color: string } {
  if (cps >= 20) return { rating: 'LEGENDARY', color: '#ff0080' };
  if (cps >= 16) return { rating: 'GODLIKE', color: '#ffd700' };
  if (cps >= 13) return { rating: 'PRO', color: '#00f5ff' };
  if (cps >= 10) return { rating: 'ADVANCED', color: '#b400ff' };
  if (cps >= 7) return { rating: 'INTERMEDIATE', color: '#00ff88' };
  if (cps >= 4) return { rating: 'BEGINNER', color: '#ff6b00' };
  return { rating: 'KEEP TRYING', color: '#64748b' };
}

export const CPSTest: React.FC<CPSTestProps> = ({ mode = 'cps-test' }) => {
  const config = modeConfig[mode] || modeConfig['cps-test'];
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(selectedDuration);
  const [cps, setCPS] = useState(0);
  const [clickHistory, setClickHistory] = useState<{ time: number; clicks: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clicksRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const rippleId = useRef(0);
  const { personalBests } = useGameStore();

  const currentPB = personalBests[mode] || 0;

  const reset = useCallback(() => {
    setPhase('idle');
    setClicks(0);
    setTimeLeft(selectedDuration);
    setCPS(0);
    setClickHistory([]);
    clicksRef.current = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [selectedDuration]);

  useEffect(() => { reset(); }, [selectedDuration]);

  const startTest = useCallback(() => {
    setPhase('running');
    clicksRef.current = 0;
    setClicks(0);
    setClickHistory([]);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, selectedDuration - elapsed);
      setTimeLeft(remaining);
      const currentCPS = elapsed > 0 ? clicksRef.current / elapsed : 0;
      setCPS(currentCPS);
      setClickHistory(prev => [...prev, { time: Math.round(elapsed), clicks: Math.round(currentCPS * 10) / 10 }]);

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        setPhase('done');
        setShowResult(true);
      }
    }, 100);
  }, [selectedDuration]);

  const handleClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    if (mode === 'right-click' && 'button' in e && e.button !== 2) return;
    
    if (phase === 'idle') {
      startTest();
    } else if (phase === 'running') {
      clicksRef.current += 1;
      setClicks(c => c + 1);
      
      if ('clientX' in e) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = rippleId.current++;
        setRipples(prev => [...prev, { id, x, y }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
      }
    }
  }, [phase, startTest, mode]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (mode === 'right-click') {
      e.preventDefault();
      handleClick(e as React.MouseEvent);
    }
  }, [mode, handleClick]);

  useEffect(() => {
    if (mode !== 'spacebar-cps') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'idle') startTest();
        else if (phase === 'running') {
          clicksRef.current += 1;
          setClicks(c => c + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, phase, startTest]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const elapsed = selectedDuration - timeLeft;
  const currentCPS = elapsed > 0 ? clicks / elapsed : 0;
  const { rating, color: ratingColor } = getCPSRating(currentCPS || cps);
  const progress = ((selectedDuration - timeLeft) / selectedDuration) * 100;

  const finalCPS = phase === 'done' ? clicks / selectedDuration : currentCPS;
  const finalRating = getCPSRating(finalCPS);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-black font-orbitron" style={{ color: config.color }}>{config.name}</h1>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>

        {/* Duration selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          {durations.map(d => (
            <button
              key={d}
              onClick={() => { reset(); setSelectedDuration(d); }}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: selectedDuration === d ? `${config.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedDuration === d ? config.color : 'rgba(255,255,255,0.08)'}`,
                color: selectedDuration === d ? config.color : '#64748b',
              }}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">CPS</div>
          <div className="text-2xl font-black font-orbitron" style={{ color: config.color }}>
            {phase === 'done' ? finalCPS.toFixed(2) : currentCPS.toFixed(1)}
          </div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Clicks</div>
          <div className="text-2xl font-black font-orbitron text-white">{clicks}</div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Time</div>
          <div className="text-2xl font-black font-orbitron" style={{ color: timeLeft < 3 && phase === 'running' ? '#ff0080' : '#94a3b8' }}>
            {phase === 'running' ? timeLeft.toFixed(1) : selectedDuration}s
          </div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Best</div>
          <div className="text-2xl font-black font-orbitron text-yellow-400">{currentPB ? currentPB.toFixed(1) : '--'}</div>
        </GlassCard>
      </div>

      {/* Progress bar */}
      {phase === 'running' && (
        <div className="w-full h-1.5 rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${config.color}, #b400ff)`, width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Click Area */}
      <motion.div
        className="relative overflow-hidden rounded-2xl cursor-pointer no-select"
        style={{
          height: 280,
          background: phase === 'running'
            ? `linear-gradient(135deg, ${config.color}08, rgba(180,0,255,0.05))`
            : 'rgba(255,255,255,0.02)',
          border: `2px solid ${phase === 'running' ? config.color : 'rgba(255,255,255,0.06)'}`,
          boxShadow: phase === 'running' ? `0 0 40px ${config.color}20, inset 0 0 40px ${config.color}05` : 'none',
          transition: 'all 0.3s ease',
        }}
        onClick={mode !== 'right-click' ? handleClick as (e: React.MouseEvent) => void : undefined}
        onContextMenu={mode === 'right-click' ? handleContextMenu : (e) => e.preventDefault()}
        whileTap={phase !== 'idle' ? { scale: 0.995 } : undefined}
      >
        {/* Ripples */}
        <AnimatePresence>
          {ripples.map(r => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 60,
                height: 60,
                left: r.x - 30,
                top: r.y - 30,
                background: `radial-gradient(circle, ${config.color}40, transparent)`,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase === 'idle' && (
            <motion.div className="text-center" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <div className="text-5xl mb-4">{config.icon}</div>
              <div className="text-xl font-bold font-orbitron" style={{ color: config.color }}>
                {mode === 'spacebar-cps' ? 'Press SPACE to Start' : 'Click Here to Start'}
              </div>
              <div className="text-sm text-gray-500 mt-2">{config.instruction}</div>
            </motion.div>
          )}

          {phase === 'running' && (
            <div className="text-center pointer-events-none">
              <motion.div
                className="text-7xl font-black font-orbitron"
                style={{ color: config.color, textShadow: `0 0 40px ${config.color}80` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.1 }}
                key={clicks}
              >
                {currentCPS.toFixed(1)}
              </motion.div>
              <div className="text-gray-400 text-sm mt-2">CPS</div>
              <div className="text-2xl font-bold text-white mt-2">{clicks} clicks</div>
              <div className="mt-2 text-sm font-semibold" style={{ color: ratingColor }}>{rating}</div>
            </div>
          )}

          {phase === 'done' && (
            <div className="text-center">
              <div className="text-5xl font-black font-orbitron" style={{ color: finalRating.color }}>
                {finalCPS.toFixed(2)}
              </div>
              <div className="text-gray-400">CPS</div>
              <NeonButton onClick={reset} variant="cyan" className="mt-4">Reset</NeonButton>
            </div>
          )}
        </div>
      </motion.div>

      {/* CPS Chart */}
      {clickHistory.length > 2 && (
        <GlassCard className="p-4">
          <h3 className="text-sm text-gray-400 mb-3">📊 CPS Timeline</h3>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={clickHistory}>
              <defs>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px', fontSize: 12 }} />
              <Area type="monotone" dataKey="clicks" stroke={config.color} fill="url(#clickGrad)" strokeWidth={2} dot={false} name="CPS" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Info */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-gray-300 mb-3">📖 CPS Rating Scale</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { range: '1-3', label: 'Beginner', color: '#64748b' },
            { range: '4-6', label: 'Average', color: '#ff6b00' },
            { range: '7-9', label: 'Good', color: '#00ff88' },
            { range: '10-12', label: 'Advanced', color: '#b400ff' },
            { range: '13-15', label: 'Pro', color: '#00f5ff' },
            { range: '16+', label: 'Legend', color: '#ff0080' },
          ].map(r => (
            <div key={r.range} className="text-center p-2 rounded-lg" style={{ background: `${r.color}10` }}>
              <div className="text-xs font-bold" style={{ color: r.color }}>{r.range} CPS</div>
              <div className="text-xs text-gray-600">{r.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <ResultModal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        onRetry={() => { setShowResult(false); reset(); }}
        title={config.name}
        score={finalCPS}
        unit="CPS"
        rating={finalRating.rating}
        ratingColor={finalRating.color}
        testType={mode}
        stats={[
          { label: 'Total Clicks', value: clicks },
          { label: 'Duration', value: selectedDuration, unit: 's' },
          { label: 'Best CPS', value: currentPB || finalCPS.toFixed(2) },
          { label: 'Rating', value: finalRating.rating },
        ]}
      />
    </div>
  );
};
