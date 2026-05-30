import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { CPSTest } from './pages/tests/CPSTest';
import { ReactionTest } from './pages/tests/ReactionTest';
import { WPMTest } from './pages/tests/WPMTest';
import { AimTrainer } from './pages/tests/AimTrainer';
import { KeyboardTest } from './pages/tests/KeyboardTests';
import { BrainTest } from './pages/tests/BrainTests';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DailyChallengePage } from './pages/DailyChallengePage';
import { AchievementsPage } from './pages/AchievementsPage';
import type { TestMode } from './types';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function renderPage(mode: TestMode): React.ReactNode {
  switch (mode) {
    case 'home': return <HomePage />;
    
    // Click Tests
    case 'cps-test': return <CPSTest mode="cps-test" />;
    case 'jitter-click': return <CPSTest mode="jitter-click" />;
    case 'butterfly-click': return <CPSTest mode="butterfly-click" />;
    case 'drag-click': return <CPSTest mode="drag-click" />;
    case 'kohi-click': return <CPSTest mode="kohi-click" />;
    case 'badlion-click': return <CPSTest mode="badlion-click" />;
    case 'right-click': return <CPSTest mode="right-click" />;
    case 'double-click': return <CPSTest mode="double-click" />;
    case 'spacebar-cps': return <CPSTest mode="spacebar-cps" />;
    case 'stress-click': return <CPSTest mode="cps-test" />;
    
    // Reaction Tests
    case 'reaction-test': return <ReactionTest mode="reaction-test" />;
    case 'f1-reaction': return <ReactionTest mode="f1-reaction" />;
    case 'spacebar-reaction': return <ReactionTest mode="spacebar-reaction" />;
    case 'ping-reaction': return <ReactionTest mode="reaction-test" />;
    case 'audio-reaction': return <ReactionTest mode="audio-reaction" />;
    
    // Keyboard Tests
    case 'wpm-test': return <WPMTest />;
    case 'key-response': return <KeyboardTest mode="key-response" />;
    case 'wasd-test': return <KeyboardTest mode="wasd-test" />;
    case 'arrow-speed': return <KeyboardTest mode="arrow-speed" />;
    case 'memory-keys': return <KeyboardTest mode="memory-keys" />;
    
    // Aim Tests
    case 'aim-basic': return <AimTrainer mode="aim-basic" />;
    case 'aim-tracking': return <AimTrainer mode="aim-tracking" />;
    case 'aim-flick': return <AimTrainer mode="aim-flick" />;
    case 'aim-sniper': return <AimTrainer mode="aim-sniper" />;
    case 'aim-headshot': return <AimTrainer mode="aim-headshot" />;
    case 'aim-precision': return <AimTrainer mode="aim-precision" />;
    
    // Brain Tests
    case 'memory-game': return <BrainTest mode="memory-game" />;
    case 'pattern-recall': return <BrainTest mode="pattern-recall" />;
    case 'focus-test': return <BrainTest mode="focus-test" />;
    case 'peripheral-vision': return <BrainTest mode="peripheral-vision" />;
    
    // Other Pages
    case 'leaderboard': return <LeaderboardPage />;
    case 'profile': return <ProfilePage />;
    case 'settings': return <SettingsPage />;
    case 'achievements': return <AchievementsPage />;
    case 'daily-challenge': return <DailyChallengePage />;
    
    default: return <HomePage />;
  }
}

// Floating particles background
const FloatingParticles: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#00f5ff' : i % 3 === 1 ? '#b400ff' : '#00ff88',
            opacity: 0.3,
          }}
          animate={{
            y: [0, -800],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// FPS Counter
const FPSCounter: React.FC = () => {
  const [fps, setFPS] = React.useState(0);
  
  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let rafId: number;
    
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFPS(frames);
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 text-xs font-mono z-50 px-2 py-1 rounded" style={{ background: 'rgba(0,0,0,0.5)', color: fps > 50 ? '#00ff88' : '#ff6b00' }}>
      {fps} FPS
    </div>
  );
};

const App: React.FC = () => {
  const { currentMode, sidebarCollapsed, settings } = useGameStore();
  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div className="min-h-screen bg-[#050510] relative" style={{ fontSize: `${settings.uiScale}rem` }}>
      {/* Background effects */}
      <FloatingParticles />
      
      {/* Fixed gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00f5ff, transparent)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #b400ff, transparent)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <div style={{ marginLeft: sidebarWidth }}>
        <Header />
      </div>

      {/* Main Content */}
      <main
        className="relative z-10 transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: 52,
          minHeight: '100vh',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {renderPage(currentMode)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FPS Counter */}
      {settings.showFPS && <FPSCounter />}
    </div>
  );
};

export default App;
