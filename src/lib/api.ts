import * as mytype from "./type";

const baseUrl = import.meta.env.VITE_API_URL;

export async function addDC(body: Pick<mytype.Datacenter, "name" | "height" | "ip_ranges">) {
  console.log("addDC", body);

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
  console.log("getAllDC");

  const response = await fetch(`${baseUrl}/dc/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch datacenters"));
  }
  return response.json();
}

export async function getDC(dc_id: string): Promise<mytype.Datacenter> {
  console.log("getDC", dc_id);

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
  console.log("modifyDC", dc_id, body);

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
  console.log("deleteDC", dc_id);

  const response = await fetch(`${baseUrl}/dc/${dc_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete datacenter"));
  }
  return;
}

export async function addRoom(body: Pick<mytype.Room, "name" | "height" | "dc_id">) {
  console.log("addRoom", body);

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
  console.log("getRoom", room_id);

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
  console.log("modifyRoom", room_id, body);

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
  console.log("deleteRoom", room_id);

  const response = await fetch(`${baseUrl}/room/${room_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete room"));
  }
  return;
}

export async function addRack(
  body: Pick<mytype.Rack, "name" | "height" | "room_id" | "dc_id" | "service_id">,
) {
  console.log("addRack", body);

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

export async function getAllRack(): Promise<mytype.SimpleRack[]> {
  console.log("getAllRack");

  const response = await fetch(`${baseUrl}/rack/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch racks"));
  }
  return response.json();
}

export async function getRack(rack_id: string): Promise<mytype.Rack> {
  console.log("getRack", rack_id);

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
  console.log("modifyRack", rack_id, body);

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
  console.log("deleteRack", rack_id);

  const response = await fetch(`${baseUrl}/rack/${rack_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete rack"));
  }
  return;
}

export async function addHost(
  body: Pick<mytype.Host, "name" | "height" | "rack_id" | "room_id" | "dc_id" | "pos">,
): Promise<string> {
  console.log("addHost", body);

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
  console.log("getHost", host_id);

  const response = await fetch(`${baseUrl}/host/${host_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Host not found"));
  }
  return response.json();
}

export async function modifyHost(
  host_id: string,
  body: Partial<Pick<mytype.Host, "name" | "height" | "ip" | "status" | "rack_id" | "pos">>,
): Promise<void> {
  console.log("modifyHost", host_id, body);

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
  console.log("deleteHost", host_id);

  const response = await fetch(`${baseUrl}/host/${host_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete host"));
  }
  return;
}

export async function addService(
  body: Pick<mytype.Service, "name" | "n_racks" | "total_ip">,
): Promise<mytype.Service> {
  console.log("addService", body);

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
  return response.json();
}

export async function getAllService(): Promise<mytype.SimpleService[]> {
  console.log("getAllService");

  const response = await fetch(`${baseUrl}/service/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch services"));
  }
  return response.json();
}

export async function getService(service_id: string): Promise<mytype.Service> {
  console.log("getService", service_id);

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
  console.log("modifyService", service_id, body);

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
  console.log("extendServiceRack", service_id, num);

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
  console.log("extendServiceIP", service_id, num);

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
  console.log("deleteService", service_id);

  const response = await fetch(`${baseUrl}/service/${service_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete service"));
  }
  return;
}
