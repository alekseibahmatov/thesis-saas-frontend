import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

export const workingHourGetAllSchema = z.object({
  companyId: z.string().optional(),
  workerId: z.string().optional(),
});

export type workingHourGetAllSchemaType = z.infer<
  typeof workingHourGetAllSchema
>;

export const workingHourRemoveSchema = z.object({
  id: z.string(),
});

export const workingHourCreateSchema = z.object({
  name: z.string(),
  dayOfWeek: z.enum(Object.values(DayOfWeek) as [DayOfWeek, ...DayOfWeek[]]),
  from: z.string(),
  until: z.string(),
  companyId: z.string().optional(),
});

export type workingHourCreateSchemaType = z.infer<
  typeof workingHourCreateSchema
>;

export const workingHourEditSchema = workingHourCreateSchema.extend({
  id: z.string(),
});

export type workingHourEditSchemaType = z.infer<typeof workingHourEditSchema>;

export const workingHourAssignUnassignScheme = z.object({
  id: z.string(),
  workerId: z.string(),
  companyId: z.string().optional(),
});
