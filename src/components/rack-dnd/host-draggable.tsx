import { SimpleHost } from "@/lib/type";
import { motion, PanInfo, useMotionValue, useMotionValueEvent } from "motion/react";
import { height2Px, pos2translateY, HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { modifyHost } from "@/lib/api";
import { Link } from "react-router-dom";
import { useContextSafe } from "@/lib/utils";
import { RackContextType } from "@/components/rack-dnd/rack-dnd-reducer";

interface HostDraggableProps {
  host: SimpleHost;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  context: RackContextType;
  onUpdate?: (newPos: number) => void;
}

export default function HostDraggable({
  host,
  constraintsRef,
  scrollRef,
  context,
  onUpdate,
}: HostDraggableProps) {
  const { state, dispatch } = useContextSafe(context);

  const dragY = useMotionValue(pos2translateY(host.pos, host.height, state.rack.height));

  const translateY = useMotionValue(0);

  function handleOnDrag(_: MouseEvent, info: PanInfo) {
    if (state.dragging?.id === host.id) {
      // update pos
      const y = host.pos * (HOST_HEIGHT + RACK_GAP) - info.offset.y - translateY.get();
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
      const bottomEdge = scrollRect.y + scrollBox.clientHeight;
      const threshold = 100;
      const speed = 5;

      if (
        info.point.y < topEdge + threshold &&
        info.point.y > topEdge &&
        scrollBox.scrollTop > 0
      ) {
        scrollBox.scrollBy({ top: -speed, behavior: "auto" });
        translateY.set(translateY.get() - speed * 0.95);
      } else if (
        info.point.y > bottomEdge - threshold &&
        info.point.y < bottomEdge &&
        scrollBox.scrollTop + scrollBox.clientHeight < scrollBox.scrollHeight &&
        scrollBox.scrollHeight < (state.rack.height + 1) * (HOST_HEIGHT + RACK_GAP) - RACK_GAP
      ) {
        scrollBox.scrollBy({ top: speed, behavior: "auto" });
        translateY.set(translateY.get() + speed * 0.95);
      }
    }
  }

  function handleDragEnd() {
    dispatch({ type: "DRAG_ENDED", payload: { host } });

    if (state.dragging?.id === host.id) {
      if (state.dragging.valid) {
        toast.success(
          `Host ${host.name} successfully moved to position ${state.dragging.nextPos}`,
        );

        const newPos = state.dragging.nextPos;

        modifyHost(host.id, {
          rack_id: state.rack.id,
          pos: newPos,
        })
          .then(() => {
            toast.success(`Host ${host.name} moved successfully!`);
            onUpdate?.(newPos);
          })
          .catch((error) => {
            toast.error(`Failed to move host ${host.name}: ${error.message}`);
          });
      } else {
        toast.warning(`Host cannot be moved here`);
      }

      const newPos = state.dragging.valid ? state.dragging.nextPos : state.dragging.initialPos;
      dragY.set(pos2translateY(newPos, host.height, state.rack.height));
    }

    translateY.set(0);
  }

  useMotionValueEvent(dragY, "animationComplete", () =>
    dispatch({
      type: "ANIMATION_ENDED",
    }),
  );

  return (
    <>
      <motion.div
        drag="y"
        dragMomentum={false}
        dragConstraints={constraintsRef}
        onDragStart={() => dispatch({ type: "DRAG_STARTED", payload: { host } })}
        onDrag={handleOnDrag}
        onDragEnd={handleDragEnd}
        initial={false}
        className="absolute top-0 left-0 flex w-full flex-row items-center justify-between rounded-lg border-3 border-blue-500 bg-white px-4 py-2 hover:bg-blue-100"
        style={{
          y: dragY,
          translateY: translateY,
          height: height2Px(host.height),
          zIndex: state.dragging?.id === host.id ? 99 : 1,
        }}
      >
        <Link to={`/host/${host.id}`} className="text-sm font-bold hover:underline">
          {host.name}
        </Link>
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
      {state.dragging?.id === host.id && (
        <>
          <motion.div
            className="absolute top-0 left-0 z-10 inline-flex w-full items-center justify-center rounded-lg bg-gray-300 opacity-70"
            style={{
              y: pos2translateY(state.dragging.initialPos, host.height, state.rack.height),
              height: height2Px(host.height),
            }}
          />
          <motion.div
            className={cn(
              "absolute top-0 left-0 z-10 inline-flex w-full items-center justify-center rounded-lg opacity-70",
              state.dragging.valid ? "bg-green-300" : "bg-red-300",
            )}
            style={{
              y: pos2translateY(state.dragging.nextPos, host.height, state.rack.height),
              height: height2Px(host.height),
            }}
          />
        </>
      )}
    </>
  );
}
