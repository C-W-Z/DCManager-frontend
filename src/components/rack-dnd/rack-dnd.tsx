import { motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import HostDraggable from "./host-draggable";
import { RackContextType } from "@/components/rack-dnd/rack-dnd-reducer";
import { useContextSafe } from "@/lib/utils";
import { HostComponent } from "./host-component";

export function RackDnD({
  context,
  hostId,
  onMoveUpdate,
}: {
  context: RackContextType;
  hostId?: string;
  onMoveUpdate?: (newPos: number) => void;
}) {
  const { state } = useContextSafe(context);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="h-[70vh] w-fit overflow-y-scroll rounded-lg border-2 border-gray-950 p-4"
    >
      <motion.div ref={constraintsRef} className="relative h-fit w-[400px]">
        <div
          className="flex h-fit flex-col-reverse items-end select-none"
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

        {state.rack.hosts.map((host, index) => {
          if (hostId && host.name === hostId) {
            return (
              <HostDraggable
                key={index}
                host={host}
                constraintsRef={constraintsRef}
                scrollRef={scrollRef}
                context={context}
                onUpdate={onMoveUpdate}
              />
            );
          } else {
            return <HostComponent key={index} host={host} rackHeight={state.rack.height} />;
          }
        })}
      </motion.div>
    </div>
  );
}
