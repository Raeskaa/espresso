// Shared utilities for Espresso

/**
 * Format a number as credits display
 */
export function formatCredits(credits: number): string {
  return `${credits} credit${credits === 1 ? "" : "s"}`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Types
export interface User {
  id: string;
  email: string;
  credits: number;
  subscriptionTier: "free" | "starter" | "pro" | null;
  createdAt: Date;
}

export interface Generation {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrls: string[];
  fixes: FixOptions;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  expiresAt: Date;
}

export interface FixOptions {
  fixEyeContact: boolean;
  improvePosture: boolean;
  adjustAngle: boolean;
  enhanceLighting: boolean;
}

// Constants
export const CREDITS_PER_GENERATION = 1;
export const FREE_CREDITS = 100;
export const STARTER_CREDITS = 50;
export const PRO_MONTHLY_CREDITS = 200;
export const IMAGE_RETENTION_DAYS = 7;
export const VARIATIONS_PER_GENERATION = 5;
