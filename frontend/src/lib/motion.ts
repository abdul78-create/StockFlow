import type { Transition, Variants } from 'framer-motion';
import { duration, easing } from './tokens';

/** StockFlow motion presets — subtle, no bounce, no flash */

export const transitions = {
  fast: {
    duration: duration.fast,
    ease: easing.default,
  } satisfies Transition,
  normal: {
    duration: duration.normal,
    ease: easing.default,
  } satisfies Transition,
  slow: {
    duration: duration.slow,
    ease: easing.default,
  } satisfies Transition,
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.fast,
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

// Micro-interactions
export const interact: Variants = {
  hover: {
    scale: 1.02,
    y: -2,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...transitions.normal, staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};
