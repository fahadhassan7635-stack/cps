import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '../../components/ui/NeonButton';
import { ResultModal } from '../../components/ui/ResultModal';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGameStore } from '../../store/gameStore';

type AimMode = 'aim-basic' | 'aim-tracking' | 'aim-flick' | 'aim-sniper' | 'aim-headshot' | 'aim-precision';

interface AimTrainerProps {
  mode?: AimMode;
}

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  spawnTime: number;
}

interface HeatmapPoint {
  x: number;
  y: number;
  hit: boolean;
}

const modeConfig: Record<AimMode, { name: string; desc: string; icon: string; color: string; targetSize: [number, number]; targets: number; timeLimit: number; moveTargets: boolean }> = {
  'aim-basic': { name: 'Basic Aim', desc: 'Click targets as they appear', icon: '🎯', color: '#00f5ff', targetSize: [50, 70], targets: 20, timeLimit: 60, moveTargets: false },
  'aim-tracking': { name: 'Tracking Aim', desc: 'Follow the moving target', icon: '👁️', color: '#b400ff', targetSize: [60, 80], targets: 15, timeLimit: 30, moveTargets: true },
  'aim-flick': { name: 'Flick Shot', desc: 'Quick flick to distant targets', icon: '⚡', color: '#ff0080', targetSize: [35, 55], targets: 20, timeLimit: 45, moveTargets: false },
  'aim-sniper': { name: 'Sniper Mode', desc: 'Small targets, high precision', icon: '🔭', color: '#00ff88', targetSize: [20, 35], targets: 15, timeLimit: 60, moveTargets: false },
  'aim-headshot': { name: 'Headshot Mode', desc: 'Click only the head target', icon: '💀', color: '#ff6b00', targetSize: [25, 40], targets: 20, timeLimit: 60, moveTargets: false },
  'aim-precision': { name: 'Precision Test', desc: 'Tiny targets, maximum accuracy', icon: '✳️', color: '#ffd700', targetSize: [15, 25], targets: 15, timeLimit: 90, moveTargets: false },
};

function randomPos(areaW: number, areaH: number, size: number): { x: number; y: number } {
  return {
    x: size / 2 + Math.random() * (areaW - size),
    y: size / 2 + Math.random() * (areaH - size),
  };
}

export const AimTrainer: React.FC<AimTrainerProps> = ({ mode = 'aim-basic' }) => {
  const config = modeConfig[mode];
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [showResult, setShowResult] = useState(false);
  const [hitTimes, setHitTimes] = useState<number[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([]);
  const [trackingPos, setTrackingPos] = useState({ x: 50, y: 50 });

  const areaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackingAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastHitTimeRef = useRef<number>(0);
  const targetIdRef = useRef(0);
  const { personalBests } = useGameStore();

  const getAreaSize = () => {
    const area = areaRef.current;
    return area ? { w: area.clientWidth, h: area.clientHeight } : { w: 600, h: 400 };
  };

  const spawnTarget = useCallback(() => {
    const { w, h } = getAreaSize();
    const size = config.targetSize[0] + Math.random() * (config.targetSize[1] - config.targetSize[0]);
    const { x, y } = randomPos(w, h, size);
    const colors = [config.color, '#ff0080', '#ffd700', '#00ff88'];
    
    setTargets(prev => [...prev.slice(-3), {
      id: targetIdRef.current++,
      x, y, size,
      color: colors[Math.floor(Math.random() * colors.length)],
      spawnTime: Date.now(),
    }]);
  }, [config]);

  const startTracking = useCallback(() => {
    if (!config.moveTargets) return;
    let angle = 0;
    const { w, h } = getAreaSize();
    trackingAnimRef.current = setInterval(() => {
      angle += 0.03;
      const cx = w / 2, cy = h / 2;
      const rx = cx * 0.4, ry = cy * 0.4;
      setTrackingPos({
        x: cx + rx * Math.cos(angle) + (Math.random() - 0.5) * 30,
        y: cy + ry * Math.sin(angle * 1.3) + (Math.random() - 0.5) * 20,
      });
    }, 50);
  }, [config.moveTargets]);

  const startTest = useCallback(() => {
    setPhase('running');
    setScore(0);
    setMisses(0);
    setTotalAttempts(0);
    setHitTimes([]);
    setHeatmap([]);
    setTimeLeft(config.timeLimit);
    
    spawnTarget();
    startTracking();

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(intervalRef.current!);
          if (trackingAnimRef.current) clearInterval(trackingAnimRef.current);
          setPhase('done');
          setShowResult(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  }, [config.timeLimit, spawnTarget, startTracking]);

  const handleTargetClick = useCallback((e: React.MouseEvent, target: Target) => {
    e.stopPropagation();
    const now = Date.now();
    const ttk = lastHitTimeRef.current ? now - lastHitTimeRef.current : 0;
    lastHitTimeRef.current = now;
    
    const rect = areaRef.current?.getBoundingClientRect();
    if (rect) {
      setHeatmap(prev => [...prev, {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
        hit: true,
      }]);
    }

    setScore(s => s + 1);
    setTotalAttempts(t => t + 1);
    if (ttk > 0) setHitTimes(prev => [...prev, ttk]);
    
    setTargets(prev => prev.filter(t => t.id !== target.id));
    if (!config.moveTargets) spawnTarget();
  }, [spawnTarget, config.moveTargets]);

  const handleAreaClick = useCallback((e: React.MouseEvent) => {
    if (phase !== 'running') return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (rect) {
      setHeatmap(prev => [...prev, {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
        hit: false,
      }]);
    }
    setMisses(m => m + 1);
    setTotalAttempts(t => t + 1);
  }, [phase]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (trackingAnimRef.current) clearInterval(trackingAnimRef.current);
  }, []);

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
  const avgTTK = hitTimes.length > 0 ? Math.round(hitTimes.reduce((a, b) => a + b) / hitTimes.length) : 0;
  const progress = ((config.timeLimit - timeLeft) / config.timeLimit) * 100;
  const pb = personalBests[mode];

  function getAccRating(acc: number): { rating: string; color: string } {
    if (acc >= 95) return { rating: 'PERFECT', color: '#ff0080' };
    if (acc >= 85) return { rating: 'EXCELLENT', color: '#ffd700' };
    if (acc >= 75) return { rating: 'GOOD', color: '#00f5ff' };
    if (acc >= 60) return { rating: 'AVERAGE', color: '#b400ff' };
    return { rating: 'NEEDS WORK', color: '#64748b' };
  }
  const { rating, color: ratingColor } = getAccRating(accuracy);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-black font-orbitron" style={{ color: config.color }}>{config.name}</h1>
            <p className="text-sm text-gray-500">{config.desc}</p>
          </div>
        </div>
        {phase !== 'idle' && (
          <NeonButton onClick={() => { setPhase('idle'); if (intervalRef.current) clearInterval(intervalRef.current); if (trackingAnimRef.current) clearInterval(trackingAnimRef.current); }} variant="ghost" size="sm">
            Quit
          </NeonButton>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'Score', value: score, color: config.color },
          { label: 'Accuracy', value: `${accuracy}%`, color: accuracy > 75 ? '#00ff88' : '#ff6b00' },
          { label: 'Misses', value: misses, color: '#ff0080' },
          { label: 'Avg TTK', value: avgTTK ? `${avgTTK}ms` : '--', color: '#b400ff' },
          { label: 'Time', value: `${Math.ceil(timeLeft)}s`, color: timeLeft < 5 && phase === 'running' ? '#ff0080' : '#94a3b8' },
        ].map(s => (
          <GlassCard key={s.label} className="p-2 text-center" animate={false}>
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

      {/* Aim Area */}
      <div
        ref={areaRef}
        className="relative rounded-2xl overflow-hidden cursor-crosshair"
        style={{
          height: 380,
          background: 'rgba(0,0,0,0.5)',
          border: `2px solid ${phase === 'running' ? config.color : 'rgba(255,255,255,0.06)'}`,
          boxShadow: phase === 'running' ? `0 0 40px ${config.color}15` : 'none',
        }}
        onClick={phase === 'idle' ? startTest : handleAreaClick}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        
        {/* Heatmap dots */}
        {heatmap.slice(-50).map((point, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)',
              background: point.hit ? 'rgba(0,255,136,0.3)' : 'rgba(255,0,128,0.3)',
              boxShadow: point.hit ? '0 0 4px rgba(0,255,136,0.5)' : '0 0 4px rgba(255,0,128,0.5)',
            }}
          />
        ))}
        
        {phase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <div className="text-6xl mb-4 text-center">{config.icon}</div>
              <div className="text-xl font-bold font-orbitron text-center" style={{ color: config.color }}>Click to Start</div>
              <div className="text-sm text-gray-500 text-center mt-2">{config.desc}</div>
            </motion.div>
          </div>
        )}

        {/* Targets */}
        <AnimatePresence>
          {phase === 'running' && !config.moveTargets && targets.map(target => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute rounded-full cursor-crosshair flex items-center justify-center"
              style={{
                width: target.size,
                height: target.size,
                left: target.x - target.size / 2,
                top: target.y - target.size / 2,
                background: `radial-gradient(circle, ${target.color}60, ${target.color}20)`,
                border: `2px solid ${target.color}`,
                boxShadow: `0 0 15px ${target.color}60`,
              }}
              onClick={(e) => handleTargetClick(e, target)}
            >
              <div className="w-1/3 h-1/3 rounded-full" style={{ background: target.color }} />
            </motion.div>
          ))}

          {phase === 'running' && config.moveTargets && (
            <motion.div
              className="absolute rounded-full cursor-crosshair flex items-center justify-center"
              style={{
                width: 60,
                height: 60,
                left: trackingPos.x - 30,
                top: trackingPos.y - 30,
                background: `radial-gradient(circle, ${config.color}60, ${config.color}20)`,
                border: `2px solid ${config.color}`,
                boxShadow: `0 0 20px ${config.color}80`,
              }}
              animate={{ left: trackingPos.x - 30, top: trackingPos.y - 30 }}
              transition={{ duration: 0.05 }}
              onClick={(e) => handleTargetClick(e, { id: -1, x: trackingPos.x, y: trackingPos.y, size: 60, color: config.color, spawnTime: Date.now() })}
            >
              <div className="w-1/3 h-1/3 rounded-full" style={{ background: config.color }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats overlay during play */}
        {phase === 'running' && (
          <div className="absolute top-3 right-3 text-right">
            <div className="text-xs text-gray-500">Accuracy</div>
            <div className="text-2xl font-bold font-orbitron" style={{ color: accuracy > 75 ? '#00ff88' : '#ff6b00' }}>{accuracy}%</div>
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      {heatmap.length > 0 && (
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Hit</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />Miss</span>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-gray-300 mb-2">🎯 Accuracy Ratings</h3>
          <div className="space-y-1">
            {[
              { range: '95%+', label: 'Perfect', color: '#ff0080' },
              { range: '85-95%', label: 'Excellent', color: '#ffd700' },
              { range: '75-85%', label: 'Good', color: '#00f5ff' },
              { range: '60-75%', label: 'Average', color: '#b400ff' },
              { range: '<60%', label: 'Needs Work', color: '#64748b' },
            ].map(r => (
              <div key={r.range} className="flex items-center justify-between text-xs">
                <span style={{ color: r.color }}>{r.range}</span>
                <span className="text-gray-500">{r.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-sm font-bold text-gray-300 mb-2">📊 Session Stats</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Targets Hit</span><span className="text-green-400">{score}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Misses</span><span className="text-red-400">{misses}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Accuracy</span><span style={{ color: config.color }}>{accuracy}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Avg TTK</span><span className="text-purple-400">{avgTTK}ms</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Personal Best</span><span className="text-yellow-400">{pb ? `${pb}` : '--'}</span></div>
          </div>
        </GlassCard>
      </div>

      <ResultModal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        onRetry={() => { setShowResult(false); setPhase('idle'); }}
        title={config.name}
        score={accuracy}
        unit="%"
        rating={rating}
        ratingColor={ratingColor}
        testType={mode}
        stats={[
          { label: 'Targets Hit', value: score },
          { label: 'Misses', value: misses },
          { label: 'Avg TTK', value: avgTTK, unit: 'ms' },
          { label: 'Best Acc', value: pb ? `${pb}%` : `${accuracy}%` },
        ]}
      />
    </div>
  );
};
