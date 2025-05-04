import { z } from "zod";

export const ip_range_schema = z.object({
  start_ip: z.string().ip(),
  end_ip: z.string().ip(),
});
export type IpRange = z.infer<typeof ip_range_schema>;

export const host_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  status: z.enum(["running", "stopped", "idle"]),
  ip: z.string().ip(),
  service_id: z.string().uuid(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
  rack_id: z.string().uuid(),
  pos: z.number().int().min(1).max(60),
});
export type Host = z.infer<typeof host_schema>;

export const simple_host_schema = host_schema.pick({
  id: true,
  name: true,
  height: true,
  status: true,
  pos: true,
});
export type SimpleHost = z.infer<typeof simple_host_schema>;

export const rack_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  n_hosts: z.number().int().min(0),
  hosts: z.array(simple_host_schema),
  service_id: z.string().uuid(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
});
export type Rack = z.infer<typeof rack_schema>;

export const simple_rack_schema = rack_schema.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  service_id: true,
});
export type SimpleRack = z.infer<typeof simple_rack_schema>;

export const room_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  n_hosts: z.number().int().min(0),
  n_racks: z.number().int().min(0),
  racks: z.array(simple_rack_schema),
  dc_id: z.string().uuid(),
});
export type Room = z.infer<typeof room_schema>;

export const simple_room_schema = room_schema.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  n_racks: true,
});
export type SimpleRoom = z.infer<typeof simple_room_schema>;

export const datacenter_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int().min(1).max(60),
  ip_ranges: z.array(ip_range_schema),
  n_hosts: z.number().int().min(0),
  n_racks: z.number().int().min(0),
  n_rooms: z.number().int().min(0),
  rooms: z.array(simple_room_schema),
});
export type Datacenter = z.infer<typeof datacenter_schema>;

export const simple_datacenter_schema = datacenter_schema.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  n_racks: true,
  n_rooms: true,
});
export type SimpleDatacenter = z.infer<typeof simple_datacenter_schema>;

export const service_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  n_hosts: z.number().int().min(0),
  n_racks: z.number().int().min(0),
  racks: z.array(simple_rack_schema),
  total_ip: z.number().int().min(0),
  ip_list: z.array(z.string().ip()),
});
export type Service = z.infer<typeof service_schema>;

export const simple_service_schema = service_schema.pick({
  id: true,
  name: true,
  n_hosts: true,
  n_racks: true,
  total_ip: true,
});
export type SimpleService = z.infer<typeof simple_service_schema>;
