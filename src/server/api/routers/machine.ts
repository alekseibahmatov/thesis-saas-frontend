import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  machineCreateScheme,
  machineEditScheme,
  machineMoveScheme,
  machineRemoveScheme,
  machinesGetAllScheme,
} from "~/validators/machine";
import { AlertStatus, UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

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
          machines: {
            include: {
              alerts: true,
            },
          },
        },
      });

      if (!company) return [];

      return company.machines.map((machine) => ({
        companyId: machine.companyId,
        id: machine.id,
        name: machine.name,
        dockIp: machine.dockIp,
        positionX: machine.positionX ?? 0,
        positionY: machine.positionY ?? 0,
        status: !!machine.alerts.find(
          (alert) => alert.currentStatus !== AlertStatus.SOLVED,
        )
          ? "Issue"
          : "Working",
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
          companyId: company.id,
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
        include: {
          alerts: true,
        },
      });
    }),
  moveMachine: protectedProcedure
    .input(machineMoveScheme)
    .mutation(async ({ input, ctx }) => {
      const { id, positionX, positionY } = input;

      if (ctx.session.user.role !== UserRole.MANAGER)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const company = await ctx.db.company.findUnique({
        where: {
          representativeId: ctx.session.user.id,
        },
        include: {
          machines: true,
        },
      });

      if (!company)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Company not found",
        });

      const isAllowedToMove = company.machines.find(
        (machine) => machine.id === id,
      );

      if (!isAllowedToMove)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unable to move machine",
        });

      await db.machine.update({
        where: {
          id,
        },
        data: {
          positionX,
          positionY,
        },
      });
    }),
});
