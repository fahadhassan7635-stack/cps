import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from '../../components/ui/NeonButton';
import { ResultModal } from '../../components/ui/ResultModal';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGameStore } from '../../store/gameStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type ReactionMode = 'reaction-test' | 'f1-reaction' | 'spacebar-reaction' | 'audio-reaction';

interface ReactionTestProps {
  mode?: ReactionMode;
}

const modeConfig: Record<ReactionMode, { name: string; description: string; icon: string; color: string; instruction: string }> = {
  'reaction-test': { name: 'Reaction Time Test', description: 'Human benchmark style reaction test', icon: '⚡', color: '#00f5ff', instruction: 'Click when the screen turns green' },
  'f1-reaction': { name: 'F1 Start Reaction', description: 'React to the race start lights', icon: '🏎️', color: '#ff0080', instruction: 'Click when the lights go out' },
  'spacebar-reaction': { name: 'Spacebar Reaction', description: 'Press SPACE when prompted', icon: '⎵', color: '#b400ff', instruction: 'Press SPACE when the bar appears' },
  'audio-reaction': { name: 'Audio Reaction Test', description: 'React to sound cues', icon: '🔊', color: '#00ff88', instruction: 'Click when you hear the beep' },
};

function getRatingByMS(ms: number): { rating: string; color: string } {
  if (ms < 100) return { rating: 'SUPERHUMAN', color: '#ff0080' };
  if (ms < 150) return { rating: 'GODLIKE', color: '#ffd700' };
  if (ms < 200) return { rating: 'PRO GAMER', color: '#00f5ff' };
  if (ms < 250) return { rating: 'FAST', color: '#b400ff' };
  if (ms < 300) return { rating: 'AVERAGE', color: '#00ff88' };
  if (ms < 400) return { rating: 'SLOW', color: '#ff6b00' };
  return { rating: 'TOO SLOW', color: '#64748b' };
}

const F1_LIGHTS = 5;

export const ReactionTest: React.FC<ReactionTestProps> = ({ mode = 'reaction-test' }) => {
  const config = modeConfig[mode];
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'early' | 'done'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [f1Lights, setF1Lights] = useState(0);
  const [attempts, setAttempts] = useState(5);
  const [currentAttempt, setCurrentAttempt] = useState(0);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { personalBests } = useGameStore();
  const pb = personalBests[mode];

  const cleanup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => () => cleanup(), []);

  const startWaiting = useCallback(() => {
    setPhase('waiting');
    setReactionTime(null);
    
    const delay = Math.random() * 4000 + 1500;
    
    if (mode === 'f1-reaction') {
      setF1Lights(0);
      let lightCount = 0;
      const lightInterval = setInterval(() => {
        lightCount++;
        setF1Lights(lightCount);
        if (lightCount >= F1_LIGHTS) {
          clearInterval(lightInterval);
          const extinguishDelay = Math.random() * 3000 + 1000;
          timeoutRef.current = setTimeout(() => {
            setF1Lights(0);
            setPhase('ready');
            startTimeRef.current = performance.now();
          }, extinguishDelay);
        }
      }, 800);
      return;
    }

    if (mode === 'audio-reaction') {
      timeoutRef.current = setTimeout(() => {
        // Play audio beep via AudioContext
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
        } catch (e) { /* silent fail */ }
        setPhase('ready');
        startTimeRef.current = performance.now();
      }, delay);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setPhase('ready');
      startTimeRef.current = performance.now();
    }, delay);
  }, [mode]);

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setCurrentAttempt(0);
      setHistory([]);
      startWaiting();
    } else if (phase === 'waiting') {
      cleanup();
      setPhase('early');
    } else if (phase === 'ready') {
      const rt = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(rt);
      setHistory(prev => {
        const next = [...prev, rt];
        return next;
      });
      setCurrentAttempt(a => a + 1);
      
      if (currentAttempt + 1 >= attempts) {
        setPhase('done');
        setShowResult(true);
      } else {
        setPhase('idle');
        setTimeout(startWaiting, 1000);
      }
    } else if (phase === 'early' || phase === 'done') {
      setPhase('idle');
      setReactionTime(null);
    }
  }, [phase, startWaiting, currentAttempt, attempts]);

  useEffect(() => {
    if (mode !== 'spacebar-reaction') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, handleClick]);

  const avgReaction = history.length > 0 ? Math.round(history.reduce((a, b) => a + b) / history.length) : 0;
  const bestRT = history.length > 0 ? Math.min(...history) : 0;
  const finalScore = bestRT || reactionTime || 0;
  const { rating, color: ratingColor } = getRatingByMS(finalScore);

  const getBgColor = () => {
    if (phase === 'ready') return 'rgba(0,255,136,0.1)';
    if (phase === 'early') return 'rgba(255,0,128,0.1)';
    if (phase === 'waiting') return 'rgba(255,107,0,0.05)';
    return 'rgba(0,245,255,0.03)';
  };
  const getBorderColor = () => {
    if (phase === 'ready') return '#00ff88';
    if (phase === 'early') return '#ff0080';
    if (phase === 'waiting') return '#ff6b00';
    return config.color;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-black font-orbitron" style={{ color: config.color }}>{config.name}</h1>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-gray-500">Attempts:</span>
          {[3, 5, 10].map(n => (
            <button
              key={n}
              onClick={() => { setAttempts(n); setPhase('idle'); setHistory([]); setCurrentAttempt(0); }}
              className="px-3 py-1 rounded text-xs font-semibold transition-all"
              style={{ background: attempts === n ? `${config.color}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${attempts === n ? config.color : 'rgba(255,255,255,0.08)'}`, color: attempts === n ? config.color : '#64748b' }}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {currentAttempt > 0 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: attempts }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full"
              style={{ background: i < currentAttempt ? config.color : 'rgba(255,255,255,0.05)' }}
            />
          ))}
        </div>
      )}

      {/* F1 Lights */}
      {mode === 'f1-reaction' && (
        <div className="flex justify-center gap-4">
          {Array.from({ length: F1_LIGHTS }).map((_, i) => (
            <motion.div
              key={i}
              className="w-10 h-10 rounded-full"
              animate={{
                background: i < f1Lights ? '#ff0000' : 'rgba(255,0,0,0.1)',
                boxShadow: i < f1Lights ? '0 0 20px #ff0000, 0 0 40px #ff000060' : 'none',
              }}
              transition={{ duration: 0.1 }}
            />
          ))}
        </div>
      )}

      {/* Main Click Area */}
      <motion.div
        className="relative rounded-2xl cursor-pointer no-select overflow-hidden"
        style={{
          height: 280,
          background: getBgColor(),
          border: `2px solid ${getBorderColor()}`,
          boxShadow: phase === 'ready' ? '0 0 60px rgba(0,255,136,0.2)' : 'none',
          transition: 'all 0.2s ease',
        }}
        onClick={mode !== 'spacebar-reaction' ? handleClick : undefined}
        whileTap={{ scale: 0.998 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase === 'idle' && (
            <div className="text-center">
              <div className="text-5xl mb-4">{config.icon}</div>
              <div className="text-xl font-bold font-orbitron" style={{ color: config.color }}>
                {mode === 'spacebar-reaction' ? 'Press SPACE to Start' : 'Click to Start'}
              </div>
              <div className="text-sm text-gray-500 mt-2">{config.instruction}</div>
            </div>
          )}

          {phase === 'waiting' && (
            <motion.div className="text-center" animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <div className="text-4xl mb-3">⏳</div>
              <div className="text-lg font-bold text-orange-400">Wait for it...</div>
              <div className="text-sm text-gray-500 mt-1">Don't click early!</div>
            </motion.div>
          )}

          {phase === 'ready' && (
            <motion.div
              className="text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="text-5xl mb-3">🟢</div>
              <div className="text-2xl font-black font-orbitron text-green-400">
                {mode === 'spacebar-reaction' ? 'PRESS SPACE!' : 'CLICK NOW!'}
              </div>
            </motion.div>
          )}

          {phase === 'early' && (
            <motion.div className="text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <div className="text-5xl mb-3">❌</div>
              <div className="text-xl font-bold text-pink-400">Too Early!</div>
              <div className="text-sm text-gray-500 mt-2">Click to try again</div>
            </motion.div>
          )}

          {phase === 'done' && (
            <div className="text-center">
              <div className="text-2xl font-black font-orbitron" style={{ color: ratingColor }}>{bestRT}ms</div>
              <div className="text-sm text-gray-400">Best Reaction</div>
              <NeonButton onClick={() => { setPhase('idle'); setHistory([]); setCurrentAttempt(0); }} variant="cyan" className="mt-4">
                Try Again
              </NeonButton>
            </div>
          )}
        </div>

        {/* Last reaction time */}
        {reactionTime && phase !== 'done' && (
          <div className="absolute top-4 right-4 text-right">
            <div className="text-lg font-bold" style={{ color: config.color }}>{reactionTime}ms</div>
            <div className="text-xs text-gray-500">last</div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Best</div>
          <div className="text-xl font-black font-orbitron" style={{ color: config.color }}>{bestRT || pb || '--'}{bestRT || pb ? 'ms' : ''}</div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Average</div>
          <div className="text-xl font-black font-orbitron text-white">{avgReaction || '--'}{avgReaction ? 'ms' : ''}</div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Attempts</div>
          <div className="text-xl font-black font-orbitron text-purple-400">{currentAttempt}/{attempts}</div>
        </GlassCard>
      </div>

      {/* History Chart */}
      {history.length > 1 && (
        <GlassCard className="p-4">
          <h3 className="text-sm text-gray-400 mb-3">📊 Reaction History</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={history.map((v, i) => ({ attempt: `#${i + 1}`, ms: v }))}>
              <XAxis dataKey="attempt" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0a0a1a', border: '1px solid rgba(0,245,255,0.2)', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="ms" fill={config.color} opacity={0.8} radius={[4, 4, 0, 0]} name="ms" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Rating Scale */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-gray-300 mb-3">📖 Reaction Rating Scale</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { range: '<100ms', label: 'Superhuman', color: '#ff0080' },
            { range: '<150ms', label: 'Godlike', color: '#ffd700' },
            { range: '<200ms', label: 'Pro Gamer', color: '#00f5ff' },
            { range: '<250ms', label: 'Fast', color: '#b400ff' },
            { range: '<300ms', label: 'Average', color: '#00ff88' },
            { range: '300ms+', label: 'Slow', color: '#64748b' },
          ].map(r => (
            <div key={r.range} className="p-2 rounded-lg" style={{ background: `${r.color}10` }}>
              <div className="text-xs font-bold" style={{ color: r.color }}>{r.range}</div>
              <div className="text-xs text-gray-600">{r.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <ResultModal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        onRetry={() => { setShowResult(false); setPhase('idle'); setHistory([]); setCurrentAttempt(0); }}
        title={config.name}
        score={bestRT}
        unit="ms"
        rating={rating}
        ratingColor={ratingColor}
        testType={mode}
        stats={[
          { label: 'Best', value: bestRT, unit: 'ms' },
          { label: 'Average', value: avgReaction, unit: 'ms' },
          { label: 'Attempts', value: attempts },
          { label: 'Worst', value: history.length ? Math.max(...history) : 0, unit: 'ms' },
        ]}
      />
    </div>
  );
};
