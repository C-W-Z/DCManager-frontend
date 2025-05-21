import * as mytype from "./type";

const baseUrl = import.meta.env.VITE_API_URL;
console.log("baseUrl", baseUrl);

/* Datacenter */
export async function addDC(body: Pick<mytype.Datacenter, "name" | "height">) {
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
  return [
    {
      name: "DC-North-01",
      height: 42,
      n_rooms: 5,
      n_racks: 50,
      n_hosts: 200,
    },
    {
      name: "DC-South-02",
      height: 48,
      n_rooms: 3,
      n_racks: 30,
      n_hosts: 120,
    },
    {
      name: "DC-East-03",
      height: 40,
      n_rooms: 4,
      n_racks: 40,
      n_hosts: 160,
    },
    {
      name: "DC-West-04",
      height: 45,
      n_rooms: 6,
      n_racks: 60,
      n_hosts: 240,
    },
  ];
  const response = await fetch(`${baseUrl}/dc/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch datacenters"));
  }
  return response.json();
}

export async function getDC(dc_name: string): Promise<mytype.Datacenter> {
  const response = await fetch(`${baseUrl}/dc/${dc_name}`);
  if (!response.ok) {
    return Promise.reject(new Error("Datacenter not found"));
  }
  return response.json();
}

export async function modifyDC(
  dc_name: string,
  body: Partial<Pick<mytype.Datacenter, "name" | "height">>,
): Promise<void> {
  const response = await fetch(`${baseUrl}/dc/${dc_name}`, {
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

export async function deleteDC(dc_name: string): Promise<void> {
  const response = await fetch(`${baseUrl}/dc/${dc_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete datacenter"));
  }
  return;
}

/* Room */
export async function addRoom(body: Pick<mytype.Room, "name" | "height" | "dc_name">) {
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

export async function getRoom(room_name: string): Promise<mytype.Room> {
  const response = await fetch(`${baseUrl}/room/${room_name}`);
  if (!response.ok) {
    return Promise.reject(new Error("Room not found"));
  }
  return response.json();
}

export async function modifyRoom(
  room_name: string,
  body: Partial<Pick<mytype.Room, "name" | "height" | "dc_name">>,
): Promise<void> {
  const response = await fetch(`${baseUrl}/room/${room_name}`, {
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

export async function deleteRoom(room_name: string): Promise<void> {
  const response = await fetch(`${baseUrl}/room/${room_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete room"));
  }
  return;
}

/* Rack */
export async function addRack(body: Pick<mytype.Rack, "name" | "height" | "room_name">) {
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

export async function getRack(rack_name: string): Promise<mytype.Rack> {
  const response = await fetch(`${baseUrl}/rack/${rack_name}`);
  if (!response.ok) {
    return Promise.reject(new Error("Rack not found"));
  }
  return response.json();
}

export async function modifyRack(
  rack_name: string,
  body: Partial<Pick<mytype.Rack, "name" | "height" | "room_name" | "service_name">>,
): Promise<void> {
  const response = await fetch(`${baseUrl}/rack/${rack_name}`, {
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

export async function deleteRack(rack_name: string): Promise<void> {
  const response = await fetch(`${baseUrl}/rack/${rack_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete rack"));
  }
  return;
}

/* Host */
export async function addHost(
  body: Pick<mytype.Host, "name" | "height" | "rack_name" | "pos">,
): Promise<string> {
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
  return data.id as string; // TODO
}

export async function getAllHost(): Promise<mytype.Host[]> {
  const response = await fetch(`${baseUrl}/host/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch hosts"));
  }
  return response.json();
}

export async function getHost(host_name: string): Promise<mytype.Host> {
  const response = await fetch(`${baseUrl}/host/${host_name}`);
  if (!response.ok) {
    return Promise.reject(new Error("Host not found"));
  }
  return response.json();
}

export async function modifyHost(
  host_name: string,
  body: Partial<Pick<mytype.Host, "name" | "height" | "running" | "rack_name" | "pos">>,
): Promise<void> {
  const response = await fetch(`${baseUrl}/host/${host_name}`, {
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

export async function deleteHost(host_name: string): Promise<void> {
  const response = await fetch(`${baseUrl}/host/${host_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete host"));
  }
  return;
}

/* Service */
export async function addService(
  body: Pick<mytype.SimpleService, "name" | "n_allocated_racks" | "allocated_subnet">,
): Promise<string> {
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
  return data.id as string; // TODO
}

export async function getAllService(): Promise<mytype.SimpleService[]> {
  const response = await fetch(`${baseUrl}/service/all`);
  if (!response.ok) {
    return Promise.reject(new Error("Failed to fetch services"));
  }
  return response.json();
}

export async function getService(service_id: string): Promise<mytype.Service> {
  const response = await fetch(`${baseUrl}/service/${service_id}`);
  if (!response.ok) {
    return Promise.reject(new Error("Service not found"));
  }
  return response.json();
}

export async function modifyService(
  service_id: string,
  body: Pick<mytype.SimpleService, "name">,
): Promise<void> {
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
  const response = await fetch(`${baseUrl}/service/${service_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete service"));
  }
  return;
}
