import { createContext, useContext } from "react";
import { RackDroppable, Action } from "./rack-dnd-reducer";

export const RackContext = createContext<{
  state: RackDroppable;
  dispatch: React.ActionDispatch<[action: Action]>;
} | null>(null);

export function useRackContext() {
  const context = useContext(RackContext);
  if (!context) {
    throw new Error("RackContext is null");
  }
  return context;
}
