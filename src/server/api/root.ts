import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "~/server/api/routers/user";
import { companyRouter } from "~/server/api/routers/company";
import { machineRouter } from "~/server/api/routers/machine";
import { workingHourRouter } from "~/server/api/routers/working-hour";
import { voiceChannelRouter } from "~/server/api/routers/voice-channel";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  userRouter,
  companyRouter,
  machineRouter,
  workingHourRouter,
  voiceChannelRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Page a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
