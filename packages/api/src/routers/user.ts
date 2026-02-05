import { router, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = router({
  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Fetch from database
    return {
      id: ctx.userId,
      credits: 3,
      subscriptionTier: 'free' as const,
    };
  }),

  // Get credit balance
  credits: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Fetch from database
    return { credits: 3 };
  }),
});
