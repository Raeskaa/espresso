'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import type { FixOptions } from '@espresso/utils';

// In-memory storage (replace with Supabase later)
const generations = new Map<string, {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrls: string[];
  fixes: FixOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}>();

const userCredits = new Map<string, number>();

function getUserCredits(userId: string): number {
  if (!userCredits.has(userId)) {
    userCredits.set(userId, 3);
  }
  return userCredits.get(userId)!;
}

export async function createGeneration(
  imageBase64: string,
  fixes: FixOptions
): Promise<{ success: boolean; generationId?: string; error?: string; creditsRemaining?: number }> {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const credits = getUserCredits(userId);
  if (credits <= 0) {
    return { success: false, error: 'Insufficient credits' };
  }

  // Deduct credit
  userCredits.set(userId, credits - 1);

  const id = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Store generation
  generations.set(id, {
    id,
    userId,
    originalImageUrl: imageBase64,
    generatedImageUrls: [],
    fixes,
    status: 'processing',
    createdAt: new Date(),
  });

  // In production, this would trigger the actual Imagen API call
  // For now, simulate completion after a delay
  setTimeout(() => {
    const gen = generations.get(id);
    if (gen) {
      gen.status = 'completed';
      // Mock generated images - in reality these would come from Imagen
      gen.generatedImageUrls = [
        `https://picsum.photos/seed/${id}-1/400/500`,
        `https://picsum.photos/seed/${id}-2/400/500`,
        `https://picsum.photos/seed/${id}-3/400/500`,
        `https://picsum.photos/seed/${id}-4/400/500`,
        `https://picsum.photos/seed/${id}-5/400/500`,
      ];
    }
  }, 3000);

  return {
    success: true,
    generationId: id,
    creditsRemaining: credits - 1,
  };
}

export async function getGeneration(id: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const generation = generations.get(id);
  
  if (!generation || generation.userId !== userId) {
    return null;
  }

  return generation;
}

export async function getCredits() {
  const { userId } = await auth();
  
  if (!userId) {
    return 0;
  }

  return getUserCredits(userId);
}
