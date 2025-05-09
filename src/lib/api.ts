import * as mytype from "./type";
import { faker } from "@faker-js/faker";
import d from "./mock_data.json";

const MockData = d as mytype.MockDataJson;

export function addDC(body: Pick<mytype.Datacenter, "name" | "height" | "ip_ranges">) {
  console.log("addDC", body);
  return Promise.resolve(faker.string.uuid());
}

export function getAllDC(): Promise<mytype.SimpleDatacenter[]> {
  console.log("getAllDC");
  return Promise.resolve(MockData.dc as mytype.SimpleDatacenter[]);
}

export function getDC(dc_id: string): Promise<mytype.Datacenter> {
  console.log("getDC", dc_id);

  const dc = MockData.dc.find((dc) => dc.id === dc_id);
  if (!dc) {
    return Promise.reject(new Error("Datacenter not found"));
  }
  return Promise.resolve(dc);
}

export function modifyDC(
  dc_id: string,
  body: Pick<mytype.Datacenter, "name" | "height" | "ip_ranges">,
) {
  console.log("modifyDC", dc_id, body);
  return null;
}

export function deleteDC(dc_id: string) {
  console.log("deleteDC", dc_id);
  return null;
}

export function addRoom(body: Pick<mytype.Room, "name" | "height" | "dc_id">) {
  console.log("addRoom", body);
  return Promise.resolve(faker.string.uuid());
}

export function getRoom(room_id: string): Promise<mytype.Room> {
  console.log("getRoom", room_id);

  const room = MockData.room.find((room) => room.id === room_id);
  if (!room) {
    return Promise.reject(new Error("Room not found"));
  }
  return Promise.resolve(room);
}

export function modifyRoom(
  room_id: string,
  body: Pick<mytype.Room, "name" | "height" | "dc_id">,
) {
  console.log("modifyRoom", room_id, body);
  return null;
}

export function deleteRoom(room_id: string) {
  console.log("deleteRoom", room_id);
  return null;
}

export function addRack(body: Pick<mytype.Rack, "name" | "height" | "room_id" | "dc_id">) {
  console.log("addRack", body);
  return Promise.resolve(faker.string.uuid());
}

export function getRack(rack_id: string): Promise<mytype.Rack> {
  console.log("getRack", rack_id);

  const rack = MockData.rack.find((rack) => rack.id === rack_id);
  if (!rack) {
    return Promise.reject(new Error("Rack not found"));
  }
  return Promise.resolve(rack);
}

export function modifyRack(
  rack_id: string,
  body: Pick<mytype.Rack, "name" | "height" | "room_id" | "service_id">,
) {
  console.log("modifyRack", rack_id, body);
  return null;
}

export function deleteRack(rack_id: string) {
  console.log("deleteRack", rack_id);
  return null;
}

export function addHost(
  body: Pick<mytype.Host, "name" | "height" | "rack_id" | "room_id" | "dc_id" | "pos">,
) {
  console.log("addHost", body);
  return Promise.resolve(faker.string.uuid());
}

export function getHost(host_id: string): Promise<mytype.Host> {
  console.log("getHost", host_id);

  const host = MockData.host.find((host) => host.id === host_id);
  if (!host) {
    return Promise.reject(new Error("Host not found"));
  }
  return Promise.resolve(host);
}

export function modifyHost(
  host_id: string,
  body: Pick<mytype.Host, "name" | "height" | "rack_id" | "pos">,
) {
  console.log("modifyHost", host_id, body);
  return Promise.resolve("success");
}

export function deleteHost(host_id: string) {
  console.log("deleteHost", host_id);
  return Promise.resolve("success");
}

export function addService(body: Pick<mytype.Service, "name" | "n_racks" | "total_ip">) {
  console.log("addService", body);
  return Promise.resolve(faker.string.uuid());
}

export function getAllService(): Promise<mytype.SimpleService[]> {
  console.log("getAllService");
  return Promise.resolve(MockData.service as mytype.SimpleService[]);
}

export function getService(service_id: string): Promise<mytype.Service> {
  console.log("getService", service_id);

  const service = MockData.service.find((service) => service.id === service_id);
  if (!service) {
    return Promise.reject(new Error("Service not found"));
  }
  return Promise.resolve(service);
}

export function modifyService(service_id: string, body: Pick<mytype.Service, "name">) {
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
