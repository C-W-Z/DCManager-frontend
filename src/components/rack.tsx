import { Host, Rack } from "@/lib/schema";
import HostComponent from "./host";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragUpdate,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface RackProps {
  rack: Rack;
}

export default function RackComponent({ rack }: RackProps) {
  const [rackItems, setRackItems] = useState([] as RackItem[]);

  useEffect(() => {
    const rackItems = buildRackItems(rack);
    setRackItems(rackItems);
  }, [rack]);

  const handleOnDragStart = () => {
    // store initial positions
    const newRackItems = Array.from(rackItems);
    newRackItems.forEach((item) => {
      item.tempPos = item.pos;
    });
    setRackItems(newRackItems);
  };

  const handleOnDragUpdate = (update: DragUpdate) => {
    const updateRackItems = Array.from(rackItems);

    if (update.draggableId && update.destination) {
      const draggingItemIndex = parseInt(update.draggableId.split("-")[1]);
      const draggingItemToIndex = update.destination.index;

      rackItems.forEach((item, index) => {
        if (index >= draggingItemToIndex && index < draggingItemIndex) {
          item.pos = item.tempPos - rackItems[draggingItemIndex].height;
        } else {
          item.pos = item.tempPos;
        }
      });

      if (draggingItemToIndex !== draggingItemIndex) {
        rackItems[draggingItemIndex].pos =
          rackItems[draggingItemToIndex].pos + rackItems[draggingItemToIndex].height;
      }

      setRackItems(updateRackItems);
    }
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newRackItems = Array.from(rackItems);
    const [reorderedItem] = newRackItems.splice(result.source.index, 1);
    newRackItems.splice(result.destination.index, 0, reorderedItem);

    setRackItems(newRackItems);
  };

  return (
    <DragDropContext
      onDragStart={handleOnDragStart}
      onDragUpdate={handleOnDragUpdate}
      onDragEnd={handleOnDragEnd}
    >
      <Droppable droppableId="rack">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-[720px] w-fit flex-col items-end overflow-y-scroll rounded-lg border-2 border-gray-950 p-4"
            style={{ gap: `${RACK_GAP}px` }}
          >
            {rackItems.map((item, index) => (
              <Draggable key={index} draggableId={`item-${index}`} index={index}>
                {(provided, snapshot) => {
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "flex w-fit flex-row items-end justify-start",
                        snapshot.isDragging ? "scale-110" : "",
                      )}
                    >
                      <div className="w-12 pb-2 text-sm font-bold">{item.pos}</div>
                      {item.host ? (
                        <HostComponent host={item.host} />
                      ) : (
                        <div
                          className="w-[400px] rounded-lg bg-gray-100"
                          style={{ height: `${HOST_HEIGHT}px` }}
                        ></div>
                      )}
                    </div>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

interface RackItem {
  host: Host | null;
  height: number;
  pos: number;
  tempPos: number;
}

function buildRackItems(rack: Rack) {
  const items: RackItem[] = [];
  let currentPos = 1;

  rack.hosts.forEach((host) => {
    if (host.pos > currentPos) {
      for (let i = currentPos; i < host.pos; i++) {
        items.push({
          host: null,
          height: 1,
          pos: i,
          tempPos: 0,
        });
      }
    }

    items.push({
      host: host,
      height: host.height,
      pos: host.pos,
      tempPos: 0,
    });

    currentPos = host.pos + host.height;
  });

  if (currentPos <= rack.height) {
    for (let i = currentPos; i <= rack.height; i++) {
      items.push({
        host: null,
        height: 1,
        pos: i,
        tempPos: 0,
      });
    }
  }

  return items.reverse();
}
