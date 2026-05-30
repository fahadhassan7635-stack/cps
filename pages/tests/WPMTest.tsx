import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NeonButton } from '../../components/ui/NeonButton';
import { ResultModal } from '../../components/ui/ResultModal';
import { GlassCard } from '../../components/ui/GlassCard';
import { useGameStore } from '../../store/gameStore';

const wordList = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'game', 'speed', 'click', 'fast',
  'type', 'word', 'test', 'score', 'best', 'win', 'pro', 'skill', 'rank',
];

function generateWords(count: number): string[] {
  return Array.from({ length: count }, () => wordList[Math.floor(Math.random() * wordList.length)]);
}

function getWPMRating(wpm: number): { rating: string; color: string } {
  if (wpm >= 120) return { rating: 'LEGENDARY', color: '#ff0080' };
  if (wpm >= 90) return { rating: 'PROFESSIONAL', color: '#ffd700' };
  if (wpm >= 70) return { rating: 'ADVANCED', color: '#00f5ff' };
  if (wpm >= 50) return { rating: 'AVERAGE', color: '#b400ff' };
  if (wpm >= 30) return { rating: 'BEGINNER', color: '#ff6b00' };
  return { rating: 'LEARNING', color: '#64748b' };
}

export const WPMTest: React.FC = () => {
  const [words] = useState(() => generateWords(80));
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [input, setInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedTime, setSelectedTime] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [wordStatuses, setWordStatuses] = useState<('correct' | 'incorrect' | 'current' | 'pending')[]>(() => 
    Array(80).fill('pending').map((_, i) => i === 0 ? 'current' : 'pending')
  );
  const [keystrokes, setKeystrokes] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const { personalBests } = useGameStore();
  const pb = personalBests['wpm-test'];

  const reset = useCallback(() => {
    setPhase('idle');
    setInput('');
    setCurrentWordIndex(0);
    setCorrectWords(0);
    setIncorrectWords(0);
    setTimeLeft(selectedTime);
    setWpm(0);
    setKeystrokes(0);
    setAccuracy(100);
    setWordStatuses(Array(80).fill('pending').map((_, i) => i === 0 ? 'current' : 'pending'));
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [selectedTime]);

  useEffect(() => { reset(); }, [selectedTime]);

  const finishTest = useCallback((correct: number, _total: number, elapsed: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finalWPM = Math.round(correct / (elapsed / 60));
    setWpm(finalWPM);
    setPhase('done');
    setShowResult(true);
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (phase === 'idle') {
      setPhase('running');
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, selectedTime - elapsed);
        setTimeLeft(remaining);
        
        const currentWPM = Math.round(correctWords / (elapsed / 60));
        setWpm(currentWPM);

        if (remaining <= 0) {
          finishTest(correctWords, currentWordIndex, selectedTime);
        }
      }, 200);
    }

    if (value.endsWith(' ')) {
      const typed = value.trim();
      const isCorrect = typed === words[currentWordIndex];
      
      setWordStatuses(prev => {
        const next = [...prev];
        next[currentWordIndex] = isCorrect ? 'correct' : 'incorrect';
        if (currentWordIndex + 1 < words.length) next[currentWordIndex + 1] = 'current';
        return next;
      });

      if (isCorrect) {
        setCorrectWords(c => c + 1);
      } else {
        setIncorrectWords(ic => ic + 1);
      }

      const newIndex = currentWordIndex + 1;
      setCurrentWordIndex(newIndex);
      setInput('');

      if (newIndex >= words.length) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        finishTest(correctWords + (isCorrect ? 1 : 0), newIndex, elapsed);
      }
    } else {
      setInput(value);
      setKeystrokes(k => k + 1);
      
      const totalAttempts = correctWords + incorrectWords;
      const acc = totalAttempts > 0 ? Math.round((correctWords / totalAttempts) * 100) : 100;
      setAccuracy(acc);
    }
  }, [phase, words, currentWordIndex, correctWords, incorrectWords, selectedTime, finishTest]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const currentTyped = input;
  const currentWord = words[currentWordIndex];
  const isCurrentCorrectSoFar = currentWord?.startsWith(currentTyped);
  const { rating, color: ratingColor } = getWPMRating(wpm);

  const progress = ((selectedTime - timeLeft) / selectedTime) * 100;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⌨️</span>
          <div>
            <h1 className="text-2xl font-black font-orbitron text-orange-400">WPM Typing Test</h1>
            <p className="text-sm text-gray-500">Test your typing speed and accuracy</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[15, 30, 60, 120].map(t => (
            <button
              key={t}
              onClick={() => { reset(); setSelectedTime(t); }}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: selectedTime === t ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedTime === t ? '#ff6b00' : 'rgba(255,255,255,0.08)'}`,
                color: selectedTime === t ? '#ff6b00' : '#64748b',
              }}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">WPM</div>
          <div className="text-2xl font-black font-orbitron text-orange-400">{wpm}</div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Accuracy</div>
          <div className="text-2xl font-black font-orbitron text-green-400">{accuracy}%</div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Time</div>
          <div className="text-2xl font-black font-orbitron" style={{ color: timeLeft < 5 && phase === 'running' ? '#ff0080' : '#94a3b8' }}>
            {Math.ceil(timeLeft)}s
          </div>
        </GlassCard>
        <GlassCard className="p-3 text-center" animate={false}>
          <div className="text-xs text-gray-500">Best</div>
          <div className="text-2xl font-black font-orbitron text-yellow-400">{pb || '--'}{pb ? '' : ''}</div>
        </GlassCard>
      </div>

      {/* Progress */}
      {phase === 'running' && (
        <div className="w-full h-1.5 rounded-full bg-white/5">
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #ff6b00, #ff0080)', width: `${progress}%` }} animate={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Words Display */}
      <GlassCard
        className="p-6 cursor-text"
        animate={false}
        onClick={() => inputRef.current?.focus()}
      >
        <div
          ref={wordsContainerRef}
          className="text-xl leading-10 font-medium select-none"
          style={{ maxHeight: 160, overflow: 'hidden' }}
        >
          {words.map((word, i) => {
            const status = wordStatuses[i];
            const isCurrentWord = i === currentWordIndex;
            
            return (
              <span key={i} className="relative inline-block mr-2">
                {isCurrentWord ? (
                  word.split('').map((char, ci) => {
                    let charColor = '#64748b';
                    if (ci < currentTyped.length) {
                      charColor = currentTyped[ci] === char ? '#ffffff' : '#ff4444';
                    } else if (ci === currentTyped.length) {
                      charColor = '#00f5ff';
                    }
                    return (
                      <span key={ci} style={{ color: charColor, position: 'relative' }}>
                        {ci === currentTyped.length && (
                          <span className="typing-cursor" style={{ position: 'absolute', left: 0, top: 0 }} />
                        )}
                        {char}
                      </span>
                    );
                  })
                ) : (
                  <span style={{ color: status === 'correct' ? '#00ff88' : status === 'incorrect' ? '#ff4444' : '#334155' }}>
                    {word}
                  </span>
                )}
              </span>
            );
          })}
        </div>
        
        <input
          ref={inputRef}
          value={input}
          onChange={handleInput}
          disabled={phase === 'done'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 border text-white text-lg outline-none focus:border-orange-400 transition-colors"
          style={{ borderColor: phase === 'running' && !isCurrentCorrectSoFar && input ? '#ff4444' : 'rgba(255,255,255,0.1)' }}
          placeholder={phase === 'idle' ? 'Start typing to begin...' : ''}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-4 text-sm">
            <span className="text-green-400">✓ {correctWords} correct</span>
            <span className="text-red-400">✗ {incorrectWords} errors</span>
          </div>
          <NeonButton onClick={reset} variant="ghost" size="sm">Reset</NeonButton>
        </div>
      </GlassCard>

      {/* Rating Scale */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-gray-300 mb-3">📖 WPM Rating Scale</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { range: '1-30', label: 'Learning', color: '#64748b' },
            { range: '30-50', label: 'Beginner', color: '#ff6b00' },
            { range: '50-70', label: 'Average', color: '#b400ff' },
            { range: '70-90', label: 'Advanced', color: '#00f5ff' },
            { range: '90-120', label: 'Pro', color: '#ffd700' },
            { range: '120+', label: 'Legend', color: '#ff0080' },
          ].map(r => (
            <div key={r.range} className="p-2 rounded-lg" style={{ background: `${r.color}10` }}>
              <div className="text-xs font-bold" style={{ color: r.color }}>{r.range} WPM</div>
              <div className="text-xs text-gray-600">{r.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <ResultModal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        onRetry={() => { setShowResult(false); reset(); }}
        title="WPM Typing Test"
        score={wpm}
        unit="WPM"
        rating={rating}
        ratingColor={ratingColor}
        testType="wpm-test"
        stats={[
          { label: 'Accuracy', value: accuracy, unit: '%' },
          { label: 'Correct Words', value: correctWords },
          { label: 'Errors', value: incorrectWords },
          { label: 'Keystrokes', value: keystrokes },
        ]}
      />
    </div>
  );
};
