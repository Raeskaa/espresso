/**
 * Espresso Image Pipeline - Planner Stage
 * 
 * Creates a detailed edit plan based on the analysis and user's fix requests.
 * Uses chain-of-thought reasoning to determine the safest and most effective approach.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config';
import { PLANNER_SYSTEM_PROMPT, buildPlannerUserPrompt } from './prompts';
import { parseJsonResponse } from './utils';
import type { AnalysisResult, EditPlan } from './types';
import type { FixOptions } from '@espresso/utils';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Create an edit plan based on analysis and requested fixes
 */
export async function createPlan(
  analysis: AnalysisResult,
  fixes: FixOptions
): Promise<EditPlan> {
  console.log('[Planner] Creating edit plan...');
  console.log('[Planner] Fixes requested:', fixes);

  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: CONFIG.models.planner,
    generationConfig: {
      temperature: 0.5, // Balanced for reasoning
      topP: 0.9,
    },
  });

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${PLANNER_SYSTEM_PROMPT}\n\n${buildPlannerUserPrompt(analysis, fixes)}`,
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    console.log('[Planner] Raw response length:', responseText.length);

    const plan = parseJsonResponse<EditPlan>(responseText);
    
    if (!plan) {
      console.error('[Planner] Failed to parse response, using fallback');
      return createFallbackPlan(fixes);
    }

    console.log('[Planner] Plan created:', {
      strategy: plan.strategy,
      risk: plan.riskAssessment.overallRisk,
      steps: plan.steps.length,
    });

    return plan;
  } catch (error) {
    console.error('[Planner] Error during planning:', error);
    return createFallbackPlan(fixes);
  }
}

/**
 * Create a conservative fallback plan when AI planning fails
 */
function createFallbackPlan(fixes: FixOptions): EditPlan {
  const steps = [];
  let order = 1;

  // Build steps based on requested fixes - conservative approach
  if (fixes.enhanceLighting) {
    steps.push({
      order: order++,
      target: 'lighting' as const,
      action: 'Enhance lighting with soft, flattering adjustments',
      intensity: 50,
      technicalGuidance: 'Reduce harsh shadows, add subtle fill light, warm up slightly',
      warningsAndConstraints: ['Do not overexpose', 'Maintain skin tones'],
    });
  }

  if (fixes.adjustAngle) {
    steps.push({
      order: order++,
      target: 'global' as const,
      action: 'Subtle perspective adjustment for more flattering angle',
      intensity: 40,
      technicalGuidance: 'Simulate slightly higher camera position',
      warningsAndConstraints: ['Maintain proportions', 'Keep background consistent'],
    });
  }

  if (fixes.improvePosture) {
    steps.push({
      order: order++,
      target: 'shoulders' as const,
      action: 'Improve posture - straighten and open up',
      intensity: 50,
      technicalGuidance: 'Slightly adjust shoulder alignment, suggest more upright position',
      warningsAndConstraints: ['Keep natural', 'Do not distort clothing'],
    });
  }

  if (fixes.fixEyeContact) {
    steps.push({
      order: order++,
      target: 'eyes' as const,
      action: 'Adjust gaze to camera direction',
      intensity: 60,
      technicalGuidance: 'Carefully redirect pupils and iris to face camera. Preserve eye shape, color, and reflections.',
      warningsAndConstraints: [
        'HIGH RISK - Preserve exact eye shape',
        'Maintain catchlights',
        'Both eyes must match',
        'If unsure, apply minimal change',
      ],
    });
  }

  return {
    reasoning: 'Fallback plan due to processing error. Using conservative approach with emphasis on identity preservation.',
    strategy: 'conservative',
    riskAssessment: {
      identityRisk: fixes.fixEyeContact ? 'high' : 'medium',
      distortionRisk: fixes.fixEyeContact ? 'high' : 'low',
      overallRisk: fixes.fixEyeContact ? 'high' : 'medium',
    },
    steps,
    fallbackPlan: 'If edits cause distortion, reduce intensity by 50% and avoid eye modifications entirely.',
  };
}
