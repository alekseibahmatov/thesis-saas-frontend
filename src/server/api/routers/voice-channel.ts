import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  voiceChannelGetAllScheme,
  voiceChannelsAssignUnassignScheme,
  voiceChannelsCreateScheme,
  voiceChannelsEditScheme,
  voiceChannelsRemoveScheme,
} from "~/validators/voice-channel";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { VoiceChannels } from "~/app/dashboard/user/[userId]/(user-voice-channels-table)/columns";
import { db } from "~/server/db";
import { workingHourRemoveSchema } from "~/validators/working-hour";

export const voiceChannelRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(voiceChannelGetAllScheme)
    .query(async ({ ctx, input }) => {
      const { workerId, companyId } = input;

      // Check for invalid request
      if (
        !workerId &&
        !companyId &&
        // @ts-expect-error Error known
        ![UserRole.ADMIN, UserRole.MANAGER].includes(ctx.session.user.role)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voice channels not found",
        });
      }

      const queryFilter: {
        companyId?: string;
        users?: { some: { id: string } };
      } = {};

      if (companyId) {
        queryFilter.companyId = companyId;
      }

      if (!companyId && !workerId) {
        const company = await ctx.db.company.findUnique({
          where: {
            representativeId: ctx.session.user.id,
          },
        });

        if (!company) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something wrong with the company",
          });
        }

        queryFilter.companyId = company.id;
      }

      // Fetch working hours based on constructed query filter
      const voiceChannels = await ctx.db.voiceChannel.findMany({
        where: queryFilter,
        include: {
          users: true,
        },
      });

      // Map the result to the desired format
      return voiceChannels.map((voiceChannel) => ({
        id: voiceChannel.id,
        name: voiceChannel.name,
        amountAssigned: voiceChannel.users ? voiceChannel.users.length : 0,
        companyId: voiceChannel.companyId,
        workerId,
        isAssigned: workerId
          ? voiceChannel.users.some((user) => user.id === workerId)
          : false,
      })) as VoiceChannels[];
    }),
  remove: protectedProcedure
    .input(voiceChannelsRemoveScheme)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      //@ts-expect-error Known error
      if (![UserRole.ADMIN, UserRole.MANAGER].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      if (ctx.session.user.role === UserRole.MANAGER) {
        const company = await ctx.db.company.findUnique({
          where: {
            representativeId: ctx.session.user.id,
          },
        });

        if (!company) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Company not found",
          });
        }

        const voiceChannel = await ctx.db.voiceChannel.findUnique({
          where: {
            id,
            companyId: company.id,
          },
        });

        if (!voiceChannel)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Voice channel not found",
          });
      }
      try {
        await db.$transaction(async (prisma) => {
          await prisma.voiceChannel.update({
            where: {
              id,
            },
            data: {
              users: {
                set: [],
              },
            },
          });

          await db.voiceChannel.delete({
            where: {
              id,
            },
          });
        });
      } catch (e) {
        console.error("Error deleting working hour:", e);
      } finally {
        await db.$disconnect();
      }
    }),
  edit: protectedProcedure
    .input(voiceChannelsEditScheme)
    .mutation(async ({ ctx, input }) => {
      const { id, companyId, name } = input;

      // Ensure the user has the correct role
      // @ts-expect-error Known error
      if (![UserRole.ADMIN, UserRole.MANAGER].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // Check if the user is authorized to assign/unassign this worker
      const company = await ctx.db.company.findUnique({
        where: {
          ...(ctx.session.user.role === UserRole.ADMIN
            ? { id: companyId }
            : { representativeId: ctx.session.user.id }),
        },
        include: {
          voiceChannels: true,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Company not found",
        });
      }

      const voiceChannelExists = company.voiceChannels.find(
        (voiceChannel) => voiceChannel.id === id,
      );

      if (!voiceChannelExists)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Voice channel not found",
        });

      await db.voiceChannel.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });
    }),
  create: protectedProcedure
    .input(voiceChannelsCreateScheme)
    .mutation(async ({ ctx, input }) => {
      const { name, companyId } = input;

      // Ensure the user has the correct role
      // @ts-expect-error Known error
      if (![UserRole.ADMIN, UserRole.MANAGER].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // Check if the user is authorized to assign/unassign this worker
      const company = await ctx.db.company.findUnique({
        where: {
          ...(ctx.session.user.role === UserRole.ADMIN
            ? { id: companyId }
            : { representativeId: ctx.session.user.id }),
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Company not found",
        });
      }

      await db.voiceChannel.create({
        data: {
          companyId: company.id,
          name,
        },
      });
    }),
  assignUnassignUser: protectedProcedure
    .input(voiceChannelsAssignUnassignScheme)
    .mutation(async ({ input, ctx }) => {
      const { workerId, companyId, id } = input;

      // Ensure the user has the correct role
      // @ts-expect-error Known error
      if (![UserRole.ADMIN, UserRole.MANAGER].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // Check if the user is authorized to assign/unassign this worker
      const company = await ctx.db.company.findUnique({
        where: {
          ...(ctx.session.user.role === UserRole.ADMIN
            ? { id: companyId }
            : { representativeId: ctx.session.user.id }),
        },
        include: {
          workers: true,
        },
      });

      if (!company) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Company not found",
        });
      }

      const isPossible = company.workers.some(
        (worker) => worker.id === workerId,
      );

      if (!isPossible) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Impossible to make this assign/unassign",
        });
      }

      // Check if the user is already assigned to the voice channel
      const voiceChannel = await ctx.db.voiceChannel.findUnique({
        where: { id },
        include: { users: true },
      });

      if (!voiceChannel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice channel not found",
        });
      }

      const isAssigned = voiceChannel.users.some(
        (user) => user.id === workerId,
      );

      await db.voiceChannel.update({
        where: {
          id,
        },
        data: {
          users: {
            ...(isAssigned
              ? {
                  disconnect: {
                    id: workerId,
                  },
                }
              : {
                  connect: {
                    id: workerId,
                  },
                }),
          },
        },
      });
    }),
});
