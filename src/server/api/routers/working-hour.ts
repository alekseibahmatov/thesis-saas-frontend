import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  workingHourAssignUnassignScheme,
  workingHourCreateSchema,
  workingHourEditSchema,
  workingHourGetAllSchema,
  workingHourRemoveSchema,
} from "~/validators/working-hour";
import { db } from "~/server/db";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { WorkingHours } from "~/app/dashboard/working-hours/(data-table)/columns";

export const workingHourRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(workingHourGetAllSchema)
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
          message: "Working hours not found",
        });
      }

      // Construct the query filter based on input conditions
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
      const workingHours = await ctx.db.workingHour.findMany({
        where: queryFilter,
        include: {
          users: true,
        },
      });

      // Map the result to the desired format
      return workingHours.map((hour) => ({
        id: hour.id,
        name: hour.name,
        workersAmount: hour.users ? hour.users.length : 0,
        dayOfWeek: hour.dayOfWeek,
        from: hour.from,
        until: hour.until,
        companyId: hour.companyId,
        workerId,
        isAssigned: workerId
          ? hour.users.some((user) => user.id === workerId)
          : false,
      })) as WorkingHours[];
    }),
  remove: protectedProcedure
    .input(workingHourRemoveSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const workingHour = await db.workingHour.findUnique({
        where: {
          id,
        },
        include: {
          users: true,
        },
      });

      if (!workingHour)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Working hours not found",
        });

      try {
        await db.$transaction(async (prisma) => {
          await prisma.workingHour.update({
            where: {
              id: workingHour.id,
            },
            data: {
              users: {
                set: [],
              },
            },
          });
          await prisma.workingHour.delete({
            where: {
              id: workingHour.id,
            },
          });
        });
      } catch (e) {
        console.error("Error deleting working hour:", e);
      } finally {
        await db.$disconnect();
      }
    }),
  create: protectedProcedure
    .input(workingHourCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, from, until, dayOfWeek, companyId } = input;

      const company =
        companyId && ctx.session.user.role === UserRole.ADMIN
          ? companyId
          : (
              await db.company.findUnique({
                where: {
                  representativeId: ctx.session.user.id,
                },
              })
            )?.id;

      if (!company) throw new TRPCError({ code: "BAD_REQUEST" });

      await db.workingHour.create({
        data: {
          name,
          from,
          until,
          dayOfWeek,
          companyId: company,
        },
      });
    }),
  edit: protectedProcedure
    .input(workingHourEditSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, companyId, name, dayOfWeek, from, until } = input;

      const verifCompanyId =
        ctx.session.user.role !== UserRole.ADMIN
          ? (
              await db.company.findUnique({
                where: {
                  representativeId: ctx.session.user.id,
                },
              })
            )?.id
          : companyId;

      await db.workingHour.update({
        where: {
          companyId: verifCompanyId,
          id: id,
        },
        data: {
          name,
          dayOfWeek,
          from,
          until,
        },
      });
    }),
  assignUnassignUser: protectedProcedure
    .input(workingHourAssignUnassignScheme)
    .mutation(async ({ ctx, input }) => {
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
      const workingHour = await ctx.db.workingHour.findUnique({
        where: { id },
        include: { users: true },
      });

      if (!workingHour) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice channel not found",
        });
      }

      const isAssigned = workingHour.users.some((user) => user.id === workerId);

      await db.workingHour.update({
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
