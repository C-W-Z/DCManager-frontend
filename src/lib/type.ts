import { z } from "zod";

export type Host = z.infer<typeof host_schema>;
export const host_schema = z.object({
  name: z.string(),
  height: z.number().int(),
  ip: z.string().ip(),
  running: z.boolean(),
  service_name: z.string(),
  dc_name: z.string(),
  room_name: z.string(),
  rack_name: z.string(),
  pos: z.number().int(),
});

export type Rack = z.infer<typeof rack_schema>;
export const rack_schema = z.object({
  name: z.string(),
  height: z.number().int(),
  capacity: z.number().int(),
  n_hosts: z.number().int(),
  hosts: z.array(host_schema),
  service_name: z.string(),
  dc_name: z.string(),
  room_name: z.string(),
});

export type SimpleRack = z.infer<typeof simple_rack_schema>;
export const simple_rack_schema = rack_schema.pick({
  name: true,
  height: true,
  capacity: true,
  n_hosts: true,
  service_name: true,
  room_name: true,
});

export type Room = z.infer<typeof room_schema>;
export const room_schema = z.object({
  name: z.string(),
  height: z.number().int(),
  n_racks: z.number().int(),
  racks: z.array(simple_rack_schema),
  n_hosts: z.number().int(),
  dc_name: z.string(),
});

export type SimpleRoom = z.infer<typeof simple_room_schema>;
export const simple_room_schema = room_schema.pick({
  name: true,
  height: true,
  n_racks: true,
  n_hosts: true,
  dc_name: true,
});

export type Datacenter = z.infer<typeof datacenter_schema>;
export const datacenter_schema = z.object({
  name: z.string(),
  height: z.number().int(),
  n_rooms: z.number().int(),
  rooms: z.array(simple_room_schema),
  n_racks: z.number().int(),
  n_hosts: z.number().int(),
});

export type SimpleDatacenter = z.infer<typeof simple_datacenter_schema>;
export const simple_datacenter_schema = datacenter_schema.pick({
  name: true,
  height: true,
  n_rooms: true,
  n_racks: true,
  n_hosts: true,
});

export type Service = z.infer<typeof service_schema>;
export const service_schema = z.object({
  name: z.string(),
  allocated_racks: z.record(z.string(), z.array(simple_rack_schema)),
  hosts: z.array(host_schema),
  username: z.string(),
  allocated_subnets: z.array(z.string()),
  total_ip_list: z.array(z.string().ip()),
  available_ip_list: z.array(z.string().ip()),
});

export type SimpleService = z.infer<typeof simple_service_schema>;
export const simple_service_schema = z.object({
  name: z.string(),
  n_allocated_racks: z.record(z.string(), z.number().int()),
  n_hosts: z.number().int(),
  username: z.string(),
  allocated_subnets: z.array(z.string()),
  total_ip_list: z.array(z.string().ip()),
  available_ip_list: z.array(z.string().ip()),
});

export type User = z.infer<typeof user_schema>;
export const user_schema = z.object({
  username: z.string(),
  role: z.enum(["admin", "normal"]),
});

export type UserPassword = z.infer<typeof user_password_schema>;
export const user_password_schema = user_schema.extend({
  password: z.string(),
});

export type MockDataJson = {
  data_centers: Datacenter[];
  rooms: Room[];
  racks: Rack[];
  hosts: Host[];
  services: Service[];
  users: UserPassword[];
};

interface APIError {
  error: string;
  code?: number;
}

class APIErrorImpl implements APIError {
  code?: number;
  error: string;

  constructor(error: string, code?: number) {
    this.code = code;
    this.error = error;
  }
}

export { APIErrorImpl as APIError };
