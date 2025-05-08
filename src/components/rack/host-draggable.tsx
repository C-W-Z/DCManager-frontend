import { SimpleHost } from "@/lib/type";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Action } from "./rack-dnd-reducer";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HostDraggableProps {
  host: SimpleHost;
  rackHeight: number;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
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
  scrollRef,
  draggingState,
  dispatch,
}: HostDraggableProps) {
  const isDragging = draggingState?.id === host.id;

  const controls = useAnimation();

  const [scrollY, setScrollY] = useState<number>(0);

  function handleDragEnd() {
    dispatch({ type: "DRAG_ENDED", payload: { host } });

    // trigger animation
    let newPos = host.pos;
    if (draggingState?.valid) {
      newPos = draggingState.nextPos;
    }
    controls.start({
      y: (rackHeight - newPos - host.height) * (HOST_HEIGHT + RACK_GAP),
      transition: { duration: 0 },
    });

    setScrollY(0);

    console.log("Host dropped:", host.name, "at position:", newPos + 1);
  }

  function handleOnDrag(_: any, info: PanInfo) {
    const y = host.pos * (HOST_HEIGHT + RACK_GAP) - info.offset.y - scrollY;
    const pos = Math.min(
      Math.max(Math.round(y / (HOST_HEIGHT + RACK_GAP)), 0),
      rackHeight - host.height,
    );

    if (isDragging) {
      // update pos
      const { nextPos } = draggingState;
      if (pos !== nextPos) {
        dispatch({
          type: "DRAG_MOVED",
          payload: { host, pos },
        });
      }
    }

    // auto scroll
    const container = scrollRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const pointerY = info.point.y - rect.top;
      const threshold = 100; // pixels from the top/bottom to start scrolling
      const speed = 2;

      if (pointerY < threshold && pointerY > 0 && container.scrollTop > 0) {
        container.scrollBy({ top: -speed, behavior: "auto" });
        setScrollY((prev) => prev - speed);
      } else if (
        pointerY > rect.height - threshold &&
        pointerY < rect.height &&
        container.scrollTop < container.scrollHeight - rect.height - 10
      ) {
        container.scrollBy({ top: speed, behavior: "auto" });
        setScrollY((prev) => prev + speed);
      }
    }
  }

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        onDragStart={() => dispatch({ type: "DRAG_STARTED", payload: { host } })}
        onDragEnd={handleDragEnd}
        onDrag={handleOnDrag}
        initial={false}
        animate={controls}
        className={
          "absolute top-0 left-0 flex w-full flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2 hover:bg-blue-100"
        }
        style={{
          y: (rackHeight - host.pos - host.height) * (HOST_HEIGHT + RACK_GAP),
          translateY: scrollY,
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
    </>
  );
}
