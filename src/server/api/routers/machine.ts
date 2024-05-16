import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  machineCreateScheme,
  machineEditScheme,
  machineRemoveScheme,
  machinesGetAllScheme,
} from "~/validators/machine";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const machineRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(machinesGetAllScheme)
    .query(async ({ input, ctx }) => {
      const { companyId } = input;

      const company = await ctx.db.company.findUnique({
        where: {
          id: companyId,
          ...(ctx.session.user.role !== UserRole.ADMIN
            ? { representativeId: ctx.session.user.id }
            : {}),
        },
        include: {
          machines: true,
        },
      });

      if (!company) return [];

      return company.machines.map((machine) => ({
        companyId: machine.companyId,
        id: machine.id,
        name: machine.name,
        dockIp: machine.dockIp,
        status: "Good",
      }));
    }),
  createMachine: protectedProcedure
    .input(machineCreateScheme)
    .mutation(async ({ input, ctx }) => {
      const { companyId, name, dockIp } = input;

      const company = await ctx.db.company.findUnique({
        where: {
          id: companyId,
          ...(ctx.session.user.role !== UserRole.ADMIN
            ? { representativeId: ctx.session.user.id }
            : {}),
        },
      });

      if (!company)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Unable to create new machine",
        });

      await ctx.db.machine.create({
        data: {
          companyId: companyId!,
          name,
          dockIp,
        },
      });
    }),
  editMachine: protectedProcedure
    .input(machineEditScheme)
    .mutation(async ({ input, ctx }) => {
      const { companyId, name, dockIp, machineId } = input;

      const company = await ctx.db.company.findUnique({
        where: {
          id: companyId,
          ...(ctx.session.user.role !== UserRole.ADMIN
            ? { representativeId: ctx.session.user.id }
            : {}),
        },
      });

      if (!company)
        throw new TRPCError({
          code: "CONFLICT",
          message: "Unable to edit machine",
        });

      await ctx.db.machine.update({
        where: {
          id: machineId,
        },
        data: {
          name,
          dockIp,
        },
      });
    }),
  removeMachine: protectedProcedure
    .input(machineRemoveScheme)
    .mutation(async ({ input, ctx }) => {
      const { machineId } = input;

      const machine = await ctx.db.machine.findUnique({
        where: {
          id: machineId,
        },
        include: {
          company: true,
        },
      });

      if (
        !machine ||
        (machine.company.representativeId !== ctx.session.user.id &&
          ctx.session.user.role !== UserRole.ADMIN)
      )
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "The machine is either not exists or you do not have access to make this action",
        });

      await ctx.db.machine.delete({
        where: {
          id: machineId,
        },
      });
    }),
});
