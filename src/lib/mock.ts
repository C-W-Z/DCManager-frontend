import { faker } from "@faker-js/faker";
import { hostSchema, rackSchema } from "./schema";

export const generateMockHost = () => {
  return hostSchema.parse({
    id: faker.string.uuid(),
    name: faker.commerce.productName() + " Host",
    height: faker.number.int({ min: 1, max: 4 }),
    ip: faker.internet.ipv4(),
    service_id: faker.string.uuid(),
    dc_id: faker.string.uuid(),
    room_id: faker.string.uuid(),
    rack_id: faker.string.uuid(),
  });
};

export const generateMockRack = () => {
  const n_hosts = faker.number.int({ min: 3, max: 5 });
  const hosts = Array.from({ length: n_hosts }, (_, i) => ({
    ...generateMockHost(),
    pos: faker.number.int({
      min: i * 4 + 1,
      max: (i + 1) * 4,
    }),
  }));

  return rackSchema.parse({
    id: faker.string.uuid(),
    name: faker.commerce.productName() + " Rack",
    height: 20,
    n_hosts: n_hosts,
    hosts: hosts,
    dc_id: faker.string.uuid(),
    room_id: faker.string.uuid(),
  });
};
