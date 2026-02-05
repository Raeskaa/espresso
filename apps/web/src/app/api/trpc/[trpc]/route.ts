import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@espresso/api';
import { auth } from '@clerk/nextjs/server';

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth();
      return { userId };
    },
  });
};

export { handler as GET, handler as POST };
