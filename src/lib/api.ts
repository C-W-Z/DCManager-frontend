import * as schema from "./schema";
import { faker } from "@faker-js/faker";
import * as mock from "./mock";

export function addDC(
  body: Pick<schema.Datacenter, "name" | "height">,
): Promise<string | null> {
  console.log("addDC", body);
  return Promise.resolve(faker.string.uuid());
}

export function getAllDC(): Promise<schema.SimpleDatacenter[]> {
  console.log("getAllDC");
  return Promise.resolve(Array.from({ length: 10 }, () => mock.generateMockSimpleDC()));
}

export function getDC(dc_id: string): Promise<schema.Datacenter> {
  console.log("getDC", dc_id);
  return Promise.resolve(mock.generateMockDC());
}

export function modifyDC(
  dc_id: string,
  body: Pick<schema.Datacenter, "name" | "height" | "ip_ranges">,
) {
  console.log("modifyDC", dc_id, body);
  return null;
}

export function deleteDC(dc_id: string) {
  console.log("deleteDC", dc_id);
  return null;
}

export function addRoom(
  body: Pick<schema.Room, "name" | "height" | "dc_id">,
): Promise<string | null> {
  console.log("addRoom", body);
  return Promise.resolve(faker.string.uuid());
}

export function getRoom(room_id: string): Promise<schema.Room> {
  console.log("getRoom", room_id);
  return Promise.resolve(mock.generateMockRoom());
}

export function modifyRoom(
  room_id: string,
  body: Pick<schema.Room, "name" | "height" | "dc_id">,
) {
  console.log("modifyRoom", room_id, body);
  return null;
}

export function deleteRoom(room_id: string) {
  console.log("deleteRoom", room_id);
  return null;
}

export function addRack(
  body: Pick<schema.Rack, "name" | "height" | "room_id" | "dc_id">,
): Promise<string | null> {
  console.log("addRack", body);
  return Promise.resolve(faker.string.uuid());
}

export function getRack(rack_id: string): Promise<schema.Rack> {
  console.log("getRack", rack_id);
  return Promise.resolve(mock.generateMockRack());
}

export function modifyRack(
  rack_id: string,
  body: Pick<schema.Rack, "name" | "height" | "room_id" | "service_id">,
) {
  console.log("modifyRack", rack_id, body);
  return null;
}

export function deleteRack(rack_id: string) {
  console.log("deleteRack", rack_id);
  return null;
}

export function addHost(
  body: Pick<schema.Host, "name" | "height" | "rack_id" | "room_id" | "dc_id" | "pos">,
): Promise<string | null> {
  console.log("addHost", body);
  return Promise.resolve(faker.string.uuid());
}

export function getHost(host_id: string): Promise<schema.Host> {
  console.log("getHost", host_id);
  return Promise.resolve(mock.generateMockHost());
}

export function modifyHost(
  host_id: string,
  body: Pick<schema.Host, "name" | "height" | "service_id" | "rack_id" | "pos">,
) {
  console.log("modifyHost", host_id, body);
  return null;
}

export function deleteHost(host_id: string) {
  console.log("deleteHost", host_id);
  return null;
}

export function addService(
  body: Pick<schema.Service, "name" | "n_racks" | "total_ip">,
): Promise<string | null> {
  console.log("addService", body);
  return Promise.resolve(faker.string.uuid());
}

export function getAllService(): Promise<schema.SimpleService[]> {
  console.log("getAllService");
  return Promise.resolve(Array.from({ length: 10 }, () => mock.generateMockSimpleService()));
}

export function getService(service_id: string): Promise<schema.Service> {
  console.log("getService", service_id);
  return Promise.resolve(mock.generateMockService());
}

export function modifyService(service_id: string, body: Pick<schema.Service, "name">) {
  console.log("modifyService", service_id, body);
  return null;
}

export function extendServiceRack(service_id: string, num: number) {
  console.log("extendServiceRack", service_id, num);
  return null;
}

export function extendServiceIP(service_id: string, num: number) {
  console.log("extendServiceIP", service_id, num);
  return null;
}

export function deleteService(service_id: string) {
  console.log("deleteService", service_id);
  return null;
}
