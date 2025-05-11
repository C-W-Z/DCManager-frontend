import { SimpleHost } from "@/lib/type";
import { motion, PanInfo, useMotionValue, useMotionValueEvent } from "motion/react";
import { height2Px, pos2translateY, HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRackContext } from "./rack-context";
import { useRef } from "react";

interface HostDraggableProps {
  host: SimpleHost;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export default function HostDraggable({
  host,
  constraintsRef,
  scrollRef,
}: HostDraggableProps) {
  const { state, dispatch } = useRackContext();

  const translateY = useMotionValue(pos2translateY(host.pos, host.height, state.rack.height));

  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  function clearScrollInterval() {
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }

  function handleOnDrag(_: MouseEvent, info: PanInfo) {
    if (state.dragging && state.dragging.id === host.id) {
      // update pos
      const y = host.pos * (HOST_HEIGHT + RACK_GAP) - info.offset.y;
      const pos = Math.min(
        Math.max(Math.round(y / (HOST_HEIGHT + RACK_GAP)), 1),
        state.rack.height - host.height + 1,
      );

      const { nextPos } = state.dragging;
      if (pos !== nextPos) {
        dispatch({
          type: "DRAG_MOVED",
          payload: { host, pos },
        });
      }

      // auto scroll
      const scrollBox = scrollRef.current;
      if (!scrollBox) return;

      const scrollRect = scrollBox.getBoundingClientRect();
      const topEdge = scrollRect.y;
      const bottomEdge = scrollRect.y + scrollRect.height;
      const threshold = 100;
      const maxSpeed = 10;

      let direction = 0;
      let distance = 0;

      if (
        info.point.y < topEdge + threshold &&
        info.point.y > topEdge &&
        scrollBox.scrollTop > 0
      ) {
        direction = -1;
        distance = info.point.y - topEdge;
      } else if (
        info.point.y > bottomEdge - threshold &&
        info.point.y < bottomEdge &&
        scrollBox.scrollTop + scrollBox.clientHeight < scrollBox.scrollHeight
      ) {
        direction = 1;
        distance = bottomEdge - info.point.y;
      }

      if (direction !== 0) {
        const speed = Math.round((distance / threshold) * maxSpeed);

        if (scrollIntervalRef.current === null) {
          scrollIntervalRef.current = setInterval(() => {
            scrollBox.scrollBy({ top: speed * direction, behavior: "auto" });
            translateY.set(translateY.get() + speed * direction);
          }, 16);
        }
      } else {
        clearScrollInterval();
      }
    }
  }

  function handleDragEnd() {
    dispatch({ type: "DRAG_ENDED", payload: { host } });

    if (state.dragging && state.dragging.id === host.id) {
      if (state.dragging.valid) {
        toast.success(
          `Host ${host.name} successfully moved to position ${state.dragging.nextPos}`,
        );
      } else {
        toast.warning(`Host cannot be moved here`);
      }

      const newPos = state.dragging.valid ? state.dragging.nextPos : state.dragging.initialPos;
      translateY.set(pos2translateY(newPos, host.height, state.rack.height));
    }

    clearScrollInterval();
  }

  useMotionValueEvent(translateY, "animationComplete", () =>
    dispatch({
      type: "ANIMATION_ENDED",
    }),
  );

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        onDragStart={() => dispatch({ type: "DRAG_STARTED", payload: { host } })}
        onDrag={handleOnDrag}
        onDragEnd={handleDragEnd}
        initial={false}
        className={
          "absolute top-0 left-0 flex w-full flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2 hover:bg-blue-100"
        }
        style={{
          y: translateY,
          height: height2Px(host.height),
          zIndex: state.dragging?.id === host.id ? 99 : 1,
        }}
      >
        <div className="text-sm font-bold">{host.name}</div>
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            host.status === "running"
              ? "bg-green-600"
              : host.status === "idle"
                ? "bg-gray-400"
                : "bg-red-400",
          )}
        ></div>
      </motion.div>
    </>
  );
}
