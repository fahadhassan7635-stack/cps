import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '../../components/ui/NeonButton';
import { ResultModal } from '../../components/ui/ResultModal';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGameStore } from '../../store/gameStore';

type KeyboardMode = 'key-response' | 'wasd-test' | 'arrow-speed' | 'memory-keys';

interface KeyboardTestProps {
  mode?: KeyboardMode;
}

const WASD_KEYS = ['W', 'A', 'S', 'D'];
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

const ALL_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

function generateSequence(length: number): string[] {
  return Array.from({ length }, () => ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)]);
}

export const KeyboardTest: React.FC<KeyboardTestProps> = ({ mode = 'key-response' }) => {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [currentKey, setCurrentKey] = useState<string>('');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [, setKeyPressCount] = useState<Record<string, number>>({});

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const keyTimerRef = useRef<number>(0);
  const { personalBests } = useGameStore();

  const modeConfig = {
    'key-response': { name: 'Key Response Test', icon: '⚡', color: '#00f5ff', desc: 'Press the highlighted key as fast as possible', timeLimit: 30 },
    'wasd-test': { name: 'WASD Speed Test', icon: '🎮', color: '#b400ff', desc: 'Press WASD keys as fast as possible', timeLimit: 30 },
    'arrow-speed': { name: 'Arrow Key Test', icon: '⬆️', color: '#00ff88', desc: 'Press arrow keys in sequence', timeLimit: 30 },
    'memory-keys': { name: 'Memory Key Sequence', icon: '🧠', color: '#ff6b00', desc: 'Memorize and repeat key sequences', timeLimit: 60 },
  };

  const config = modeConfig[mode];

  const spawnNewKey = useCallback(() => {
    if (mode === 'key-response') {
      const key = ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)];
      setCurrentKey(key);
      keyTimerRef.current = performance.now();
    } else if (mode === 'wasd-test') {
      const key = WASD_KEYS[Math.floor(Math.random() * WASD_KEYS.length)];
      setCurrentKey(key);
      keyTimerRef.current = performance.now();
    } else if (mode === 'arrow-speed') {
      const key = ARROW_KEYS[Math.floor(Math.random() * ARROW_KEYS.length)];
      setCurrentKey(key);
      keyTimerRef.current = performance.now();
    }
  }, [mode]);

  const startTest = useCallback(() => {
    setPhase('running');
    setScore(0);
    setErrors(0);
    setHistory([]);
    setKeyPressCount({});
    setTimeLeft(config.timeLimit);
    setSequenceIndex(0);
    
    if (mode === 'memory-keys') {
      const seq = generateSequence(8);
      setSequence(seq);
    } else {
      spawnNewKey();
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(intervalRef.current!);
          setPhase('done');
          setShowResult(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, [mode, config.timeLimit, spawnNewKey]);

  useEffect(() => {
    if (phase !== 'running') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const code = e.key;
      
      setPressedKeys(prev => new Set([...prev, code]));
      
      setKeyPressCount(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));

      if (mode === 'wasd-test' || mode === 'key-response') {
        if (key === currentKey || code === currentKey) {
          const rt = Math.round(performance.now() - keyTimerRef.current);
          setHistory(prev => [...prev, rt]);
          setReactionTime(rt);
          setScore(s => s + 1);
          spawnNewKey();
        } else if (WASD_KEYS.includes(key) || ALL_KEYS.includes(key)) {
          setErrors(er => er + 1);
        }
      } else if (mode === 'arrow-speed') {
        if (code === currentKey) {
          const rt = Math.round(performance.now() - keyTimerRef.current);
          setHistory(prev => [...prev, rt]);
          setScore(s => s + 1);
          spawnNewKey();
        } else if (ARROW_KEYS.includes(code)) {
          setErrors(er => er + 1);
        }
      } else if (mode === 'memory-keys') {
        if (sequence[sequenceIndex] && key === sequence[sequenceIndex]) {
          const newIndex = sequenceIndex + 1;
          setSequenceIndex(newIndex);
          setScore(s => s + 1);
          if (newIndex >= sequence.length) {
            const newSeq = generateSequence(Math.min(sequence.length + 1, 12));
            setSequence(newSeq);
            setSequenceIndex(0);
          }
        } else {
          setErrors(er => er + 1);
          setSequenceIndex(0);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, currentKey, mode, sequence, sequenceIndex, spawnNewKey]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const avgRT = history.length > 0 ? Math.round(history.reduce((a, b) => a + b) / history.length) : 0;
  const accuracy = (score + errors) > 0 ? Math.round(score / (score + errors) * 100) : 0;
  const progress = ((config.timeLimit - timeLeft) / config.timeLimit) * 100;

  const renderKeyboard = () => {
    if (mode === 'wasd-test') {
      return (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex justify-center">
            <KeyCap keyName="W" pressed={pressedKeys.has('w') || pressedKeys.has('W')} active={currentKey === 'W'} color={config.color} />
          </div>
          <div className="flex gap-3">
            {['A', 'S', 'D'].map(k => (
              <KeyCap key={k} keyName={k} pressed={pressedKeys.has(k.toLowerCase()) || pressedKeys.has(k)} active={currentKey === k} color={config.color} />
            ))}
          </div>
        </div>
      );
    }

    if (mode === 'arrow-speed') {
      return (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="flex justify-center">
            <KeyCap keyName="↑" pressed={pressedKeys.has('ArrowUp')} active={currentKey === 'ArrowUp'} color={config.color} />
          </div>
          <div className="flex gap-3">
            <KeyCap keyName="←" pressed={pressedKeys.has('ArrowLeft')} active={currentKey === 'ArrowLeft'} color={config.color} />
            <KeyCap keyName="↓" pressed={pressedKeys.has('ArrowDown')} active={currentKey === 'ArrowDown'} color={config.color} />
            <KeyCap keyName="→" pressed={pressedKeys.has('ArrowRight')} active={currentKey === 'ArrowRight'} color={config.color} />
          </div>
        </div>
      );
    }

    if (mode === 'memory-keys') {
      return (
        <div className="py-6 text-center">
          <div className="text-sm text-gray-500 mb-3">Sequence to type:</div>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {sequence.map((key, i) => (
              <motion.div
                key={`${key}-${i}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: i < sequenceIndex ? `${config.color}30` : i === sequenceIndex ? `${config.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i < sequenceIndex ? config.color : i === sequenceIndex ? config.color + '80' : 'rgba(255,255,255,0.08)'}`,
                  color: i < sequenceIndex ? config.color : '#94a3b8',
                }}
              >
                {key}
              </motion.div>
            ))}
          </div>
          <div className="text-gray-500 text-sm">Type the sequence above. Press: <span style={{ color: config.color }}>{sequence[sequenceIndex]}</span></div>
        </div>
      );
    }

    // Key response - show big key
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-sm text-gray-500 mb-4">Press this key:</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKey}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black"
            style={{
              background: `${config.color}15`,
              border: `3px solid ${config.color}`,
              color: config.color,
              boxShadow: `0 0 30px ${config.color}40`,
              fontFamily: 'Orbitron, sans-serif',
            }}
          >
            {currentKey}
          </motion.div>
        </AnimatePresence>
        {reactionTime && <div className="mt-3 text-sm text-gray-400">{reactionTime}ms</div>}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-black font-orbitron" style={{ color: config.color }}>{config.name}</h1>
            <p className="text-sm text-gray-500">{config.desc}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Score', value: score, color: config.color },
          { label: 'Accuracy', value: `${accuracy}%`, color: accuracy > 80 ? '#00ff88' : '#ff6b00' },
          { label: 'Avg RT', value: avgRT ? `${avgRT}ms` : '--', color: '#b400ff' },
          { label: 'Time', value: `${Math.ceil(timeLeft)}s`, color: '#94a3b8' },
        ].map(s => (
          <GlassCard key={s.label} className="p-3 text-center" animate={false}>
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-xl font-black font-orbitron" style={{ color: s.color }}>{s.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Progress */}
      {phase === 'running' && (
        <div className="w-full h-1.5 rounded-full bg-white/5">
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${config.color}, #ff0080)`, width: `${progress}%` }} animate={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Main Area */}
      <GlassCard
        className="overflow-hidden"
        style={{ border: `1px solid ${phase === 'running' ? config.color + '40' : 'rgba(255,255,255,0.06)'}` } as React.CSSProperties}
      >
        {phase === 'idle' ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-5xl mb-4">{config.icon}</div>
            <NeonButton onClick={startTest} variant={mode === 'key-response' ? 'cyan' : mode === 'wasd-test' ? 'purple' : mode === 'arrow-speed' ? 'green' : 'orange'} size="lg">
              Start Test
            </NeonButton>
            <p className="text-sm text-gray-500 mt-3">{config.desc}</p>
          </div>
        ) : (
          renderKeyboard()
        )}
      </GlassCard>

      <ResultModal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        onRetry={() => { setShowResult(false); setPhase('idle'); }}
        title={config.name}
        score={score}
        unit="pts"
        testType={mode}
        stats={[
          { label: 'Accuracy', value: accuracy, unit: '%' },
          { label: 'Avg Reaction', value: avgRT, unit: 'ms' },
          { label: 'Errors', value: errors },
          { label: 'Best', value: personalBests[mode] || score },
        ]}
      />
    </div>
  );
};

interface KeyCapProps {
  keyName: string;
  pressed: boolean;
  active: boolean;
  color: string;
}

const KeyCap: React.FC<KeyCapProps> = ({ keyName, pressed, active, color }) => (
  <motion.div
    animate={{ y: pressed ? 3 : 0 }}
    className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-black select-none"
    style={{
      background: pressed ? `${color}30` : active ? `${color}15` : 'rgba(255,255,255,0.04)',
      border: `2px solid ${pressed ? color : active ? color + '80' : 'rgba(255,255,255,0.1)'}`,
      color: pressed ? color : active ? color + 'cc' : '#64748b',
      boxShadow: pressed ? `0 0 20px ${color}60` : active ? `0 0 10px ${color}30` : 'none',
      fontFamily: 'Orbitron, sans-serif',
      transition: 'all 0.05s',
    }}
  >
    {keyName}
  </motion.div>
);
