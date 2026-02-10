/**
 * Espresso Image Pipeline - Configuration
 */

import type { StyleVariation } from './types';

export const CONFIG = {
  // Model configuration
  models: {
    analyzer: 'gemini-2.5-flash',           // Fast, good at analysis
    planner: 'gemini-2.5-flash',            // Fast, good at reasoning
    editor: 'gemini-2.5-flash-image',       // Nano Banana - image generation
    critic: 'gemini-2.5-flash',             // Fast, can compare images
    stepValidator: 'gemini-2.5-flash',
  },
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    intensityReductionPerRetry: 20, // reduce by 20% each retry
    delayBetweenRetries: 1000, // ms
  },

  sequential: {
    maxRetriesPerStep: 3,
    parallelPipelines: 5,
    editOrder: ['eyeContact', 'posture', 'angle', 'lighting'] as const,
  },

  validation: {
    minNaturalnessScore: 60,
    requireIdentityMatch: true,
  },
  
  // Quality thresholds
  thresholds: {
    passScore: 75,      // score >= 75 = pass
    retryMinScore: 50,  // score 50-74 = retry
    // score < 50 = fail
  },
  
  // Critic score weights
  criticWeights: {
    identityPreservation: 0.35,
    editAccuracy: 0.25,
    naturalness: 0.25,
    technicalQuality: 0.15,
  },
  
  // Timeouts in milliseconds
  timeouts: {
    analysis: 30000,    // 30s
    planning: 30000,    // 30s
    editing: 120000,    // 2min per image
    critique: 30000,    // 30s
  },
  
  // Generation settings
  generation: {
    parallelVariations: true,
    numberOfVariations: 5,
    delayBetweenApiCalls: 500, // ms - to avoid rate limiting
  },
};

// Style variations for the 5 output images
export const STYLE_VARIATIONS: StyleVariation[] = [
  {
    name: 'natural',
    description: 'Minimal editing, most authentic look. Preserves the original feel while making subtle improvements.',
    adjustments: {
      intensityMultiplier: 0.7,
      colorTempShift: 0,
      contrastAdjust: 0,
      clarityAdjust: 5,
    },
  },
  {
    name: 'professional',
    description: 'Corporate headshot quality. Clean, polished, suitable for LinkedIn or company profiles.',
    adjustments: {
      intensityMultiplier: 1.0,
      colorTempShift: 0,
      contrastAdjust: 5,
      clarityAdjust: 10,
    },
  },
  {
    name: 'editorial',
    description: 'Magazine-ready, refined details. Higher contrast and refined details for a striking look.',
    adjustments: {
      intensityMultiplier: 1.2,
      colorTempShift: -100,
      contrastAdjust: 10,
      clarityAdjust: 15,
    },
  },
  {
    name: 'warm',
    description: 'Friendly, approachable, warm tones. Perfect for personal branding and social media.',
    adjustments: {
      intensityMultiplier: 0.9,
      colorTempShift: 300,
      contrastAdjust: 0,
      clarityAdjust: 5,
    },
  },
  {
    name: 'cool',
    description: 'Modern, sleek, cooler tones. Contemporary aesthetic with crisp, clean feel.',
    adjustments: {
      intensityMultiplier: 1.0,
      colorTempShift: -200,
      contrastAdjust: 5,
      clarityAdjust: 10,
    },
  },
];

export const VARIATION_PROFILES = [
  {
    id: 'balanced',
    label: 'Balanced',
    intensityMultiplier: 1.0,
    promptHint: 'Keep edits balanced and natural.',
  },
  {
    id: 'subtle',
    label: 'Subtle',
    intensityMultiplier: 0.8,
    promptHint: 'Make smaller, more conservative changes.',
  },
  {
    id: 'strong',
    label: 'Strong',
    intensityMultiplier: 1.15,
    promptHint: 'Apply slightly stronger edits while preserving identity.',
  },
  {
    id: 'crisp',
    label: 'Crisp',
    intensityMultiplier: 1.0,
    promptHint: 'Focus on clarity and precision without over-editing.',
  },
  {
    id: 'soft',
    label: 'Soft',
    intensityMultiplier: 0.9,
    promptHint: 'Keep edits gentle with softer transitions.',
  },
] as const;

// Estimated times for progress UI (in seconds)
export const ESTIMATED_TIMES = {
  analyzing: 5,
  planning: 5,
  generatingPerVariation: 20,
  validatingPerVariation: 5,
};
