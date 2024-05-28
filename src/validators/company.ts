import { z } from "zod";

export const companyCreateSchema = z.object({
  companyName: z
    .string()
    .min(4, "Company name must be have at least 3 characters"),
  userId: z.string(),
});

export type companyCreateSchemaType = z.infer<typeof companyCreateSchema>;

export const companyRemoveSchema = z.object({
  id: z.string(),
});

export const companyDataSchema = companyRemoveSchema;

export const companyEditSchema = z.object({
  companyId: z.string(),
  companyName: z
    .string()
    .min(4, "Company name must be have at least 3 characters"),
  userId: z.string(),
});

export type companyEditSchemaType = z.infer<typeof companyEditSchema>;

export const companyAddFactoryPlanScheme = z.object({
  image: z.string(),
});

export const companyGetFactoryPlanScheme = z.object({
  id: z.string(),
});
