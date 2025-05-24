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
    console.log("addDC mock data:", newDC);
    return newDC;
  }
  const response = await fetch(`${baseUrl}/dc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function getAllDC(): Promise<t.SimpleDatacenter[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("getAllDC mock data:", MockData.data_centers);
    return MockData.data_centers as t.SimpleDatacenter[];
  }
  const response = await fetch(`${baseUrl}/dc/all`);
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function getDC(dc_name: string): Promise<t.Datacenter> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dc = MockData.data_centers.find((dc) => dc.name === dc_name);
    if (!dc) {
      console.log("getDC mock data: Datacenter not found");
      return Promise.reject(new t.APIError("Datacenter not found"));
    }
    console.log("getDC mock data:", dc);
    return dc as t.Datacenter;
  }
  const response = await fetch(`${baseUrl}/dc/${dc_name}`);
  if (!response.ok) {
    const data = await response.json();
    return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function modifyDC(
  dc_name: string,
  body: Partial<Pick<t.Datacenter, "name" | "height">>,
): Promise<t.Datacenter> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const dc = MockData.data_centers.find((dc) => dc.name === dc_name);
    if (!dc) {
      console.log("modifyDC mock data: Datacenter not found");
      return Promise.reject(new t.APIError("Datacenter not found"));
    }
    Object.assign(dc, body);
    console.log("modifyDC mock data:", dc);
    return dc as t.Datacenter;
  }
  const response = await fetch(`${baseUrl}/dc/${dc_name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function deleteDC(dc_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.data_centers.findIndex((dc) => dc.name === dc_name);
    if (index === -1) {
      console.log("deleteDC mock data: Datacenter not found");
      return Promise.reject(new t.APIError("Datacenter not found"));
    }
    MockData.data_centers.splice(index, 1);
    console.log("deleteDC mock data: Datacenter deleted", dc_name);
    return Promise.resolve();
  }
  const response = await fetch(`${baseUrl}/dc/${dc_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return Promise.resolve();
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
    console.log("addRoom mock data:", newRoom);
    return newRoom;
  }
  const response = await fetch(`${baseUrl}/room/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function getRoom(room_name: string): Promise<t.Room> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const room = MockData.rooms.find((room) => room.name === room_name);
    if (!room) {
      console.log("getRoom mock data: Room not found");
      return Promise.reject(new t.APIError("Room not found"));
    }
    console.log("getRoom mock data:", room);
    return room as t.Room;
  }
  const response = await fetch(`${baseUrl}/room/${room_name}`);
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function modifyRoom(
  room_name: string,
  body: Partial<Pick<t.Room, "name" | "height" | "dc_name">>,
): Promise<t.Room> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const room = MockData.rooms.find((room) => room.name === room_name);
    if (!room) {
      console.log("modifyRoom mock data: Room not found");
      return Promise.reject(new t.APIError("Room not found"));
    }
    Object.assign(room, body);
    console.log("modifyRoom mock data:", room);
    return room as t.Room;
  }
  const response = await fetch(`${baseUrl}/room/${room_name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function deleteRoom(room_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.rooms.findIndex((room) => room.name === room_name);
    if (index === -1) {
      return Promise.reject(new t.APIError("Room not found"));
    }
    MockData.rooms.splice(index, 1);
    console.log("deleteRoom mock data: Room deleted", room_name);
    return Promise.resolve();
  }
  const response = await fetch(`${baseUrl}/room/${room_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return Promise.resolve();
}

/* Rack */
export async function addRack(
  body: Pick<t.Rack, "name" | "height" | "room_name">,
): Promise<t.Rack> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const room = MockData.rooms.find((room) => room.name === body.room_name);
    if (!room) {
      console.log("addRack mock data: Room not found");
      return Promise.reject(new t.APIError("Room not found"));
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
    console.log("addRack mock data:", newRack);
    return newRack;
  }
  const response = await fetch(`${baseUrl}/rack/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function getRack(rack_name: string): Promise<t.Rack> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rack = MockData.racks.find((rack) => rack.name === rack_name);
    if (!rack) {
      console.log("getRack mock data: Rack not found");
      return Promise.reject(new t.APIError("Rack not found"));
    }
    console.log("getRack mock data:", rack);
    return rack as t.Rack;
  }
  const response = await fetch(`${baseUrl}/rack/${rack_name}`);
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function modifyRack(
  rack_name: string,
  body: Partial<Pick<t.Rack, "name" | "height" | "room_name" | "service_name">>,
): Promise<t.Rack> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rack = MockData.racks.find((rack) => rack.name === rack_name);
    if (!rack) {
      return Promise.reject(new t.APIError("Rack not found"));
    }
    Object.assign(rack, body);
    console.log("modifyRack mock data:", rack);
    return rack as t.Rack;
  }
  const response = await fetch(`${baseUrl}/rack/${rack_name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function deleteRack(rack_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.racks.findIndex((rack) => rack.name === rack_name);
    if (index === -1) {
      console.log("deleteRack mock data: Rack not found");
      return Promise.reject(new t.APIError("Rack not found"));
    }
    MockData.racks.splice(index, 1);
    console.log("deleteRack mock data: Rack deleted", rack_name);
    return Promise.resolve();
  }
  const response = await fetch(`${baseUrl}/rack/${rack_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return Promise.resolve();
}

/* Host */
export async function addHost(
  body: Pick<t.Host, "name" | "height" | "rack_name" | "pos">,
): Promise<t.Host> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rack = MockData.racks.find((rack) => rack.name === body.rack_name);
    if (!rack) {
      console.log("addHost mock data: Rack not found");
      return Promise.reject(new t.APIError("Rack not found"));
    }
    const room = MockData.rooms.find((room) => room.name === rack.room_name);
    if (!room) {
      console.log("addHost mock data: Room not found");
      return Promise.reject(new t.APIError("Room not found"));
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
    console.log("addHost mock data:", newHost);
    return newHost;
  }
  const response = await fetch(`${baseUrl}/host/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function getAllHost(): Promise<t.Host[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("getAllHost mock data:", MockData.hosts);
    return MockData.hosts as t.Host[];
  }
  const response = await fetch(`${baseUrl}/host/all`);
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function getHost(host_name: string): Promise<t.Host> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const host = MockData.hosts.find((host) => host.name === host_name);
    if (!host) {
      console.log("getHost mock data: Host not found");
      return Promise.reject(new t.APIError("Host not found"));
    }
    console.log("getHost mock data:", host);
    return host as t.Host;
  }
  const response = await fetch(`${baseUrl}/host/${host_name}`);
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function modifyHost(
  host_name: string,
  body: Partial<Pick<t.Host, "name" | "height" | "running" | "rack_name" | "pos">>,
): Promise<t.Host> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const host = MockData.hosts.find((host) => host.name === host_name);
    if (!host) {
      console.log("modifyHost mock data: Host not found");
      return Promise.reject(new t.APIError("Host not found"));
    }
    Object.assign(host, body);
    console.log("modifyHost mock data:", host);
    return host as t.Host;
  }
  const response = await fetch(`${baseUrl}/host/${host_name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
  }
  return response.json();
}

export async function deleteHost(host_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.hosts.findIndex((host) => host.name === host_name);
    if (index === -1) {
      return Promise.reject(new t.APIError("Host not found"));
    }
    MockData.hosts.splice(index, 1);
    console.log("deleteHost mock data: Host deleted", host_name);
    return Promise.resolve();
  }
  const response = await fetch(`${baseUrl}/host/${host_name}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
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
    console.log("addService mock data:", newService);
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
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return response.json();
  }
}

export async function getAllService(): Promise<t.SimpleService[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("getAllService mock data:", MockData.services);
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
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return response.json();
  }
}

export async function getUserService(username: string): Promise<t.SimpleService[]> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(
      "getUserService mock data:",
      MockData.services.filter((service) => service.username === username),
    );
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
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return response.json();
  }
}

export async function getService(service_name: string): Promise<t.Service> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const service = MockData.services.find((service) => service.name === service_name);
    if (!service) {
      console.log("getService mock data: Service not found");
      return Promise.reject(new t.APIError("Service not found"));
    }
    console.log("getService mock data:", service);
    return service as t.Service;
  } else {
    const response = await fetch(`${baseUrl}/service/${service_name}`);
    if (!response.ok) {
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
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
      console.log("modifyService mock data: Service not found");
      return Promise.reject(new t.APIError("Service not found"));
    }
    console.log("modifyService mock data:", service);
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
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return response.json();
  }
}

export async function deleteService(service_name: string): Promise<void> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = MockData.services.findIndex((service) => service.name === service_name);
    if (index === -1) {
      return Promise.reject(new t.APIError("Service not found"));
    }
    MockData.services.splice(index, 1);
    return Promise.resolve();
  } else {
    const response = await fetch(`${baseUrl}/service/${service_name}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return Promise.resolve();
  }
}

/* User */
export async function addUser(body: t.UserPassword): Promise<t.User> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser = {
      ...body,
    } as t.UserPassword;
    MockData.users.push(newUser);

    console.log("addUser mock data:", newUser);
    return newUser;
  } else {
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return response.json();
  }
}

export async function userLogin(
  body: Pick<t.UserPassword, "username" | "password">,
): Promise<t.User> {
  if (mode === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = MockData.users.find((user) => user.username === body.username);
    if (!user) {
      console.log("getUserRole mock data: User not found");
      return Promise.reject(new t.APIError("User not found"));
    }
    if (user.password !== body.password) {
      return Promise.reject(new t.APIError("Invalid username or password"));
    }
    return user as t.User;
  } else {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json();
      return Promise.reject(new t.APIError(data.error, response.status));
    }
    return response.json();
  }
}
