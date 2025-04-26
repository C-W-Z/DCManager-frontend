import { generateMockHost } from "./mock";

export function getHostByRack(rack_id: string) {
  console.log("getHostByRack", rack_id);
  return generateMockHost();
}

export function getRackByRoom(room_id: string) {
  console.log("getRackByRoom", room_id);
  return generateMockHost();
}
