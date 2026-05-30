import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './NeonButton';
import { useGameStore } from '../../store/gameStore';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  title: string;
  score: number;
  unit: string;
  stats?: { label: string; value: string | number; unit?: string }[];
  rating?: string;
  ratingColor?: string;
  testType: string;
}

function getRatingEmoji(rating: string): string {
  const map: Record<string, string> = {
    'LEGENDARY': '👑',
    'GODLIKE': '⚡',
    'PRO': '🔥',
    'ADVANCED': '💎',
    'INTERMEDIATE': '⭐',
    'BEGINNER': '🌱',
    'KEEP TRYING': '💪',
  };
  return map[rating] || '🎮';
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen, onClose, onRetry, title, score, unit, stats, rating, ratingColor, testType
}) => {
  const { addScore, updatePB, addXP, personalBests } = useGameStore();
  const isPB = !personalBests[testType] || score > personalBests[testType];

  useEffect(() => {
    if (isOpen) {
      addScore({ testType, score, unit });
      updatePB(testType, score);
      const xpGain = Math.floor(score * 2) + 20;
      addXP(xpGain);
    }
  }, [isOpen]);

  const xpGain = Math.floor(score * 2) + 20;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'rgba(10,10,26,0.95)',
              border: '1px solid rgba(0,245,255,0.2)',
              boxShadow: '0 0 60px rgba(0,245,255,0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Glow background */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,245,255,0.1), transparent 70%)' }} />

            {/* Header */}
            <div className="text-center mb-6 relative">
              {isPB && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-2"
                  style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}
                >
                  🏆 NEW PERSONAL BEST!
                </motion.div>
              )}
              <h2 className="text-lg font-bold text-gray-300 mb-1">{title}</h2>
              
              {/* Main Score */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex items-end justify-center gap-2 my-4"
              >
                <span
                  className="text-6xl font-black font-orbitron"
                  style={{ color: '#00f5ff', textShadow: '0 0 30px rgba(0,245,255,0.6)' }}
                >
                  {typeof score === 'number' ? score.toFixed(score < 100 ? 2 : 0) : score}
                </span>
                <span className="text-2xl text-gray-400 mb-2">{unit}</span>
              </motion.div>

              {/* Rating */}
              {rating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    background: `${ratingColor}20`,
                    border: `1px solid ${ratingColor}50`,
                    color: ratingColor,
                  }}
                >
                  <span>{getRatingEmoji(rating)}</span>
                  <span>{rating}</span>
                </motion.div>
              )}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i + 0.3 }}
                    className="rounded-lg p-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="text-xs text-gray-500">{stat.label}</div>
                    <div className="text-sm font-bold text-white">
                      {stat.value} {stat.unit && <span className="text-gray-400 text-xs">{stat.unit}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* XP Gain */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mb-4 py-2 rounded-lg"
              style={{ background: 'rgba(180,0,255,0.08)', border: '1px solid rgba(180,0,255,0.15)' }}
            >
              <span className="text-purple-400 text-sm">✨ +{xpGain} XP earned</span>
            </motion.div>

            {/* Buttons */}
            <div className="flex gap-3">
              <NeonButton onClick={onRetry} variant="cyan" fullWidth size="lg">
                🔄 Try Again
              </NeonButton>
              <NeonButton onClick={onClose} variant="ghost" fullWidth size="lg">
                📊 Stats
              </NeonButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
