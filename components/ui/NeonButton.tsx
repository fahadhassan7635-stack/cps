import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'cyan' | 'purple' | 'green' | 'orange' | 'pink' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children, onClick, variant = 'cyan', size = 'md', disabled, className, fullWidth, type = 'button'
}) => {
  const variants = {
    cyan: {
      bg: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,128,255,0.15))',
      border: 'rgba(0,245,255,0.4)',
      text: '#00f5ff',
      shadow: '0 0 20px rgba(0,245,255,0.3)',
      hoverShadow: '0 0 30px rgba(0,245,255,0.5)',
    },
    purple: {
      bg: 'linear-gradient(135deg, rgba(180,0,255,0.15), rgba(255,0,128,0.15))',
      border: 'rgba(180,0,255,0.4)',
      text: '#b400ff',
      shadow: '0 0 20px rgba(180,0,255,0.3)',
      hoverShadow: '0 0 30px rgba(180,0,255,0.5)',
    },
    green: {
      bg: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,200,100,0.15))',
      border: 'rgba(0,255,136,0.4)',
      text: '#00ff88',
      shadow: '0 0 20px rgba(0,255,136,0.3)',
      hoverShadow: '0 0 30px rgba(0,255,136,0.5)',
    },
    orange: {
      bg: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,50,0,0.15))',
      border: 'rgba(255,107,0,0.4)',
      text: '#ff6b00',
      shadow: '0 0 20px rgba(255,107,0,0.3)',
      hoverShadow: '0 0 30px rgba(255,107,0,0.5)',
    },
    pink: {
      bg: 'linear-gradient(135deg, rgba(255,0,128,0.15), rgba(255,0,80,0.15))',
      border: 'rgba(255,0,128,0.4)',
      text: '#ff0080',
      shadow: '0 0 20px rgba(255,0,128,0.3)',
      hoverShadow: '0 0 30px rgba(255,0,128,0.5)',
    },
    ghost: {
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.1)',
      text: '#94a3b8',
      shadow: 'none',
      hoverShadow: '0 0 15px rgba(255,255,255,0.1)',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const v = variants[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={cn(
        'rounded-lg font-semibold font-rajdhani tracking-wide transition-all duration-200 relative overflow-hidden',
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.text,
        boxShadow: v.shadow,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = v.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = v.shadow;
      }}
    >
      {children}
    </motion.button>
  );
};
