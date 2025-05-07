import { SimpleHost } from "@/lib/type";
import { motion, useAnimation } from "framer-motion";
import { Action } from "./rack-dnd-reducer";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { cn } from "@/lib/utils";

interface HostDraggableProps {
  host: SimpleHost;
  rackHeight: number;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  draggingState:
    | {
        id: string;
        initialPos: number;
        nextPos: number;
        valid: boolean;
      }
    | undefined;
  dispatch: React.ActionDispatch<[action: Action]>;
}

export default function HostDraggable({
  host,
  rackHeight,
  constraintsRef,
  draggingState,
  dispatch,
}: HostDraggableProps) {
  const isDragging = draggingState?.id === host.id;

  const controls = useAnimation();

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragStart={() => dispatch({ type: "DRAG_STARTED", payload: { host } })}
      onDragEnd={() => {
        dispatch({ type: "DRAG_ENDED", payload: { host } });

        let newPos = host.pos;
        if (draggingState?.valid) {
          newPos = draggingState.nextPos;
        }
        controls.start({
          y: (rackHeight - newPos - host.height) * (HOST_HEIGHT + RACK_GAP),
        });
      }}
      onDrag={(_, info) => {
        const y = host.pos * (HOST_HEIGHT + RACK_GAP) - info.offset.y;
        const pos = Math.min(
          Math.max(Math.round(y / (HOST_HEIGHT + RACK_GAP)), 0),
          rackHeight - host.height,
        );

        if (draggingState) {
          const { nextPos } = draggingState;
          if (pos !== nextPos) {
            dispatch({
              type: "DRAG_MOVED",
              payload: { host, pos },
            });
          }
        }
      }}
      initial={false}
      animate={controls}
      onAnimationComplete={() => dispatch({ type: "ANIMATION_ENDED" })}
      className={
        "absolute top-0 left-0 flex w-[400px] flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2 hover:bg-blue-100"
      }
      style={{
        y: (rackHeight - host.pos - host.height) * (HOST_HEIGHT + RACK_GAP),
        height: host.height * (HOST_HEIGHT + RACK_GAP) - RACK_GAP,
        zIndex: isDragging ? 99 : 1,
      }}
    >
      <div className="text-sm font-bold">{host.name}</div>
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          host.status == "running" ? "bg-green-600" : "bg-red-400",
        )}
      ></div>
    </motion.div>
  );
}
