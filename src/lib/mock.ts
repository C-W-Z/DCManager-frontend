import { faker } from "@faker-js/faker";
import { host_schema, rack_schema } from "./schema";

export const generateMockHost = (dc_id: string, room_id: string, rack_id: string) => {
  return host_schema.parse({
    name: "Host-" + faker.string.alphanumeric(10),
    height: faker.number.int({ min: 1, max: 4 }),
    is_running: faker.datatype.boolean(),
    dc_id: dc_id,
    room_id: room_id,
    rack_id: rack_id,
    id: faker.string.uuid(),
  });
};

export const generateMockRack = () => {
  const dc_id = faker.string.uuid();
  const room_id = faker.string.uuid();
  const rack_id = faker.string.uuid();

  const n_hosts = faker.number.int({ min: 3, max: 10 });
  const hosts = Array.from({ length: n_hosts }, (_, i) => ({
    ...generateMockHost(dc_id, room_id, rack_id),
    pos: i * 4 + 1,
  }));

  return rack_schema.parse({
    name: "Rack-" + faker.string.alphanumeric(10),
    height: 42,
    n_hosts: n_hosts,
    dc_id: dc_id,
    room_id: room_id,
    hosts: hosts,
    id: rack_id,
  });
};
