import { UserRole } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  companyAddFactoryPlanScheme,
  companyCreateSchema,
  companyDataSchema,
  companyEditSchema,
  companyGetFactoryPlanScheme,
  companyRemoveSchema,
} from "~/validators/company";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

export const companyRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const companies = await ctx.db.company.findMany({
      include: {
        workers: true,
        representative: true,
      },
    });

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      workersAmount: company.workers.length,
      managerName: company.representative.name,
    }));
  }),
  getData: protectedProcedure
    .input(companyDataSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const company = await ctx.db.company.findUniqueOrThrow({
        where: {
          id,
          ...(ctx.session.user.role !== UserRole.ADMIN
            ? { representativeId: ctx.session.user.id }
            : {}),
        },
      });

      if (!company)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });

      return {
        name: company.name,
        representativeId: company.representativeId,
      };
    }),
  createCompany: protectedProcedure
    .input(companyCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const { companyName, userId } = input;

      await ctx.db.company.create({
        data: {
          name: companyName,
          representativeId: userId,
        },
      });
    }),
  removeCompany: protectedProcedure
    .input(companyRemoveSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const company = await ctx.db.company.findUniqueOrThrow({
        where: {
          id,
          ...(ctx.session.user.role !== UserRole.ADMIN
            ? { representativeId: ctx.session.user.id }
            : {}),
        },
      });

      if (!company)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });

      await ctx.db.company.delete({
        where: { id },
      });
    }),
  editCompany: protectedProcedure
    .input(companyEditSchema)
    .mutation(async ({ input, ctx }) => {
      const { companyName, userId, companyId } = input;

      await ctx.db.company.update({
        where: {
          id: companyId,
          ...(ctx.session.user.role !== UserRole.ADMIN
            ? { representativeId: ctx.session.user.id }
            : {}),
        },
        data: {
          name: companyName,
          representativeId: userId,
        },
      });
    }),
  isFactoryPlan: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== UserRole.MANAGER)
      return { isFactoryPlan: false };

    const company = await ctx.db.company.findUnique({
      where: {
        representativeId: ctx.session.user.id,
      },
    });

    if (!company) return { isFactoryPlan: false };

    const factoryPlan = company.factoryPlan;

    if (!factoryPlan) {
      return { isFactoryPlan: false };
    }

    return { isFactoryPlan: true };
  }),
});
