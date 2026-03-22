import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { fetchTrafficData } from "./services/trafficService";
import { saveTrafficQuery, getUserTrafficQueries } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  traffic: router({
    analyze: publicProcedure
      .input(z.object({ domain: z.string().min(1, "Domain gereklidir") }))
      .mutation(async ({ input, ctx }) => {
        try {
          const trafficData = await fetchTrafficData(input.domain);
          
          // Save to database if user is authenticated
          if (ctx.user) {
            await saveTrafficQuery(ctx.user.id, input.domain, trafficData);
          }
          
          return trafficData;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
          throw new Error(errorMessage);
        }
      }),
    
    history: protectedProcedure.query(async ({ ctx }) => {
      return getUserTrafficQueries(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
