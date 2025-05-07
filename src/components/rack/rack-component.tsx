import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { Rack, SimpleHost } from "@/lib/type";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import HostDraggable from "./host-draggable";
import SpaceDroppable from "./space-droppable";

interface RackProps {
  rack: Rack;
  setRack: (rack: Rack) => void;
}
export default function RackComponent({ rack, setRack }: RackProps) {
  const [rackItems, setRackItems] = useState([] as RackItem[]);

  useEffect(() => {
    const rackItems = buildRackItems(rack);
    setRackItems(rackItems);
  }, [rack]);

  return (
    <div className="flex flex-col items-start justify-start gap-4">
      <div
        className="flex h-[70vh] w-fit flex-col items-end overflow-y-scroll rounded-lg border-2 border-gray-950 p-4"
        style={{ gap: `${RACK_GAP}px` }}
      >
        {rackItems.map((item) => (
          <div
            key={item.pos}
            className={cn(
              "flex w-fit flex-row items-end justify-start",
              item.host ? "" : "pointer-events-none",
            )}
          >
            <div className="w-12 pb-2 text-sm font-bold">{item.pos}</div>
            {item.host ? (
              <HostDraggable host={item.host} />
            ) : (
              <SpaceDroppable height={item.height} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface RackItem {
  host: SimpleHost | null;
  height: number;
  pos: number;
}

function buildRackItems(rack: Rack) {
  const items: RackItem[] = [];
  let currentPos = 1;

  rack.hosts.forEach((host) => {
    if (host.pos > currentPos) {
      items.push({
        host: null,
        height: host.pos - currentPos,
        pos: currentPos,
      });
    }

    items.push({
      host: host,
      height: host.height,
      pos: host.pos,
    });

    currentPos = host.pos + host.height;
  });

  if (currentPos <= rack.height) {
    items.push({
      host: null,
      height: rack.height - currentPos + 1,
      pos: currentPos,
    });
  }

  return items.reverse();
}
