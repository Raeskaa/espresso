import { router, protectedProcedure } from '../trpc';

// Mock user credits (shared with generation router - in reality, this would be DB)
const userCredits = new Map<string, number>();

function getUserCredits(userId: string): number {
  if (!userCredits.has(userId)) {
    userCredits.set(userId, 3); // Default free credits
  }
  return userCredits.get(userId)!;
}

export const userRouter = router({
  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.userId,
      credits: getUserCredits(ctx.userId),
      subscriptionTier: 'free' as const,
    };
  }),

  // Get credit balance
  credits: protectedProcedure.query(async ({ ctx }) => {
    return { credits: getUserCredits(ctx.userId) };
  }),
});
