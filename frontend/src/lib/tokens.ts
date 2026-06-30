/** StockFlow design tokens — JS constants for programmatic use */

export const spacing = {
  1: 'var(--spacing-1)',
  2: 'var(--spacing-2)',
  3: 'var(--spacing-3)',
  4: 'var(--spacing-4)',
  6: 'var(--spacing-6)',
  8: 'var(--spacing-8)',
  12: 'var(--spacing-12)',
  16: 'var(--spacing-16)',
} as const;

export const duration = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.25,
} as const;

export const easing = {
  default: [0.4, 0, 0.2, 1] as const,
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
} as const;
