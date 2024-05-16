import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  userCreateSchema,
  userGetFilterSchema,
  userRemoveSchema,
} from "~/validators/user";
import { TRPCError } from "@trpc/server";
import * as argon2 from "argon2";
import { generate } from "generate-password";
import { UserRole } from "@prisma/client";
import { User } from "~/app/dashboard/user/(user-table)/columns";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany();

    return users.map((user) => ({
      id: user.id,
      fullName: user.name,
      role: user.role,
      email: user.email,
    }));
  }),
  getUsersFilter: protectedProcedure
    .input(userGetFilterSchema)
    .query(async ({ ctx, input }) => {
      const { companyId, userRole } = input;

      let users;

      switch (userRole) {
        case UserRole.MANAGER:
          users = await ctx.db.user.findMany({
            where: {
              role: UserRole.MANAGER,
              OR: companyId
                ? [
                    { representativeOf: null },
                    { representativeOf: { id: companyId } },
                  ]
                : [{ representativeOf: null }],
            },
          });
          break;
        case UserRole.WORKER:
          users = (
            await ctx.db.company.findUnique({
              where: {
                id: companyId,
                ...(ctx.session.user.role !== UserRole.ADMIN
                  ? { representativeId: ctx.session.user.id }
                  : {}),
              },
              include: {
                workers: true,
              },
            })
          )?.workers;
          break;
      }

      if (!users) return [];

      return users.map((user) => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role,
      })) as User[];
    }),

  createUser: protectedProcedure
    .input(userCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, fullName, role, companyId } = input;

      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (user)
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with such email already exists",
        });

      const password = await argon2.hash(generate());

      await ctx.db.user.create({
        data: {
          name: fullName,
          role,
          email,
          password,
          workerCompanyId: companyId,
        },
      });
    }),
  removeUser: protectedProcedure
    .input(userRemoveSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await ctx.db.user.delete({
        where: { id },
      });
    }),
});
