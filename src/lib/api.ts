import * as t from "./type";
import d from "./mock_data.json";

const baseUrl = import.meta.env.VITE_API_URL;
console.log("baseUrl", baseUrl);
const mode = import.meta.env.VITE_API_MODE;
console.log("mode", mode);

const MockData = d as t.MockDataJson;

/* Datacenter */
export async function addDC(
  body: Pick<t.Datacenter, "name" | "height">,
): Promise<t.Datacenter> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDC = {
      ...body,
      n_rooms: 0,
      n_racks: 0,
      n_hosts: 0,
      rooms: [],
    } as t.Datacenter;
    MockData.data_centers.push(newDC);
    return newDC;
  } else {
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
}

export async function getAllDC(): Promise<t.SimpleDatacenter[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return MockData.data_centers as t.SimpleDatacenter[];
  } else {
    const response = await fetch(`${baseUrl}/dc/all`);
    if (!response.ok) {
      return Promise.reject(new Error("Failed to fetch datacenters"));
    }
    return response.json();
  }
}

export async function getDC(dc_name: string): Promise<t.Datacenter> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dc = MockData.data_centers.find((dc) => dc.name === dc_name);
    if (!dc) {
      return Promise.reject(new Error("Datacenter not found"));
    }
    return dc as t.Datacenter;
  } else {
    const response = await fetch(`${baseUrl}/dc/${dc_name}`);
    if (!response.ok) {
      return Promise.reject(new Error("Datacenter not found"));
    }
    return response.json();
  }
}

export async function modifyDC(
  dc_name: string,
  body: Partial<Pick<t.Datacenter, "name" | "height">>,
): Promise<t.Datacenter> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dc = MockData.data_centers.find((dc) => dc.name === dc_name);
    if (!dc) {
      return Promise.reject(new Error("Datacenter not found"));
    }
    Object.assign(dc, body);
    return dc as t.Datacenter;
  } else {
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
    return response.json();
  }
}

export async function deleteDC(dc_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.data_centers.findIndex((dc) => dc.name === dc_name);
    if (index === -1) {
      return Promise.reject(new Error("Datacenter not found"));
    }
    MockData.data_centers.splice(index, 1);
    return Promise.resolve();
  } else {
    const response = await fetch(`${baseUrl}/dc/${dc_name}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return Promise.reject(new Error("Failed to delete datacenter"));
    }
    return Promise.resolve();
  }
}

/* Room */
export async function addRoom(
  body: Pick<t.Room, "name" | "height" | "dc_name">,
): Promise<t.Room> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newRoom = {
      ...body,
      n_racks: 0,
      n_hosts: 0,
      racks: [],
    } as t.Room;
    MockData.rooms.push(newRoom);
    return newRoom;
  } else {
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
}

export async function getRoom(room_name: string): Promise<t.Room> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const room = MockData.rooms.find((room) => room.name === room_name);
    if (!room) {
      return Promise.reject(new Error("Room not found"));
    }
    return room as t.Room;
  } else {
    const response = await fetch(`${baseUrl}/room/${room_name}`);
    if (!response.ok) {
      return Promise.reject(new Error("Room not found"));
    }
    return response.json();
  }
}

export async function modifyRoom(
  room_name: string,
  body: Partial<Pick<t.Room, "name" | "height" | "dc_name">>,
): Promise<t.Room> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const room = MockData.rooms.find((room) => room.name === room_name);
    if (!room) {
      return Promise.reject(new Error("Room not found"));
    }
    Object.assign(room, body);
    return room as t.Room;
  } else {
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
    return response.json();
  }
}

export async function deleteRoom(room_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.rooms.findIndex((room) => room.name === room_name);
    if (index === -1) {
      return Promise.reject(new Error("Room not found"));
    }
    MockData.rooms.splice(index, 1);
    return Promise.resolve();
  } else {
    const response = await fetch(`${baseUrl}/room/${room_name}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return Promise.reject(new Error("Failed to delete room"));
    }
    return Promise.resolve();
  }
}

/* Rack */
export async function addRack(
  body: Pick<t.Rack, "name" | "height" | "room_name">,
): Promise<t.Rack> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const room = MockData.rooms.find((room) => room.name === body.room_name);
    if (!room) {
      return Promise.reject(new Error("Room not found"));
    }
    const newRack = {
      ...body,
      capacity: body.height,
      n_hosts: 0,
      hosts: [],
      service_name: "",
      dc_name: room.dc_name,
    } as t.Rack;
    MockData.racks.push(newRack);
    return newRack;
  } else {
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
}

export async function getRack(rack_name: string): Promise<t.Rack> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rack = MockData.racks.find((rack) => rack.name === rack_name);
    if (!rack) {
      return Promise.reject(new Error("Rack not found"));
    }
    return rack as t.Rack;
  } else {
    const response = await fetch(`${baseUrl}/rack/${rack_name}`);
    if (!response.ok) {
      return Promise.reject(new Error("Rack not found"));
    }
    return response.json();
  }
}

export async function modifyRack(
  rack_name: string,
  body: Partial<Pick<t.Rack, "name" | "height" | "room_name" | "service_name">>,
): Promise<t.Rack> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rack = MockData.racks.find((rack) => rack.name === rack_name);
    if (!rack) {
      return Promise.reject(new Error("Rack not found"));
    }
    Object.assign(rack, body);
    return rack as t.Rack;
  } else {
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
    return response.json();
  }
}

export async function deleteRack(rack_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.racks.findIndex((rack) => rack.name === rack_name);
    if (index === -1) {
      return Promise.reject(new Error("Rack not found"));
    }
    MockData.racks.splice(index, 1);
    return Promise.resolve();
  } else {
    const response = await fetch(`${baseUrl}/rack/${rack_name}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return Promise.reject(new Error("Failed to delete rack"));
    }
    return Promise.resolve();
  }
}

/* Host */
export async function addHost(
  body: Pick<t.Host, "name" | "height" | "rack_name" | "pos">,
): Promise<t.Host> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rack = MockData.racks.find((rack) => rack.name === body.rack_name);
    if (!rack) {
      return Promise.reject(new Error("Rack not found"));
    }
    const room = MockData.rooms.find((room) => room.name === rack.room_name);
    if (!room) {
      return Promise.reject(new Error("Room not found"));
    }

    const newHost = {
      ...body,
      ip: "11.4.5.14",
      running: false,
      service_name: rack.service_name,
      dc_name: room.dc_name,
      room_name: rack.room_name,
    } as t.Host;
    MockData.hosts.push(newHost);
    return newHost;
  } else {
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
    return response.json();
  }
}

export async function getAllHost(): Promise<t.Host[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return MockData.hosts as t.Host[];
  } else {
    const response = await fetch(`${baseUrl}/host/all`);
    if (!response.ok) {
      return Promise.reject(new Error("Failed to fetch hosts"));
    }
    return response.json();
  }
}

export async function getHost(host_name: string): Promise<t.Host> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const host = MockData.hosts.find((host) => host.name === host_name);
    if (!host) {
      return Promise.reject(new Error("Host not found"));
    }
    return host as t.Host;
  } else {
    const response = await fetch(`${baseUrl}/host/${host_name}`);
    if (!response.ok) {
      return Promise.reject(new Error("Host not found"));
    }
    return response.json();
  }
}

export async function modifyHost(
  host_name: string,
  body: Partial<Pick<t.Host, "name" | "height" | "running" | "rack_name" | "pos">>,
): Promise<t.Host> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const host = MockData.hosts.find((host) => host.name === host_name);
    if (!host) {
      return Promise.reject(new Error("Host not found"));
    }
    Object.assign(host, body);
    return host as t.Host;
  } else {
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
    return response.json();
  }
}

export async function deleteHost(host_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.hosts.findIndex((host) => host.name === host_name);
    if (index === -1) {
      return Promise.reject(new Error("Host not found"));
    }
    MockData.hosts.splice(index, 1);
    return Promise.resolve();
  }
  const response = await fetch(`${baseUrl}/host/${host_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    return Promise.reject(new Error("Failed to delete host"));
  }
  return Promise.resolve();
}

/* Service */
export async function addService(
  body: Pick<t.SimpleService, "name" | "n_allocated_racks" | "allocated_subnets" | "username">,
): Promise<t.Service> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 這裡沒有做任何分配
    const newService = {
      name: body.name,
      allocated_racks: {
        mockDC1: [],
        mockDC2: [],
      },
      hosts: [],
      allocated_subnets: body.allocated_subnets,
      username: body.username,
      total_ip_list: [],
      available_ip_list: [],
    } as t.Service;
    MockData.services.push(newService);
    return newService;
  } else {
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
}

export async function getAllService(): Promise<t.SimpleService[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return MockData.services.map(
      (service) =>
        ({
          name: service.name,
          n_allocated_racks: Object.keys(service.allocated_racks).reduce(
            (acc, dc) => {
              acc[dc] = service.allocated_racks[dc].length;
              return acc;
            },
            {} as Record<string, number>,
          ),
          n_hosts: service.hosts.length,
          username: service.username,
          allocated_subnets: service.allocated_subnets,
          total_ip_list: service.total_ip_list,
          available_ip_list: service.available_ip_list,
        }) as t.SimpleService,
    );
  } else {
    const response = await fetch(`${baseUrl}/service/all`);
    if (!response.ok) {
      return Promise.reject(new Error("Failed to fetch services"));
    }
    return response.json();
  }
}

export async function getUserService(username: string): Promise<t.SimpleService[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return MockData.services
      .filter((service) => service.username === username)
      .map(
        (service) =>
          ({
            name: service.name,
            n_allocated_racks: Object.keys(service.allocated_racks).reduce(
              (acc, dc) => {
                acc[dc] = service.allocated_racks[dc].length;
                return acc;
              },
              {} as Record<string, number>,
            ),
            n_hosts: service.hosts.length,
            username: service.username,
            allocated_subnets: service.allocated_subnets,
            total_ip_list: service.total_ip_list,
            available_ip_list: service.available_ip_list,
          }) as t.SimpleService,
      );
  } else {
    const response = await fetch(`${baseUrl}/service/user/${username}`);
    if (!response.ok) {
      return Promise.reject(new Error("Failed to fetch user services"));
    }
    return response.json();
  }
}

export async function getService(service_name: string): Promise<t.Service> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const service = MockData.services.find((service) => service.name === service_name);
    if (!service) {
      return Promise.reject(new Error("Service not found"));
    }
    return service as t.Service;
  } else {
    const response = await fetch(`${baseUrl}/service/${service_name}`);
    if (!response.ok) {
      return Promise.reject(new Error("Service not found"));
    }
    return response.json();
  }
}

// important: <n_allocated_racks> <allocated_subnets> 在這裡表示增加的量，而非最終修改值
export async function modifyService(
  service_name: string,
  body: Partial<Pick<t.SimpleService, "name" | "n_allocated_racks" | "allocated_subnets">>,
): Promise<t.Service> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 這裡沒有做任何修改
    const service = MockData.services.find((service) => service.name === service_name);
    if (!service) {
      return Promise.reject(new Error("Service not found"));
    }
    return service as t.Service;
  } else {
    const response = await fetch(`${baseUrl}/service/${service_name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return Promise.reject(new Error("Failed to edit service"));
    }
    return response.json();
  }
}

export async function deleteService(service_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.services.findIndex((service) => service.name === service_name);
    if (index === -1) {
      return Promise.reject(new Error("Service not found"));
    }
    MockData.services.splice(index, 1);
    return Promise.resolve();
  } else {
    const response = await fetch(`${baseUrl}/service/${service_name}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return Promise.reject(new Error("Failed to delete service"));
    }
    return Promise.resolve();
  }
}

/* User */
export async function addUser(body: Pick<t.User, "username" | "role">): Promise<t.User> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser = {
      ...body,
    } as t.User;
    MockData.users.push(newUser);

    return newUser;
  } else {
    // TODO: 這裡的 Endpoint 還沒決定
    const response = await fetch(`${baseUrl}/user/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return Promise.reject(new Error("Failed to add user"));
    }
    return response.json();
  }
}

export async function getUserRole(username: string): Promise<t.User> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = MockData.users.find((user) => user.username === username);
    if (!user) {
      return Promise.reject(new Error("User not found"));
    }
    return user as t.User;
  } else {
    // TODO: 這裡的 Endpoint 還沒決定
    const response = await fetch(`${baseUrl}/user/${username}`);
    if (!response.ok) {
      return Promise.reject(new Error("User not found"));
    }
    return response.json();
  }
}
