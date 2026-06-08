import type { FC } from 'react';

/* ─── Enemy silhouettes (SVG inline — pas d'équivalent Kenney) ─── */

export const EnemyFear: FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={0.08}>
    <circle cx="60" cy="50" r="35" stroke="#8b5cf6" strokeWidth="1" fill="none" />
    <circle cx="60" cy="50" r="25" stroke="#8b5cf6" strokeWidth="0.5" fill="none" />
    <path d="M40 40 L50 45 L40 50" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" />
    <path d="M80 40 L70 45 L80 50" stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" />
    <path d="M45 75 Q60 85 75 75" stroke="#8b5cf6" strokeWidth="1" fill="none" strokeLinecap="round" />
  </svg>
);

export const EnemyAddiction: FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={0.08}>
    <rect x="25" y="25" width="70" height="70" rx="8" stroke="#ef4444" strokeWidth="1" fill="none" />
    <line x1="35" y1="45" x2="85" y2="45" stroke="#ef4444" strokeWidth="0.5" />
    <line x1="35" y1="55" x2="85" y2="55" stroke="#ef4444" strokeWidth="0.5" />
    <line x1="35" y1="65" x2="85" y2="65" stroke="#ef4444" strokeWidth="0.5" />
    <line x1="55" y1="25" x2="55" y2="95" stroke="#ef4444" strokeWidth="0.3" />
  </svg>
);

export const EnemyPride: FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={0.08}>
    <path d="M60 20 L80 45 L70 50 L90 70 L70 75 L80 90 L60 80 L40 90 L50 75 L30 70 L50 50 L40 45 Z" stroke="#dc2626" strokeWidth="1" fill="none" />
    <line x1="45" y1="55" x2="75" y2="55" stroke="#dc2626" strokeWidth="0.5" />
    <line x1="50" y1="62" x2="70" y2="62" stroke="#dc2626" strokeWidth="0.5" />
  </svg>
);

export const EnemyRejection: FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={0.08}>
    <circle cx="60" cy="45" r="20" stroke="#6b7280" strokeWidth="1" fill="none" />
    <line x1="48" y1="88" x2="60" y2="68" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
    <line x1="72" y1="88" x2="60" y2="68" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
    <path d="M35 95 Q60 105 85 95" stroke="#6b7280" strokeWidth="0.5" fill="none" />
  </svg>
);

export const EnemyBattle: FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={0.08}>
    <path d="M60 20 L75 50 L60 40 L45 50 Z" stroke="#f97316" strokeWidth="1" fill="none" />
    <path d="M60 35 L75 65 L60 55 L45 65 Z" stroke="#f97316" strokeWidth="0.8" fill="none" />
    <path d="M60 50 L75 80 L60 70 L45 80 Z" stroke="#f97316" strokeWidth="0.5" fill="none" />
  </svg>
);

export const EnemyDoubt: FC<{ size?: number }> = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" opacity={0.08}>
    <circle cx="60" cy="50" r="30" stroke="#94a3b8" strokeWidth="0.8" fill="none" strokeDasharray="4 4" />
    <circle cx="60" cy="50" r="20" stroke="#94a3b8" strokeWidth="0.5" fill="none" strokeDasharray="3 3" />
    <circle cx="60" cy="50" r="10" stroke="#94a3b8" strokeWidth="0.3" fill="none" strokeDasharray="2 2" />
    <line x1="30" y1="50" x2="90" y2="50" stroke="#94a3b8" strokeWidth="0.3" opacity={0.3} />
    <line x1="60" y1="20" x2="60" y2="80" stroke="#94a3b8" strokeWidth="0.3" opacity={0.3} />
  </svg>
);
