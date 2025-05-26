import { Rack } from "./type";

export const MAX_HEIGHT = 100; // U
export const HOST_HEIGHT = 30; // px
export const RACK_GAP = 10; // px

export const CRITICAL_AVAILABLE_IP_PERCENT = 0.1;
export const CRITICAL_AVAILABLE_RACK_POS_PERCENT = 0.2;

export const pos2translateY = (pos: number, hostHeight: number, rackHeight: number) => {
  return (rackHeight - (pos - 1) - hostHeight) * (HOST_HEIGHT + RACK_GAP);
};
export const height2Px = (height: number) => {
  return height * (HOST_HEIGHT + RACK_GAP) - RACK_GAP;
};

export function getPossiblePositions(hostHeight: number, rack: Rack): number[] {
  if (hostHeight <= 0) {
    return [];
  }

  if (rack.hosts.length === 0) {
    return Array.from({ length: rack.height - hostHeight + 1 }, (_, i) => i + 1);
  }

  const possiblePositions: number[] = [];
  const sortedHosts = [...rack.hosts].sort((a, b) => a.pos - b.pos);
  let currentTop = rack.height;

  for (let i = sortedHosts.length - 1; i >= 0; i--) {
    const host = sortedHosts[i];
    const host_top = host.pos + host.height - 1;
    const space = currentTop - host_top;

    if (space >= hostHeight) {
      for (let pos = currentTop - hostHeight + 1; pos > host_top; pos--) {
        possiblePositions.push(pos);
      }
    }

    currentTop = host.pos - 1;
  }

  return possiblePositions.sort((a, b) => a - b);
}
