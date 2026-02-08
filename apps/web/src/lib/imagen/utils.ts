/**
 * Espresso Image Pipeline - Utility Functions
 */

import { createServerClient } from '@/lib/supabase';
import type { PipelineProgress, PipelineStage } from './types';
import { ESTIMATED_TIMES } from './config';

/**
 * Upload base64 image to Supabase storage
 */
export async function uploadToSupabase(
  base64Data: string,
  userId: string,
  variationIndex: number
): Promise<string> {
  const supabase = createServerClient();
  const timestamp = Date.now();
  const filename = `${timestamp}-variation-${variationIndex + 1}.png`;
  const path = `${userId}/${filename}`;
  
  // Clean base64 data - remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  
  // Validate base64 length
  if (!cleanBase64 || cleanBase64.length < 100) {
    throw new Error(`Invalid image data: too short (${cleanBase64?.length || 0} chars)`);
  }
  
  // Convert base64 to Uint8Array using Buffer (Node.js)
  const buffer = Buffer.from(cleanBase64, 'base64');
  const bytes = new Uint8Array(buffer);
  
  console.log(`[Storage] Uploading to path: ${path}, size: ${bytes.length} bytes`);
  
  // Validate it looks like a PNG (starts with PNG header)
  const pngHeader = [0x89, 0x50, 0x4E, 0x47]; // PNG magic number
  const isPng = pngHeader.every((byte, i) => bytes[i] === byte);
  if (!isPng) {
    console.log(`[Storage] Warning: Image doesn't have PNG header. First 8 bytes:`, Array.from(bytes.slice(0, 8)));
  }
  
  const { data, error } = await supabase.storage
    .from('generations')
    .upload(path, bytes, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error('[Storage] Upload error:', error);
    console.error('[Storage] Error name:', error.name);
    console.error('[Storage] Full error:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  console.log(`[Storage] Upload successful: ${data.path}`);
  
  const { data: urlData } = supabase.storage.from('generations').getPublicUrl(path);
  return urlData.publicUrl;
}

/**
 * Safely parse JSON from AI response
 * Handles markdown code blocks and other formatting
 */
export function parseJsonResponse<T>(text: string): T | null {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    
    // Handle ```json ... ``` blocks
    if (cleaned.startsWith('```')) {
      const lines = cleaned.split('\n');
      lines.shift(); // Remove first line (```json)
      if (lines[lines.length - 1]?.trim() === '```') {
        lines.pop(); // Remove last line (```)
      }
      cleaned = lines.join('\n');
    }
    
    // Try to find JSON object or array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    
    // Try direct parse
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    console.error('Raw text:', text.substring(0, 500));
    return null;
  }
}

/**
 * Calculate estimated time remaining
 */
export function calculateEstimatedTime(
  stage: PipelineStage,
  currentVariation: number,
  totalVariations: number
): number {
  let remaining = 0;
  
  switch (stage) {
    case 'pending':
      remaining += ESTIMATED_TIMES.analyzing;
      remaining += ESTIMATED_TIMES.planning;
      remaining += ESTIMATED_TIMES.generatingPerVariation * totalVariations;
      remaining += ESTIMATED_TIMES.validatingPerVariation * totalVariations;
      break;
    case 'analyzing':
      remaining += ESTIMATED_TIMES.planning;
      remaining += ESTIMATED_TIMES.generatingPerVariation * totalVariations;
      remaining += ESTIMATED_TIMES.validatingPerVariation * totalVariations;
      break;
    case 'planning':
      remaining += ESTIMATED_TIMES.generatingPerVariation * totalVariations;
      remaining += ESTIMATED_TIMES.validatingPerVariation * totalVariations;
      break;
    case 'generating':
      const variationsLeft = totalVariations - currentVariation + 1;
      remaining += ESTIMATED_TIMES.generatingPerVariation * variationsLeft;
      remaining += ESTIMATED_TIMES.validatingPerVariation * variationsLeft;
      break;
    case 'validating':
      const validationsLeft = totalVariations - currentVariation + 1;
      remaining += ESTIMATED_TIMES.validatingPerVariation * validationsLeft;
      break;
    case 'complete':
    case 'failed':
      remaining = 0;
      break;
  }
  
  return remaining;
}

/**
 * Create progress object helper
 */
export function createProgress(
  stage: PipelineStage,
  message: string,
  currentVariation: number = 0,
  totalVariations: number = 5,
  stageProgress: number = 0,
  startedAt?: number
): PipelineProgress {
  return {
    stage,
    stageProgress,
    currentVariation,
    totalVariations,
    message,
    estimatedTimeRemaining: calculateEstimatedTime(stage, currentVariation, totalVariations),
    startedAt: startedAt || Date.now(),
  };
}

/**
 * Get human-readable stage message
 */
export function getStageMessage(stage: PipelineStage, variation?: number): string {
  switch (stage) {
    case 'pending':
      return 'Preparing to process...';
    case 'analyzing':
      return 'Analyzing your photo...';
    case 'planning':
      return 'Planning the edits...';
    case 'generating':
      return variation ? `Generating variation ${variation}...` : 'Generating variations...';
    case 'validating':
      return variation ? `Validating variation ${variation}...` : 'Checking quality...';
    case 'complete':
      return 'Complete!';
    case 'failed':
      return 'Generation failed';
    default:
      return 'Processing...';
  }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('All retries exhausted');
}

/**
 * Generate fallback placeholder URL
 */
export function generateFallbackUrl(variationIndex: number): string {
  const seed = `espresso-fallback-${Date.now()}-${variationIndex}`;
  return `https://picsum.photos/seed/${seed}/400/500`;
}
