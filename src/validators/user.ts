import { z } from "zod";
import { UserRole } from "@prisma/client";

export const userCreateSchema = z.object({
  email: z.string().email("Input must be a valid email address"),
  fullName: z.string().min(3, "User full name must be at least 3 characters"),
  role: z.enum(Object.values(UserRole) as [UserRole, ...UserRole[]]),
  companyId: z.string().optional(),
});

export type userCreateSchemaType = z.infer<typeof userCreateSchema>;

export const userRemoveSchema = z.object({
  id: z.string(),
});

export type userRemoveSchemaType = z.infer<typeof userRemoveSchema>;

export const userGetFilterSchema = z.object({
  companyId: z.string().optional(),
  userRole: z.enum(Object.values(UserRole) as [UserRole, ...UserRole[]]),
});
