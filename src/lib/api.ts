import * as schema from "./schema";

export function addDC(name: string, height: number) {}
export function GetAllDC(): Promise<schema.SimpleDatacenter[]> {}
export function GetDC(dc_id: string): Promise<schema.Datacenter> {}
export function ModifyDC(dc_id: string, body: schema.SimpleDatacenter) {}
