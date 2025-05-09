import { SimpleHost } from "@/lib/type";

export type RackDroppable = {
  items: SimpleHost[];
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
    const next = [...spaces];
    for (let i = 0; i < host.height; i++) {
      next[host.pos - 1 + i] = "space";
    }
    return next;
  }

  function setHostToSpaces(host: SimpleHost, spaces: string[]) {
    const next = [...spaces];
    for (let i = 0; i < host.height; i++) {
      next[host.pos - 1 + i] = host.id;
    }
    return next;
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

      // only add the host if it is not in the list
      const index = nextState.items.findIndex((i) => i.id === host.id);
      if (index == -1) {
        nextState.items.push(host);
      }
      nextState.spaces = setHostToSpaces(host, nextState.spaces);

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
        const { valid, initialPos, nextPos } = nextState.dragging;
        const pos = valid ? nextPos : initialPos;

        nextState.spaces = clearHostFromSpaces(host, nextState.spaces);

        host.pos = pos;

        nextState.spaces = setHostToSpaces(host, nextState.spaces);

        const index = nextState.items.findIndex((i) => i.id === host.id);
        nextState.items[index] = host;

        nextState.dragging = undefined;

        return nextState;
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
