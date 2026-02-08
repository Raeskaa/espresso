'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

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

interface FaceAnalysis {
  gender: string;
  ageRange: string;
  hairColor: string;
  hairStyle: string;
  skinTone: string;
  facialFeatures: string;
  distinctiveFeatures: string;
}

interface ReferenceAnalysis {
  setting: string;
  pose: string;
  lighting: string;
  mood: string;
  clothing: string;
  style: string;
}

/**
 * Analyze a selfie to extract face/appearance description
 */
export async function analyzeFace(imageBase64: string): Promise<FaceAnalysis> {
  console.log('[Dating Studio] Analyzing face...');
  
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-3-flash' });
  
  const prompt = `Analyze this person's appearance for the purpose of describing them in an image generation prompt. 
Be specific but respectful. Focus on observable physical characteristics.

Return a JSON object with these fields:
- gender: "male", "female", or "person" if unclear
- ageRange: estimated age range like "20s", "30s", etc.
- hairColor: color of hair
- hairStyle: style of hair (short, long, curly, straight, etc.)
- skinTone: general skin tone description
- facialFeatures: describe face shape, notable features
- distinctiveFeatures: any distinctive characteristics like beard, glasses, etc.

Return ONLY valid JSON, no markdown or explanation.`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    }]
  });

  const text = result.response.text() || '';
  
  // Clean up response
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }
  
  try {
    const analysis = JSON.parse(cleanText.trim()) as FaceAnalysis;
    console.log('[Dating Studio] Face analysis:', analysis);
    return analysis;
  } catch (e) {
    console.error('[Dating Studio] Failed to parse face analysis:', cleanText);
    return {
      gender: 'person',
      ageRange: '20s',
      hairColor: 'dark',
      hairStyle: 'medium length',
      skinTone: 'medium',
      facialFeatures: 'pleasant features',
      distinctiveFeatures: ''
    };
  }
}

/**
 * Analyze a reference image to extract style/pose/setting
 */
export async function analyzeReference(imageBase64: string): Promise<ReferenceAnalysis> {
  console.log('[Dating Studio] Analyzing reference image...');
  
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-3-flash' });
  
  const prompt = `Analyze this image to understand the setting, pose, style, and mood for recreating a similar photo with a different person.

Return a JSON object with these fields:
- setting: where is this (coffee shop, rooftop, beach, studio, etc.)
- pose: describe the pose/body position
- lighting: describe the lighting (golden hour, studio, natural, etc.)
- mood: the overall mood/vibe (casual, professional, romantic, adventurous, etc.)
- clothing: describe what the person is wearing or suggest appropriate attire
- style: overall photography style (candid, portrait, lifestyle, etc.)

Return ONLY valid JSON, no markdown or explanation.`;

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
      ]
    }]
  });

  const text = result.response.text() || '';
  
  // Clean up response
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  }
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }
  
  try {
    const analysis = JSON.parse(cleanText.trim()) as ReferenceAnalysis;
    console.log('[Dating Studio] Reference analysis:', analysis);
    return analysis;
  } catch (e) {
    console.error('[Dating Studio] Failed to parse reference analysis:', cleanText);
    return {
      setting: 'casual indoor setting',
      pose: 'natural relaxed pose',
      lighting: 'soft natural light',
      mood: 'friendly and approachable',
      clothing: 'casual stylish outfit',
      style: 'lifestyle portrait'
    };
  }
}

/**
 * Build a prompt for generating a dating profile photo
 */
function buildDatingPrompt(face: FaceAnalysis, reference: ReferenceAnalysis): string {
  const prompt = `Generate a professional dating profile photo of a ${face.ageRange} ${face.gender} with ${face.hairColor} ${face.hairStyle} hair and ${face.skinTone} skin. ${face.facialFeatures}. ${face.distinctiveFeatures ? face.distinctiveFeatures + '.' : ''}

Setting: ${reference.setting}
Pose: ${reference.pose}
Lighting: ${reference.lighting}
Mood: ${reference.mood}
Clothing: ${reference.clothing}
Style: ${reference.style}

Create a high quality, photorealistic portrait photo perfect for a dating app profile. The person should look confident, approachable, and genuine. Sharp focus on face, professional composition, flattering angles.`;

  console.log('[Dating Studio] Generated prompt:', prompt);
  return prompt;
}

/**
 * Generate a dating profile photo using Gemini 3 Pro Image with reference images
 * This uses the model's ability to maintain character consistency with up to 5 reference faces
 */
export async function generateDatingPhotoWithReferences(
  selfieBase64: string,
  referenceBase64: string,
  referenceAnalysis: ReferenceAnalysis
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  try {
    const ai = getGenAI();
    
    // Use Gemini 3 Flash for best character consistency
    const model = ai.getGenerativeModel({
      model: 'gemini-3-flash',
      generationConfig: {
        // @ts-expect-error - responseModalities is supported but not in types yet
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    // Build a prompt that clearly instructs the model to generate a NEW image
    // with the person from the selfie in the style/setting of the reference
    const prompt = `Create a brand new professional dating profile photo.

TASK: Generate a NEW photo of the person from IMAGE 1 (the selfie) in the style and setting shown in IMAGE 2 (the reference).

The generated photo must:
1. Feature the EXACT SAME PERSON from IMAGE 1 - preserve their face, facial features, skin tone, hair color, and distinctive characteristics exactly
2. Place this person in a NEW setting inspired by IMAGE 2:
   - Setting: ${referenceAnalysis.setting}
   - Pose: ${referenceAnalysis.pose}  
   - Lighting: ${referenceAnalysis.lighting}
   - Mood: ${referenceAnalysis.mood}
   - Outfit style: ${referenceAnalysis.clothing}
   - Photography style: ${referenceAnalysis.style}

DO NOT return the original images. Generate a completely NEW photorealistic image that combines the person from IMAGE 1 with the style elements from IMAGE 2.

The final image should be high quality, photorealistic, perfect for a dating app profile. The person should look confident, approachable, and genuine.`;

    console.log('[Dating Studio] Generating with Gemini 3 Flash...');
    console.log('[Dating Studio] Prompt:', prompt);
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { text: 'IMAGE 1 (selfie - use this person\'s face):' },
          { inlineData: { mimeType: 'image/jpeg', data: selfieBase64 } },
          { text: 'IMAGE 2 (reference - use this style/setting):' },
          { inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } }
        ]
      }]
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      console.error('[Dating Studio] No parts in response');
      return { success: false, error: 'No response from model' };
    }

    // Look for image data in response
    for (const part of parts) {
      if ('inlineData' in part && part.inlineData) {
        console.log('[Dating Studio] Image generated successfully');
        return {
          success: true,
          imageBase64: part.inlineData.data
        };
      }
    }

    // No image found, might have text response
    const textPart = parts.find(p => 'text' in p);
    if (textPart && 'text' in textPart) {
      console.log('[Dating Studio] Got text response instead of image:', textPart.text);
      return { success: false, error: `Model returned text: ${(textPart as { text: string }).text.substring(0, 200)}...` };
    }
    
    return { success: false, error: 'No image in response' };
  } catch (error) {
    console.error('[Dating Studio] Generation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Generation failed' 
    };
  }
}

/**
 * Generate multiple dating profile photos from selfies and references
 */
export async function generateDatingProfilePhotos(
  selfies: string[],
  references: string[],
  maxPhotos: number = 4
): Promise<{ success: boolean; imageUrls: string[]; errors: string[] }> {
  console.log(`[Dating Studio] Starting generation: ${selfies.length} selfies, ${references.length} references`);
  
  if (selfies.length === 0) {
    return { success: false, imageUrls: [], errors: ['No selfies provided'] };
  }
  
  if (references.length === 0) {
    return { success: false, imageUrls: [], errors: ['No reference images provided'] };
  }
  
  // Use the primary selfie for face consistency
  const primarySelfie = selfies[0];
  
  const imageUrls: string[] = [];
  const errors: string[] = [];
  
  // Generate one photo per reference (up to maxPhotos)
  const numToGenerate = Math.min(references.length, maxPhotos);
  
  for (let i = 0; i < numToGenerate; i++) {
    console.log(`[Dating Studio] Generating photo ${i + 1}/${numToGenerate}...`);
    
    try {
      // Analyze this reference for style/pose/setting
      const refAnalysis = await analyzeReference(references[i]);
      
      // Generate image with both selfie and reference
      const result = await generateDatingPhotoWithReferences(
        primarySelfie,
        references[i],
        refAnalysis
      );

      if (result.success && result.imageBase64) {
        // Convert to data URL
        const imageUrl = `data:image/png;base64,${result.imageBase64}`;
        imageUrls.push(imageUrl);
        console.log(`[Dating Studio] Photo ${i + 1} generated successfully`);
      } else {
        errors.push(`Photo ${i + 1}: ${result.error || 'No image generated'}`);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Dating Studio] Photo ${i + 1} failed:`, errMsg);
      errors.push(`Photo ${i + 1}: ${errMsg}`);
    }
    
    // Small delay between requests to avoid rate limiting
    if (i < numToGenerate - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return {
    success: imageUrls.length > 0,
    imageUrls,
    errors
  };
}
