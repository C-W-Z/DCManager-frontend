import { z } from "zod";

export const ip_range = z.object({
  start_ip: z.string().ip(),
  end_ip: z.string().ip(),
});
export type IpRange = z.infer<typeof ip_range>;

export const host = z.object({
  id: z.string().uuid().nullable(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  ip: z.string().ip(),
  service_id: z.string().uuid(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
  rack_id: z.string().uuid(),
  pos: z.number().int().min(1).max(60),
});
export type Host = z.infer<typeof host>;

export const simple_host = host.pick({
  id: true,
  name: true,
  height: true,
  pos: true,
});
export type SimpleHost = z.infer<typeof simple_host>;

export const rack = z.object({
  id: z.string().uuid().nullable(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  n_hosts: z.number().int().min(0),
  hosts: z.array(simple_host),
  service_id: z.string().uuid(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
});
export type Rack = z.infer<typeof rack>;

export const simple_rack = rack.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  service_id: true,
});
export type SimpleRack = z.infer<typeof simple_rack>;

export const room = z.object({
  id: z.string().uuid().nullable(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  n_hosts: z.number().int().min(0),
  n_racks: z.number().int().min(0),
  racks: z.array(simple_rack),
  dc_id: z.string().uuid(),
});
export type Room = z.infer<typeof room>;

export const simple_room = room.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  n_racks: true,
});
export type SimpleRoom = z.infer<typeof simple_room>;

export const datacenter = z.object({
  id: z.string().uuid().nullable(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  ip_ranges: z.array(ip_range),
  n_hosts: z.number().int().min(0),
  n_racks: z.number().int().min(0),
  n_rooms: z.number().int().min(0),
  rooms: z.array(simple_room),
});
export type Datacenter = z.infer<typeof datacenter>;

export const simple_datacenter = datacenter.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  n_racks: true,
  n_rooms: true,
});
export type SimpleDatacenter = z.infer<typeof simple_datacenter>;

export const service = z.object({
  id: z.string().uuid().nullable(),
  name: z.string(),
  n_hosts: z.number().int().min(0),
  n_racks: z.number().int().min(0),
  racks: z.array(simple_rack),
  total_ip: z.number().int().min(0),
  ip_list: z.array(z.string().ip()),
});
export type Service = z.infer<typeof service>;

export const simple_service = service.pick({
  id: true,
  name: true,
  n_hosts: true,
  n_racks: true,
  total_ip: true,
});
export type SimpleService = z.infer<typeof simple_service>;
