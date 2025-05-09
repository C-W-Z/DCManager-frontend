import { SimpleHost, Rack } from "@/lib/type";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Action } from "./rack-dnd-reducer";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { modifyHost } from "@/lib/api";

interface HostDraggableProps {
  host: SimpleHost;
  rack: Rack;
  setRack: (rack: Rack) => void;
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
  rack,
  setRack,
  constraintsRef,
  scrollRef,
  draggingState,
  dispatch,
}: HostDraggableProps) {
  const isDragging = draggingState?.id === host.id;

  const controls = useAnimation();

  const [scrollY, setScrollY] = useState<number>(0);

  function updateRack(newPos: number) {
    const updatedHosts = [...rack.hosts];

    updatedHosts.forEach((h) => {
      if (h.id === host.id) {
        h.pos = newPos;
      }
    });

    const updatedRack = {
      ...rack,
      hosts: updatedHosts.sort((a, b) => a.pos - b.pos),
    };

    setRack(updatedRack);
  }

  function handleDragEnd() {
    let newPos = host.pos;
    if (draggingState?.valid) {
      newPos = draggingState.nextPos;

      if (draggingState?.valid) {
        modifyHost(host.id, {
          name: host.name,
          height: host.height,
          rack_id: host.rack_id,
          pos: newPos,
        })
          .then(() => {
            toast.success(`Host ${host.name} moved to position ${newPos}`);

            dispatch({ type: "DRAG_ENDED", payload: { host } });
          })
          .catch((err) => {
            toast.error(`Failed to move host ${host.name} to position ${newPos}: ${err}`);
          });
      }

      controls.start({
        y: (rack.height - (newPos - 1) - host.height) * (HOST_HEIGHT + RACK_GAP),
        transition: { duration: 0 },
      });
    } else {
      toast.warning(`Host ${host.name} cannot be moved here`);
    }

    setScrollY(0);
  }

  function handleOnDrag(_: MouseEvent, info: PanInfo) {
    const y = host.pos * (HOST_HEIGHT + RACK_GAP) - info.offset.y - scrollY;
    const pos = Math.min(
      Math.max(Math.round(y / (HOST_HEIGHT + RACK_GAP)), 0),
      rack.height - host.height,
    );

    if (isDragging) {
      // update pos
      const { nextPos } = draggingState;
      if (pos !== nextPos) {
        console.log("dispatching drag moved", pos);

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
      const speed = 0.5;

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
          y: (rack.height - (host.pos - 1) - host.height) * (HOST_HEIGHT + RACK_GAP),
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
