import { faker } from "@faker-js/faker";
import * as schema from "./schema";

export const generateMockHost = () => {
  return schema.host_schema.parse({
    id: faker.string.uuid(),
    name: "Host-" + faker.string.alphanumeric(10),
    height: faker.number.int({ min: 1, max: 4 }),
    status: faker.helpers.arrayElement(["running", "stopped", "idle"]),
    ip: faker.internet.ipv4(),
    service_id: faker.string.uuid(),
    rack_id: faker.string.uuid(),
    room_id: faker.string.uuid(),
    dc_id: faker.string.uuid(),
    pos: faker.number.int({ min: 1, max: 42 }),
  });
};

export const generateMockRack = () => {
  const n_hosts = faker.number.int({ min: 3, max: 10 });
  const hosts = Array.from({ length: n_hosts }, (_, i) =>
    schema.simple_host_schema.parse({
      id: faker.string.uuid(),
      name: "Host-" + faker.string.alphanumeric(10),
      height: faker.number.int({ min: 1, max: 4 }),
      status: faker.helpers.arrayElement(["running", "stopped", "idle"]),
      pos: i * 4 + 1,
    }),
  );

  return schema.rack_schema.parse({
    id: faker.string.uuid(),
    name: "Rack-" + faker.string.alphanumeric(10),
    height: 42,
    n_hosts: n_hosts,
    hosts: hosts,
    service_id: faker.string.uuid(),
    dc_id: faker.string.uuid(),
    room_id: faker.string.uuid(),
  });
};

export const generateMockRoom = () => {
  const n_racks = faker.number.int({ min: 3, max: 10 });
  const racks = Array.from({ length: n_racks }, () =>
    schema.simple_rack_schema.parse({
      id: faker.string.uuid(),
      name: "Rack-" + faker.string.alphanumeric(10),
      height: 42,
      n_hosts: faker.number.int({ min: 3, max: 10 }),
      service_id: faker.string.uuid(),
    }),
  );
  const n_hosts = racks.reduce((acc, rack) => acc + rack.n_hosts, 0);

  return schema.room_schema.parse({
    id: faker.string.uuid(),
    name: "Room-" + faker.string.alphanumeric(10),
    height: 42,
    n_hosts: n_hosts,
    n_racks: n_racks,
    racks: racks,
    dc_id: faker.string.uuid(),
  });
};

export const generateMockDC = () => {
  const n_rooms = faker.number.int({ min: 3, max: 10 });
  const rooms = Array.from({ length: n_rooms }, () =>
    schema.simple_room_schema.parse({
      id: faker.string.uuid(),
      name: "Room-" + faker.string.alphanumeric(10),
      height: 42,
      n_hosts: faker.number.int({ min: 15, max: 50 }),
      n_racks: faker.number.int({ min: 3, max: 10 }),
    }),
  );
  const n_hosts = rooms.reduce((acc, room) => acc + room.n_hosts, 0);
  const n_racks = rooms.reduce((acc, room) => acc + room.n_racks, 0);

  return schema.datacenter_schema.parse({
    id: faker.string.uuid(),
    name: "DC-" + faker.string.alphanumeric(10),
    height: 42,
    ip_ranges: [faker.internet.ipv4(), faker.internet.ipv4()],
    n_hosts: n_hosts,
    n_racks: n_racks,
    n_rooms: n_rooms,
    rooms: rooms,
  });
};

export const generateMockSimpleDC = () => {
  return schema.simple_datacenter_schema.parse({
    id: faker.string.uuid(),
    name: "DC-" + faker.string.alphanumeric(10),
    height: 42,
    n_hosts: faker.number.int({ min: 75, max: 250 }),
    n_racks: faker.number.int({ min: 15, max: 50 }),
    n_rooms: faker.number.int({ min: 3, max: 10 }),
  });
};

export const generateMockService = () => {
  const service_id = faker.string.uuid();
  const n_racks = faker.number.int({ min: 3, max: 10 });
  const racks = Array.from({ length: n_racks }, () =>
    schema.simple_rack_schema.parse({
      id: faker.string.uuid(),
      name: "Rack-" + faker.string.alphanumeric(10),
      height: 42,
      n_hosts: faker.number.int({ min: 3, max: 10 }),
      service_id: service_id,
    }),
  );
  const n_hosts = racks.reduce((acc, rack) => acc + rack.n_hosts, 0);

  const total_ip = faker.number.int({ min: 30, max: 50 });
  const ip_list = Array.from({ length: total_ip }, () => faker.internet.ipv4());

  return schema.service_schema.parse({
    id: faker.string.uuid(),
    name: "Service-" + faker.string.alphanumeric(10),
    n_hosts: n_hosts,
    n_racks: n_racks,
    racks: racks,
    total_ip: total_ip,
    ip_list: ip_list,
  });
};

export const generateMockSimpleService = () => {
  return schema.simple_service_schema.parse({
    id: faker.string.uuid(),
    name: "Service-" + faker.string.alphanumeric(10),
    n_hosts: faker.number.int({ min: 15, max: 50 }),
    n_racks: faker.number.int({ min: 3, max: 10 }),
    total_ip: faker.number.int({ min: 30, max: 50 }),
  });
};
