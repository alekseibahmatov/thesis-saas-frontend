import { z } from "zod";

export const machinesGetAllScheme = z.object({
  companyId: z.string().optional(),
});

export const machineCreateScheme = z.object({
  name: z.string().min(3, "Machine name must be at least 3 characters"),
  dockIp: z
    .string()
    .regex(
      RegExp("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"),
      "Invalid IPv4 presented",
    ),
  companyId: z.string().optional(),
});

export type machineCreateSchemeType = z.infer<typeof machineCreateScheme>;

export const machineEditScheme = z.object({
  name: z.string().min(3, "Machine name must be at least 3 characters"),
  dockIp: z
    .string()
    .regex(
      RegExp("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"),
      "Invalid IPv4 presented",
    ),
  machineId: z.string().optional(),
  companyId: z.string().optional(),
});

export type machineEditSchemeType = z.infer<typeof machineEditScheme>;

export const machineRemoveScheme = z.object({
  machineId: z.string(),
});

export const machineMoveScheme = z.object({
  id: z.string(),
  positionX: z.number(),
  positionY: z.number(),
});
