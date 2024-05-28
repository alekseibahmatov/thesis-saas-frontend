import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  userCreateSchema,
  userEditSchema,
  userGetFilterSchema,
  userRemoveSchema,
} from "~/validators/user";
import { TRPCError } from "@trpc/server";
import * as argon2 from "argon2";
import { generate } from "generate-password";
import { UserRole } from "@prisma/client";
import type { User } from "~/app/dashboard/user/(user-table)/columns";
import { sendEmail } from "~/utils/resend";
import { RenderedUserCreateTemplate } from "~/emails/user-create";
import { db } from "~/server/db";
import { RenderedEmailChangeTemplate } from "~/emails/email-change";
import { RenderedPasswordChangeTemplate } from "~/emails/password-change";

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

      const rawPassword = generate();

      const password = await argon2.hash(rawPassword);

      const workerCompanyId =
        ctx.session.user.role === UserRole.MANAGER
          ? (
              await ctx.db.company.findUnique({
                where: {
                  representativeId: ctx.session.user.id,
                },
              })
            )?.id
          : companyId;

      await ctx.db.user.create({
        data: {
          name: fullName,
          role,
          email,
          password,
          workerCompanyId,
        },
      });

      const htmlTemplate = RenderedUserCreateTemplate({
        name: fullName,
        email,
        password: rawPassword,
      });

      await sendEmail(email, "Welcome to SaaS", htmlTemplate);
    }),
  removeUser: protectedProcedure
    .input(userRemoveSchema)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      await ctx.db.user.delete({
        where: { id },
      });
    }),

  edit: protectedProcedure
    .input(userEditSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, role, fullName, password, email } = input;

      const user = await ctx.db.user.findUnique({
        where: {
          id,
        },
      });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      if (
        ctx.session.user.id !== id &&
        //@ts-expect-error Could be else than WORKER
        ![UserRole.ADMIN, UserRole.MANAGER].includes(ctx.session.user.role)
      )
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const newPass = !!password ? await argon2.hash(password) : null;

      if (ctx.session.user.role === UserRole.MANAGER) {
        const company = await ctx.db.company.findUnique({
          where: {
            representativeId: ctx.session.user.id,
          },
          include: {
            workers: true,
          },
        });

        if (!company)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const accessWorker = company.workers.find((worker) => worker.id === id);

        if (!accessWorker)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await db.user.update({
        where: {
          id,
        },
        data: {
          name: fullName,
          ...(!newPass ? {} : { password: newPass }),
          ...(ctx.session.user.role === UserRole.ADMIN ? { role } : {}),
          email,
        },
      });

      if (email !== user.email) {
        const htmlTemplate = RenderedEmailChangeTemplate({
          name: fullName,
          newEmail: email,
        });
        await sendEmail(email, "Email changed", htmlTemplate);
      }

      if (password !== undefined) {
        const htmlTemplate = RenderedPasswordChangeTemplate({
          name: fullName,
          password,
        });
        await sendEmail(email, "Password changed", htmlTemplate);
      }
    }),
});
