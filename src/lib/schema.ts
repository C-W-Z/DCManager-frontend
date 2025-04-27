import { z } from "zod";

export const hostSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int().min(0),
  ip: z.string().ip(),

  service_id: z.string().uuid(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
  rack_id: z.string().uuid(),
});
export type Host = z.infer<typeof hostSchema>;

export const rackSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int().min(0),
  n_hosts: z.number().int().min(0),
  hosts: z.array(
    hostSchema.extend({
      pos: z.number(),
    }),
  ),
  dc_id: z.string(),
  room_id: z.string(),
});
export type Rack = z.infer<typeof rackSchema>;
