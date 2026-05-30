import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: 'cyan' | 'purple' | 'green' | 'orange' | 'pink' | 'none';
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children, className, style, glow = 'none', hover = false, onClick, animate = true
}) => {
  const glowStyles: Record<string, string> = {
    cyan: '0 0 30px rgba(0,245,255,0.15), 0 0 60px rgba(0,245,255,0.05)',
    purple: '0 0 30px rgba(180,0,255,0.15), 0 0 60px rgba(180,0,255,0.05)',
    green: '0 0 30px rgba(0,255,136,0.15), 0 0 60px rgba(0,255,136,0.05)',
    orange: '0 0 30px rgba(255,107,0,0.15), 0 0 60px rgba(255,107,0,0.05)',
    pink: '0 0 30px rgba(255,0,128,0.15), 0 0 60px rgba(255,0,128,0.05)',
    none: 'none',
  };

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        onClick={onClick}
        className={cn(
          'glass rounded-xl',
          hover && 'glass-hover cursor-pointer',
          className
        )}
        style={{ boxShadow: glowStyles[glow], ...style }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-xl',
        hover && 'glass-hover cursor-pointer',
        className
      )}
      style={{ boxShadow: glowStyles[glow], ...style }}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  glow?: 'cyan' | 'purple' | 'green' | 'orange' | 'pink';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, unit, icon, glow = 'cyan', trend, trendValue
}) => {
  const colors = {
    cyan: { text: '#00f5ff', bg: 'rgba(0,245,255,0.05)', border: 'rgba(0,245,255,0.15)' },
    purple: { text: '#b400ff', bg: 'rgba(180,0,255,0.05)', border: 'rgba(180,0,255,0.15)' },
    green: { text: '#00ff88', bg: 'rgba(0,255,136,0.05)', border: 'rgba(0,255,136,0.15)' },
    orange: { text: '#ff6b00', bg: 'rgba(255,107,0,0.05)', border: 'rgba(255,107,0,0.15)' },
    pink: { text: '#ff0080', bg: 'rgba(255,0,128,0.05)', border: 'rgba(255,0,128,0.15)' },
  };

  const c = colors[glow];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full -mr-8 -mt-8 opacity-10" style={{ background: c.text, filter: 'blur(20px)' }} />
      
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold font-orbitron" style={{ color: c.text }}>{value}</span>
        {unit && <span className="text-sm text-gray-400 mb-0.5">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </div>
      )}
    </motion.div>
  );
};
