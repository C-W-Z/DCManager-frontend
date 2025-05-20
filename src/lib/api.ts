import * as mytype from "./type";
import { faker } from "@faker-js/faker";
import d from "./mock_data.json";

const baseUrl = import.meta.env.VITE_API_URL;
console.log("baseUrl", baseUrl);

const mode = import.meta.env.VITE_API_MODE;
console.log("api mode", mode);

const MockData = d as unknown as mytype.MockDataJson;

/* Datacenter */
export async function addDC(body: Pick<mytype.Datacenter, "name" | "height" | "ip_ranges">) {
  if (mode === "mock") {
    return Promise.resolve(faker.string.uuid());
  }

  const response = await fetch(`${baseUrl}/dc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to add datacenter"));
  }
  return response.json();
}

export async function getAllDC(): Promise<mytype.SimpleDatacenter[]> {
  if (mode === "mock") {
    return Promise.resolve(MockData.dc as mytype.SimpleDatacenter[]);
  }

  const response = await fetch(`${baseUrl}/dc/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch datacenters"));
  }
  return response.json();
}

export async function getDC(dc_id: string): Promise<mytype.Datacenter> {
  if (mode === "mock") {
    const dc = MockData.dc.find((dc) => dc.id === dc_id);
    if (!dc) {
      return Promise.reject(new Error("Datacenter not found"));
    }
    return Promise.resolve(dc);
  }

  const response = await fetch(`${baseUrl}/dc/${dc_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Datacenter not found"));
  }
  return response.json();
}

export async function modifyDC(
  dc_id: string,
  body: Partial<Pick<mytype.Datacenter, "name" | "height" | "ip_ranges">>,
): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/dc/${dc_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to edit datacenter"));
  }
  return;
}

export async function deleteDC(dc_id: string): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/dc/${dc_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete datacenter"));
  }
  return;
}

/* Room */
export async function addRoom(body: Pick<mytype.Room, "name" | "height" | "dc_id">) {
  if (mode === "mock") {
    return Promise.resolve(faker.string.uuid());
  }

  const response = await fetch(`${baseUrl}/room/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to add room"));
  }
  return response.json();
}

export async function getRoom(room_id: string): Promise<mytype.Room> {
  if (mode === "mock") {
    const room = MockData.room.find((room) => room.id === room_id);
    if (!room) {
      return Promise.reject(new Error("Room not found"));
    }
    return Promise.resolve(room);
  }

  const response = await fetch(`${baseUrl}/room/${room_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Room not found"));
  }
  return response.json();
}

export async function modifyRoom(
  room_id: string,
  body: Partial<Pick<mytype.Room, "name" | "height" | "dc_id">>,
): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/room/${room_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to edit room"));
  }
  return;
}

export async function deleteRoom(room_id: string): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/room/${room_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete room"));
  }
  return;
}

/* Rack */
export async function addRack(body: Pick<mytype.Rack, "name" | "height" | "room_id">) {
  if (mode === "mock") {
    return Promise.resolve(faker.string.uuid());
  }

  const response = await fetch(`${baseUrl}/rack/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to add rack"));
  }
  return response.json();
}

export async function getRack(rack_id: string): Promise<mytype.Rack> {
  if (mode === "mock") {
    const rack = MockData.rack.find((rack) => rack.id === rack_id);
    if (!rack) {
      return Promise.reject(new Error("Rack not found"));
    }
    return Promise.resolve(rack);
  }

  const response = await fetch(`${baseUrl}/rack/${rack_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Rack not found"));
  }
  return response.json();
}

export async function modifyRack(
  rack_id: string,
  body: Partial<Pick<mytype.Rack, "name" | "height" | "room_id" | "service_id">>,
): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/rack/${rack_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to edit rack"));
  }
  return;
}

export async function deleteRack(rack_id: string): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/rack/${rack_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete rack"));
  }
  return;
}

/* Host */
export async function addHost(
  body: Pick<mytype.Host, "name" | "height" | "rack_id" | "service_id" | "pos">,
): Promise<string> {
  if (mode === "mock") {
    return Promise.resolve(faker.string.uuid());
  }

  const response = await fetch(`${baseUrl}/host/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to add host"));
  }
  const data = await response.json();
  return data.id as string;
}

export async function getHost(host_id: string): Promise<mytype.Host> {
  if (mode === "mock") {
    const host = MockData.host.find((host) => host.id === host_id);
    if (!host) {
      return Promise.reject(new Error("Host not found"));
    }
    return Promise.resolve(host);
  }

  const response = await fetch(`${baseUrl}/host/${host_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Host not found"));
  }
  return response.json();
}

export async function modifyHost(
  host_id: string,
  body: Partial<Pick<mytype.Host, "name" | "height" | "running" | "rack_id" | "pos">>,
): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/host/${host_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to edit host"));
  }
  return;
}

export async function deleteHost(host_id: string): Promise<void> {
  if (mode === "mock") {
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/host/${host_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete host"));
  }
  return;
}

/* Service */
export async function addService(
  body: Pick<mytype.Service, "name" | "n_racks" | "total_ip">,
): Promise<string> {
  if (mode === "mock") {
    console.log("addService", body);
    return Promise.resolve(faker.string.uuid());
  }

  const response = await fetch(`${baseUrl}/service/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to add service"));
  }
  const data = await response.json();
  return data.id as string;
}

export async function getAllService(): Promise<mytype.SimpleService[]> {
  if (mode === "mock") {
    console.log("getAllService");
    return Promise.resolve(MockData.service as mytype.SimpleService[]);
  }

  const response = await fetch(`${baseUrl}/service/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch services"));
  }
  return response.json();
}

export async function getService(service_id: string): Promise<mytype.Service> {
  if (mode === "mock") {
    console.log("getService", service_id);

    const service = MockData.service.find((service) => service.id === service_id);
    if (!service) {
      return Promise.reject(new Error("Service not found"));
    }
    return Promise.resolve(service);
  }

  const response = await fetch(`${baseUrl}/service/${service_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Service not found"));
  }
  return response.json();
}

export async function modifyService(
  service_id: string,
  body: Pick<mytype.Service, "name">,
): Promise<void> {
  if (mode === "mock") {
    console.log("modifyService", service_id, body);
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/service/${service_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to modify service"));
  }
  return;
}

export async function extendServiceRack(service_id: string, num: number): Promise<void> {
  if (mode === "mock") {
    console.log("extendServiceRack", service_id, num);
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/service/${service_id}/rack/extend`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ num }),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to extend service rack"));
  }
  return;
}

export async function extendServiceIP(service_id: string, num: number): Promise<void> {
  if (mode === "mock") {
    console.log("extendServiceIP", service_id, num);
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/service/${service_id}/ip/extend`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ num }),
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to extend service IP"));
  }
  return;
}

export async function deleteService(service_id: string): Promise<void> {
  if (mode === "mock") {
    console.log("deleteService", service_id);
    return Promise.resolve();
  }

  const response = await fetch(`${baseUrl}/service/${service_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete service"));
  }
  return;
}
