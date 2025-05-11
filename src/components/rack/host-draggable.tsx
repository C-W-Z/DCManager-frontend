import { SimpleHost } from "@/lib/type";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Action, RackDroppable } from "./rack-dnd-reducer";
import { height2Px, pos2Ytranslate, HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HostDraggableProps {
  host: SimpleHost;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  state: RackDroppable;
  dispatch: React.ActionDispatch<[action: Action]>;
}

export default function HostDraggable({
  host,
  constraintsRef,
  state,
  dispatch,
}: HostDraggableProps) {
  const controls = useAnimation();
  // const [scrollY, setScrollY] = useState<number>(0);

  function handleOnDrag(_: MouseEvent, info: PanInfo) {
    // update pos
    if (state.dragging && state.dragging.id === host.id) {
      const y = host.pos * (HOST_HEIGHT + RACK_GAP) - info.offset.y;
      const pos = Math.min(
        Math.max(Math.round(y / (HOST_HEIGHT + RACK_GAP)), 1),
        state.rack.height - host.height,
      );

      const { nextPos } = state.dragging;
      if (pos !== nextPos) {
        console.log("dispatching drag moved", pos);

        dispatch({
          type: "DRAG_MOVED",
          payload: { host, pos },
        });
      }
    }

    // auto scroll
    // const container = scrollRef.current;
    // if (container) {
    //   const rect = container.getBoundingClientRect();
    //   const pointerY = info.point.y - rect.top;
    //   const threshold = 100; // pixels from the top/bottom to start scrolling
    //   const speed = 0.5;

    //   if (pointerY < threshold && pointerY > 0 && container.scrollTop > 0) {
    //     container.scrollBy({ top: -speed, behavior: "auto" });
    //     setScrollY((prev) => prev - speed);
    //   } else if (
    //     pointerY > rect.height - threshold &&
    //     pointerY < rect.height &&
    //     container.scrollTop < container.scrollHeight - rect.height - 10
    //   ) {
    //     container.scrollBy({ top: speed, behavior: "auto" });
    //     setScrollY((prev) => prev + speed);
    //   }
    // }
  }

  function handleDragEnd() {
    dispatch({ type: "DRAG_ENDED", payload: { host } });

    if (state.dragging && state.dragging.id === host.id) {
      if (state.dragging.valid) {
        toast.success(
          `Host ${host.name} successfully moved to position ${state.dragging.nextPos}`,
        );
      } else {
        toast.warning(`Host ${host.name} cannot be moved here`);
      }

      const newPos = state.dragging.valid ? state.dragging.nextPos : state.dragging.initialPos;
      controls.start({
        y: pos2Ytranslate(newPos, host.height, state.rack.height),
        transition: { ease: "easeInOut" },
      });
    }
  }

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
        animate={controls}
        onAnimationComplete={() =>
          dispatch({
            type: "ANIMATION_ENDED",
          })
        }
        className={
          "absolute top-0 left-0 flex w-full flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2 hover:bg-blue-100"
        }
        style={{
          y: pos2Ytranslate(host.pos, host.height, state.rack.height),
          height: height2Px(host.height),
          zIndex: state.dragging?.id === host.id ? 99 : 1,
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
