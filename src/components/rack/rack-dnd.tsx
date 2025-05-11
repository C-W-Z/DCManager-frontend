import { motion } from "framer-motion";
import { RackDnDReducer, RackDroppable } from "./rack-dnd-reducer";
import { useReducer, useRef } from "react";
import { Rack } from "@/lib/type";
import { cn } from "@/lib/utils";
import { HOST_HEIGHT, RACK_GAP, pos2Ytranslate, height2Px } from "@/lib/constant";
import HostDraggable from "./host-draggable";

function createInitialState(rack: Rack): RackDroppable {
  const spaces = Array.from({ length: rack.height }, () => "space");

  rack.hosts.forEach((host) => {
    for (let i = 0; i < host.height; i++) {
      spaces[host.pos - 1 + i] = host.id;
    }
  });

  console.log("initial state", {
    rack,
    spaces,
  });

  return {
    rack,
    spaces,
    dragging: undefined,
    addHostSuccess: false,
  } as RackDroppable;
}

interface RackDnDProps {
  rack: Rack;
  setRack: (rack: Rack) => void;
}

export default function RackDnD({ rack }: RackDnDProps) {
  const [state, dispatch] = useReducer(RackDnDReducer, rack, createInitialState);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const draggingItem = state.rack.hosts.find((i) => i.id === state.dragging?.id);

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
            <div
              key={index}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-lg bg-gray-100",
              )}
              style={{ height: `${HOST_HEIGHT}px` }}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {state.dragging && draggingItem && (
          <>
            <motion.div
              className="absolute top-0 left-0 z-10 inline-flex w-full items-center justify-center rounded-lg bg-gray-300 opacity-70"
              style={{
                y: pos2Ytranslate(state.dragging.initialPos, draggingItem.height, rack.height),
                height: height2Px(draggingItem.height),
              }}
            />
            <motion.div
              className={cn(
                "absolute top-0 left-0 z-10 inline-flex w-full items-center justify-center rounded-lg opacity-70",
                state.dragging.valid ? "bg-green-300" : "bg-red-300",
              )}
              style={{
                y: pos2Ytranslate(state.dragging.nextPos, draggingItem.height, rack.height),
                height: height2Px(draggingItem.height),
              }}
            />
          </>
        )}

        {state.rack.hosts.map((host, index) => {
          return (
            <HostDraggable
              key={index}
              host={host}
              constraintsRef={constraintsRef}
              scrollRef={scrollRef}
              state={state}
              dispatch={dispatch}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
