import { z } from "zod";

export const voiceChannelGetAllScheme = z.object({
  workerId: z.string().optional(),
  companyId: z.string().optional(),
});

export type voiceChannelGetAllSchemeType = z.infer<
  typeof voiceChannelGetAllScheme
>;

export const voiceChannelsAssignUnassignScheme = z.object({
  id: z.string(),
  workerId: z.string(),
  companyId: z.string().optional(),
});

export const voiceChannelsCreateScheme = z.object({
  companyId: z.string().optional(),
  name: z.string(),
});

export type voiceChannelsCreateSchemeType = z.infer<
  typeof voiceChannelsCreateScheme
>;

export const voiceChannelsRemoveScheme = z.object({
  id: z.string(),
});

export const voiceChannelsEditScheme = z.object({
  id: z.string(),
  companyId: z.string().optional(),
  name: z.string(),
});

export type voiceChannelsEditSchemeType = z.infer<
  typeof voiceChannelsEditScheme
>;
