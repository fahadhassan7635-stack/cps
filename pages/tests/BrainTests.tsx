import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from '../../components/ui/NeonButton';
import { ResultModal } from '../../components/ui/ResultModal';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGameStore } from '../../store/gameStore';

type BrainMode = 'memory-game' | 'pattern-recall' | 'focus-test' | 'peripheral-vision';

interface BrainTestProps {
  mode?: BrainMode;
}

const GRID_COLORS = ['#00f5ff', '#b400ff', '#00ff88', '#ff6b00', '#ff0080', '#ffd700'];

function generatePattern(size: number, count: number): number[] {
  const positions = new Set<number>();
  while (positions.size < count) {
    positions.add(Math.floor(Math.random() * size));
  }
  return Array.from(positions);
}

export const BrainTest: React.FC<BrainTestProps> = ({ mode = 'memory-game' }) => {
  const [phase, setPhase] = useState<'idle' | 'memorize' | 'recall' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [showPattern, setShowPattern] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [focusTarget, setFocusTarget] = useState({ x: 50, y: 50 });
  const [focusScore, setFocusScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gridSize] = useState(9);

  const { personalBests } = useGameStore();

  const modeConfig = {
    'memory-game': { name: 'Memory Tile Game', icon: '🧩', color: '#00f5ff', desc: 'Memorize and repeat the pattern' },
    'pattern-recall': { name: 'Pattern Recall', icon: '🔷', color: '#b400ff', desc: 'Remember and recreate patterns' },
    'focus-test': { name: 'Focus Stability Test', icon: '🎯', color: '#00ff88', desc: 'Keep your cursor on the moving target' },
    'peripheral-vision': { name: 'Peripheral Vision', icon: '👁️', color: '#ff6b00', desc: 'Detect targets in your peripheral vision' },
  };

  const config = modeConfig[mode];

  const startMemoryRound = useCallback(() => {
    const count = Math.min(2 + level, 8);
    const size = mode === 'pattern-recall' ? 16 : gridSize;
    const newPattern = generatePattern(size, count);
    setPattern(newPattern);
    setPlayerPattern([]);
    setShowPattern(true);
    setPhase('memorize');

    const showTime = Math.max(1000, 2500 - level * 200);
    setTimeout(() => {
      setShowPattern(false);
      setPhase('recall');
    }, showTime);
  }, [level, mode, gridSize]);

  const startFocusTest = useCallback(() => {
    setPhase('memorize');
    setFocusScore(0);
    setTimeLeft(30);
    
    const move = () => {
      setFocusTarget({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      });
    };

    const moveInterval = setInterval(move, 1500);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(moveInterval);
          clearInterval(timer);
          setPhase('done');
          setShowResult(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, []);

  const startTest = useCallback(() => {
    setScore(0);
    setLevel(1);
    setLives(3);
    setStreak(0);

    if (mode === 'focus-test' || mode === 'peripheral-vision') {
      startFocusTest();
    } else {
      startMemoryRound();
    }
  }, [mode, startMemoryRound, startFocusTest]);

  const handleTileClick = useCallback((index: number) => {
    if (phase !== 'recall') return;
    
    const newPattern = [...playerPattern, index];
    setPlayerPattern(newPattern);

    if (newPattern[newPattern.length - 1] !== pattern[newPattern.length - 1]) {
      // Wrong tile
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      if (newLives <= 0) {
        setPhase('done');
        setShowResult(true);
      } else {
        setTimeout(() => startMemoryRound(), 800);
      }
      return;
    }

    if (newPattern.length === pattern.length) {
      // Correct!
      const points = pattern.length * 10 * (1 + level * 0.1);
      setScore(s => s + Math.round(points));
      setStreak(s => s + 1);
      setLevel(l => l + 1);
      setTimeout(() => startMemoryRound(), 600);
    }
  }, [phase, playerPattern, pattern, lives, level, startMemoryRound]);

  const handleFocusClick = useCallback(() => {
    setFocusScore(s => s + 10);
  }, []);

  const getGridCols = () => mode === 'pattern-recall' ? 4 : 3;
  const currentGridSize = mode === 'pattern-recall' ? 16 : 9;

  const pb = personalBests[mode];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{config.icon}</span>
        <div>
          <h1 className="text-2xl font-black font-orbitron" style={{ color: config.color }}>{config.name}</h1>
          <p className="text-sm text-gray-500">{config.desc}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Score', value: score, color: config.color },
          { label: 'Level', value: level, color: '#ffd700' },
          { label: 'Lives', value: '❤️'.repeat(Math.max(0, lives)), color: '#ff0080' },
          { label: 'Streak', value: streak, color: '#00ff88' },
        ].map(s => (
          <GlassCard key={s.label} className="p-3 text-center" animate={false}>
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-xl font-black font-orbitron" style={{ color: s.color }}>{s.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Main Game Area */}
      <GlassCard className="p-6" animate={false}>
        {phase === 'idle' && (
          <div className="flex flex-col items-center py-8">
            <div className="text-5xl mb-4">{config.icon}</div>
            <NeonButton onClick={startTest} variant="cyan" size="lg">Start Game</NeonButton>
            <p className="text-sm text-gray-500 mt-3">{config.desc}</p>
          </div>
        )}

        {(mode === 'memory-game' || mode === 'pattern-recall') && phase !== 'idle' && (
          <div>
            <div className="text-center mb-4">
              {phase === 'memorize' && showPattern && (
                <motion.div className="text-orange-400 font-bold text-sm" animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                  Memorize the pattern!
                </motion.div>
              )}
              {phase === 'recall' && (
                <div className="text-cyan-400 font-bold text-sm">
                  Repeat the pattern! ({playerPattern.length}/{pattern.length})
                </div>
              )}
            </div>

            <div
              className={`grid gap-3 max-w-xs mx-auto`}
              style={{ gridTemplateColumns: `repeat(${getGridCols()}, 1fr)` }}
            >
              {Array.from({ length: currentGridSize }).map((_, i) => {
                const isInPattern = pattern.includes(i);
                const isPlayed = playerPattern.includes(i);
                const colorIdx = pattern.indexOf(i) % GRID_COLORS.length;

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleTileClick(i)}
                    whileHover={phase === 'recall' ? { scale: 1.05 } : undefined}
                    whileTap={phase === 'recall' ? { scale: 0.95 } : undefined}
                    className="aspect-square rounded-xl"
                    style={{
                      background: (showPattern && isInPattern)
                        ? `${GRID_COLORS[colorIdx]}40`
                        : isPlayed
                        ? `${config.color}20`
                        : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${(showPattern && isInPattern) ? GRID_COLORS[colorIdx] : isPlayed ? config.color : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: (showPattern && isInPattern) ? `0 0 15px ${GRID_COLORS[colorIdx]}60` : 'none',
                      cursor: phase === 'recall' ? 'pointer' : 'default',
                    }}
                    animate={{
                      scale: showPattern && isInPattern ? [1, 1.05, 1] : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {mode === 'focus-test' && phase === 'memorize' && (
          <div className="relative" style={{ height: 300 }}>
            <div className="absolute top-2 right-2 text-sm" style={{ color: config.color }}>
              {Math.ceil(timeLeft)}s | +{focusScore}pts
            </div>
            <motion.button
              className="absolute w-14 h-14 rounded-full flex items-center justify-center cursor-crosshair"
              style={{
                left: `${focusTarget.x}%`,
                top: `${focusTarget.y}%`,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${config.color}60, ${config.color}20)`,
                border: `2px solid ${config.color}`,
                boxShadow: `0 0 20px ${config.color}60`,
              }}
              animate={{ left: `${focusTarget.x}%`, top: `${focusTarget.y}%` }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              onClick={handleFocusClick}
              whileTap={{ scale: 0.9 }}
            >
              🎯
            </motion.button>
          </div>
        )}

        {mode === 'peripheral-vision' && phase === 'memorize' && (
          <div className="relative" style={{ height: 300 }}>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-2">👁️</div>
                <div className="text-sm text-gray-500">Look at the center cross, click targets in your periphery</div>
                <div className="text-4xl mt-4">+</div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      <ResultModal
        isOpen={showResult}
        onClose={() => { setShowResult(false); setPhase('idle'); }}
        onRetry={() => { setShowResult(false); startTest(); }}
        title={config.name}
        score={score}
        unit="pts"
        testType={mode}
        stats={[
          { label: 'Level Reached', value: level },
          { label: 'Best Streak', value: streak },
          { label: 'Personal Best', value: pb || score },
          { label: 'Lives Left', value: lives },
        ]}
      />
    </div>
  );
};
