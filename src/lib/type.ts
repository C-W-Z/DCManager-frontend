import { z } from "zod";

export type IpRange = z.infer<typeof ip_range_schema>;
export const ip_range_schema = z.object({
  start_ip: z.string().ip(),
  end_ip: z.string().ip(),
});

export type Host = z.infer<typeof host_schema>;
export const host_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int(),
  status: z.enum(["running", "stopped", "idle"]),
  ip: z.string().ip(),
  service_id: z.string().uuid(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
  rack_id: z.string().uuid(),
  pos: z.number().int(),
});

export type SimpleHost = z.infer<typeof simple_host_schema>;
export const simple_host_schema = host_schema.pick({
  id: true,
  name: true,
  height: true,
  status: true,
  rack_id: true,
  pos: true,
});

export type Rack = z.infer<typeof rack_schema>;
export const rack_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int(),
  capacity: z.number().int(),
  n_hosts: z.number().int(),
  hosts: z.array(simple_host_schema),
  service_id: z.string().uuid(),
  service_name: z.string(),
  dc_id: z.string().uuid(),
  room_id: z.string().uuid(),
});

export type SimpleRack = z.infer<typeof simple_rack_schema>;
export const simple_rack_schema = rack_schema.pick({
  id: true,
  name: true,
  height: true,
  capacity: true,
  n_hosts: true,
  service_id: true,
  service_name: true,
  room_id: true,
});

export type Room = z.infer<typeof room_schema>;
export const room_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int(),
  n_hosts: z.number().int(),
  n_racks: z.number().int(),
  racks: z.array(simple_rack_schema),
  dc_id: z.string().uuid(),
});

export type SimpleRoom = z.infer<typeof simple_room_schema>;
export const simple_room_schema = room_schema.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  n_racks: true,
  dc_id: true,
});

export type Datacenter = z.infer<typeof datacenter_schema>;
export const datacenter_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  height: z.number().int(),
  ip_ranges: z.array(ip_range_schema),
  n_hosts: z.number().int(),
  n_racks: z.number().int(),
  n_rooms: z.number().int(),
  rooms: z.array(simple_room_schema),
});

export type SimpleDatacenter = z.infer<typeof simple_datacenter_schema>;
export const simple_datacenter_schema = datacenter_schema.pick({
  id: true,
  name: true,
  height: true,
  n_hosts: true,
  n_racks: true,
  n_rooms: true,
});

export type Service = z.infer<typeof service_schema>;
export const service_schema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  n_hosts: z.number().int(),
  n_racks: z.number().int(),
  racks: z.array(simple_rack_schema),
  total_ip: z.number().int(),
  ip_list: z.array(z.string().ip()),
});

export type SimpleService = z.infer<typeof simple_service_schema>;
export const simple_service_schema = service_schema.pick({
  id: true,
  name: true,
  n_hosts: true,
  n_racks: true,
  total_ip: true,
});

export type MockDataJson = {
  dc: Datacenter[];
  room: Room[];
  rack: Rack[];
  host: Host[];
  service: Service[];
};
