import { motion } from "framer-motion";
import { RackDnDReducer, RackDroppable } from "./rack-dnd-reducer";
import { useEffect, useReducer, useRef } from "react";
import { Rack } from "@/lib/type";
import { cn } from "@/lib/utils";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import HostDraggable from "./host-draggable";

interface RackDnDProps {
  rack: Rack;
  setRack: (rack: Rack) => void;
}

export default function RackDnD({ rack, setRack }: RackDnDProps) {
  const initialRack: RackDroppable = {
    items: [],
    spaces: Array.from({ length: rack.height }, () => "space"),
    dragging: undefined,
  };
  const [state, dispatch] = useReducer(RackDnDReducer, initialRack);

  useEffect(() => {
    rack.hosts.forEach((host) => {
      dispatch({
        type: "ADD_HOST",
        payload: {
          host,
        },
      });
    });
  }, [rack]);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const draggingItem = state.items.find((i) => i.id === state.dragging?.id);

  return (
    <div
      ref={scrollRef}
      className="h-[70vh] w-fit overflow-y-scroll rounded-lg border-2 border-gray-950 p-4"
    >
      <motion.div ref={constraintsRef} className="relative h-fit w-[400px]">
        <div
          className="flex h-fit flex-col-reverse items-end"
          style={{ gap: `${RACK_GAP}px` }}
        >
          {state.spaces.map((_, index) => (
            <SpaceItem key={index} pos={index} />
          ))}
        </div>

        {state.dragging && draggingItem && (
          <>
            <motion.div
              className="absolute top-0 left-0 z-10 inline-flex w-full items-center justify-center rounded-lg bg-gray-300 opacity-70"
              style={{
                y:
                  (rack.height - (state.dragging.initialPos - 1) - draggingItem.height) *
                  (HOST_HEIGHT + RACK_GAP),
                height: draggingItem.height * (HOST_HEIGHT + RACK_GAP) - RACK_GAP,
              }}
            />
            <motion.div
              className={cn(
                "absolute top-0 left-0 z-10 inline-flex w-full items-center justify-center rounded-lg opacity-70",
                state.dragging.valid ? "bg-green-300" : "bg-red-300",
              )}
              style={{
                y:
                  (rack.height - (state.dragging.nextPos - 1) - draggingItem.height) *
                  (HOST_HEIGHT + RACK_GAP),
                height: draggingItem.height * (HOST_HEIGHT + RACK_GAP) - RACK_GAP,
              }}
            />
          </>
        )}

        {state.items.map((host, index) => {
          return (
            <HostDraggable
              key={index}
              host={host}
              rack={rack}
              setRack={setRack}
              constraintsRef={constraintsRef}
              scrollRef={scrollRef}
              draggingState={state.dragging}
              dispatch={dispatch}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

interface SpaceItemProps {
  pos: number;
}

const SpaceItem = ({ pos }: SpaceItemProps) => {
  return (
    <div
      className={cn("inline-flex w-full items-center justify-center rounded-lg bg-gray-100")}
      style={{ height: `${HOST_HEIGHT}px` }}
    >
      {pos + 1}
    </div>
  );
};
