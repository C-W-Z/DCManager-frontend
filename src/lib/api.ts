import * as schema from "./schema";

type Host = Zod.infer<typeof schema.host_schema>;
type Rack = Zod.infer<typeof schema.rack_schema>;
type Room = Zod.infer<typeof schema.room_schema>;
type Datacenter = Zod.infer<typeof schema.datacenter_schema>;
type Service = Zod.infer<typeof schema.service_schema>;

export function addNewHostToRack() {}
export function getHostsByService() {}
export function getHostsByRack() {}
export function modifyHost() {}
export function deleteHost() {}

export function addNewRackToRoom() {}
export function getRacksByService() {}
export function getRacksByRoom() {}
export function modifyRack() {}
export function modifyMultipleRacks() {}
export function deleteRack() {}
