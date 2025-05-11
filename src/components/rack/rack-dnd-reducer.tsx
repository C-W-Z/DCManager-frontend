import { Rack, SimpleHost } from "@/lib/type";

export type RackDroppable = {
  rack: Rack;
  spaces: string[];
  dragging?: {
    id: string;
    initialPos: number;
    nextPos: number;
    valid: boolean;
  };
};

export type Action =
  | { type: "ADD_HOST"; payload: { host: SimpleHost } }
  | { type: "DRAG_STARTED"; payload: { host: SimpleHost } }
  | { type: "DRAG_MOVED"; payload: { host: SimpleHost; pos: number } }
  | { type: "DRAG_ENDED"; payload: { host: SimpleHost } }
  | { type: "ANIMATION_ENDED" };

export function RackDnDReducer(state: RackDroppable, action: Action) {
  function clearHostFromSpaces(host: SimpleHost, spaces: string[]) {
    const newSpace = [...spaces];
    for (let i = 0; i < host.height; i++) {
      newSpace[host.pos - 1 + i] = "space";
    }
    return newSpace;
  }

  function setHostToSpaces(host: SimpleHost, spaces: string[]) {
    const newSpace = [...spaces];
    for (let i = 0; i < host.height; i++) {
      newSpace[host.pos - 1 + i] = host.id;
    }
    return newSpace;
  }

  function isHostFit(host: SimpleHost, pos: number, spaces: string[]) {
    for (let i = 0; i < host.height; i++) {
      if (spaces[pos - 1 + i] !== "space" && spaces[pos - 1 + i] !== host.id) {
        return false;
      }
    }
    return true;
  }

  switch (action.type) {
    case "ADD_HOST": {
      const nextState = { ...state };
      const { host } = action.payload;

      nextState.rack.hosts.push(host);
      nextState.rack.n_hosts += 1;
      nextState.spaces = setHostToSpaces(host, nextState.spaces);

      console.log("add host state", nextState);

      return nextState;
    }
    case "DRAG_STARTED": {
      const nextState = { ...state };
      const { host } = action.payload;

      nextState.dragging = {
        id: host.id,
        initialPos: host.pos,
        nextPos: host.pos,
        valid: true,
      };

      return nextState;
    }
    case "DRAG_MOVED": {
      const nextState = { ...state };
      const { host, pos } = action.payload;

      if (nextState.dragging) {
        nextState.dragging.nextPos = pos;
        nextState.dragging.valid = isHostFit(host, pos, nextState.spaces);
      }

      return nextState;
    }
    case "DRAG_ENDED": {
      const nextState = { ...state };
      const { host } = action.payload;

      if (nextState.dragging) {
        nextState.spaces = clearHostFromSpaces(host, nextState.spaces);

        let newPos = nextState.dragging.initialPos;

        if (nextState.dragging.valid) {
          newPos = nextState.dragging.nextPos;

          const hostIndex = nextState.rack.hosts.findIndex((h) => h.id === host.id);
          nextState.rack.hosts[hostIndex].pos = newPos;
          // nextState.rack.hosts.sort((a, b) => a.pos - b.pos);
        }

        host.pos = newPos;
        nextState.spaces = setHostToSpaces(host, nextState.spaces);
      }

      return nextState;
    }
    case "ANIMATION_ENDED": {
      const nextState = { ...state };

      nextState.dragging = undefined;

      return nextState;
    }
    default: {
      return state;
    }
  }
}
