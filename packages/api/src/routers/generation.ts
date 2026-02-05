import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// In-memory storage for now (will be replaced with Supabase DB)
const mockGenerations = new Map<string, {
  id: string;
  userId: string;
  originalImageUrl: string;
  generatedImageUrls: string[];
  fixes: {
    fixEyeContact: boolean;
    improvePosture: boolean;
    adjustAngle: boolean;
    enhanceLighting: boolean;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}>();

// Mock user credits (will be replaced with Supabase DB)
const userCredits = new Map<string, number>();

function getUserCredits(userId: string): number {
  if (!userCredits.has(userId)) {
    userCredits.set(userId, 3); // Default free credits
  }
  return userCredits.get(userId)!;
}

function deductCredit(userId: string): boolean {
  const credits = getUserCredits(userId);
  if (credits <= 0) return false;
  userCredits.set(userId, credits - 1);
  return true;
}

export const generationRouter = router({
  // Create a new generation
  create: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(), // Base64 encoded image
        fixes: z.object({
          fixEyeContact: z.boolean(),
          improvePosture: z.boolean(),
          adjustAngle: z.boolean(),
          enhanceLighting: z.boolean(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      
      // Check credits
      const credits = getUserCredits(userId);
      if (credits <= 0) {
        throw new Error('Insufficient credits. Please purchase more credits to continue.');
      }

      // Deduct credit
      if (!deductCredit(userId)) {
        throw new Error('Failed to deduct credit');
      }

      // Generate unique ID
      const id = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Create generation record
      const generation = {
        id,
        userId,
        originalImageUrl: `data:image/jpeg;base64,${input.imageBase64.substring(0, 100)}...`, // Truncated for storage
        generatedImageUrls: [] as string[],
        fixes: input.fixes,
        status: 'processing' as const,
        createdAt: new Date(),
      };

      mockGenerations.set(id, generation);

      // In a real implementation, this would call the Imagen API
      // For now, we'll simulate processing and return mock results
      // The actual API call will happen in a background job or API route

      return {
        id,
        status: 'processing' as const,
        creditsRemaining: getUserCredits(userId),
      };
    }),

  // Process generation (called by background job or webhook)
  process: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const generation = mockGenerations.get(input.id);
      
      if (!generation) {
        throw new Error('Generation not found');
      }

      if (generation.userId !== ctx.userId) {
        throw new Error('Unauthorized');
      }

      // Simulate processing - in reality, this calls Imagen API
      // For demo, we'll just mark it as completed with placeholder images
      generation.status = 'completed';
      generation.generatedImageUrls = [
        '/placeholder-1.jpg',
        '/placeholder-2.jpg',
        '/placeholder-3.jpg',
        '/placeholder-4.jpg',
        '/placeholder-5.jpg',
      ];

      return { success: true };
    }),

  // Get a generation by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const generation = mockGenerations.get(input.id);
      
      if (!generation) {
        return null;
      }

      if (generation.userId !== ctx.userId) {
        throw new Error('Unauthorized');
      }

      return generation;
    }),

  // List user's generations
  list: protectedProcedure.query(async ({ ctx }) => {
    const userGenerations = Array.from(mockGenerations.values())
      .filter(g => g.userId === ctx.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return userGenerations;
  }),
});
