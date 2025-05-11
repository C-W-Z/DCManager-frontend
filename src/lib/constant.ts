export const HOST_HEIGHT = 30; // px
export const RACK_GAP = 10; // px

export const pos2Ytranslate = (pos: number, hostHeight: number, rackHeight: number) => {
  return (rackHeight - (pos - 1) - hostHeight) * (HOST_HEIGHT + RACK_GAP);
};
export const height2Px = (height: number) => {
  return height * (HOST_HEIGHT + RACK_GAP) - RACK_GAP;
};

export const MAX_HEIGHT = 80; // U
