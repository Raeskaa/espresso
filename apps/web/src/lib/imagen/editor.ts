/**
 * Espresso Image Pipeline - Editor Stage
 * 
 * Generates the edited image using the plan and style variation.
 * Uses Nano Banana Pro (Gemini 3 Pro Image) with thinking capability.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from './config';
import { EDITOR_SYSTEM_PROMPT, buildEditorUserPrompt, SINGLE_EDIT_SYSTEM_PROMPT, buildSingleEditPrompt } from './prompts';
import type { EditPlan, StyleVariation, EditResult, EditType, FixTemplate, AnalysisResult } from './types';

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
 * Generate an edited image based on the plan and style
 */
export async function generate(
  originalImageBase64: string,
  plan: EditPlan,
  style: StyleVariation,
  intensityMultiplier: number = 1.0,
  retryFeedback?: string,
  attempt: number = 1
): Promise<EditResult> {
  console.log(`[Editor] Generating ${style.name} variation (attempt ${attempt})...`);
  console.log(`[Editor] Intensity multiplier: ${intensityMultiplier}`);

  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: CONFIG.models.editor,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      // @ts-expect-error - responseModalities is supported but not in types yet
      responseModalities: ['image', 'text'],
    },
  });

  try {
    const editPrompt = buildEditorUserPrompt(plan, style, intensityMultiplier, retryFeedback, attempt);
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: originalImageBase64,
              },
            },
            {
              text: `${EDITOR_SYSTEM_PROMPT}\n\n${editPrompt}`,
            },
          ],
        },
      ],
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      console.error('[Editor] No parts in response');
      return { success: false, error: 'No response from model' };
    }

    // Look for image data in the response
    for (const part of parts) {
      if (part.inlineData?.data) {
        console.log('[Editor] Image generated successfully');
        return {
          success: true,
          imageBase64: part.inlineData.data,
        };
      }
    }

    // No image found - log any text response
    const textPart = parts.find(p => 'text' in p);
    if (textPart && 'text' in textPart) {
      console.log('[Editor] No image in response, got text:', textPart.text?.substring(0, 200));
    }

    return { success: false, error: 'Model did not return an image' };
  } catch (error) {
    console.error('[Editor] Error during generation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a single focused edit for sequential pipeline
 */
export async function generateSingleEdit(
  inputImageBase64: string,
  editType: EditType,
  template: FixTemplate,
  analysis: AnalysisResult,
  customPrompt: string | undefined,
  attempt: number,
  variationHint?: string
): Promise<EditResult> {
  console.log(`[Editor] Single edit ${editType} (attempt ${attempt})`);

  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: CONFIG.models.editor,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
      // @ts-expect-error - responseModalities is supported but not in types yet
      responseModalities: ['image', 'text'],
    },
  });

  try {
    const editPrompt = buildSingleEditPrompt(editType, template, analysis, customPrompt, attempt, variationHint);

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: inputImageBase64,
              },
            },
            {
              text: `${SINGLE_EDIT_SYSTEM_PROMPT}\n\n${editPrompt}`,
            },
          ],
        },
      ],
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      console.error('[Editor] No parts in response');
      return { success: false, error: 'No response from model' };
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        console.log('[Editor] Single edit image generated');
        return {
          success: true,
          imageBase64: part.inlineData.data,
        };
      }
    }

    const textPart = parts.find((part) => 'text' in part);
    if (textPart && 'text' in textPart) {
      console.log('[Editor] No image in response, got text:', textPart.text?.substring(0, 200));
    }

    return { success: false, error: 'Model did not return an image' };
  } catch (error) {
    console.error('[Editor] Error during single edit:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
