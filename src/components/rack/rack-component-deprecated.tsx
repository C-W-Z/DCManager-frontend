import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragUpdate,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import HostComponent from "@/components/rack/host-component";
import { Rack, SimpleHost } from "@/lib/type";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { AddHostDialog } from "@/components/explorer/dialogs/add-host-dialog";

interface RackProps {
  rack: Rack;
  setRack: (rack: Rack) => void;
}
export default function RackComponent({ rack, setRack }: RackProps) {
  const [rackItems, setRackItems] = useState([] as RackItem[]);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    const rackItems = buildRackItems(rack);
    setRackItems(rackItems);
  }, [rack]);

  function handleOnDragUpdate(update: DragUpdate) {
    const new_rack_items = Array.from(rackItems);

    if (update.draggableId && update.destination) {
      const dragging_item_index = parseInt(update.draggableId.split("-")[1]);
      const dragging_to_index = update.destination.index;

      rackItems.forEach((item, index) => {
        if (index >= dragging_to_index && index < dragging_item_index) {
          item.display_pos = item.stored_pos - rackItems[dragging_item_index].height;
        } else if (index <= dragging_to_index && index > dragging_item_index) {
          item.display_pos = item.stored_pos + rackItems[dragging_item_index].height;
        } else {
          item.display_pos = item.stored_pos;
        }
      });

      if (dragging_to_index < dragging_item_index) {
        rackItems[dragging_item_index].display_pos =
          rackItems[dragging_to_index].stored_pos -
          rackItems[dragging_item_index].height +
          rackItems[dragging_to_index].height;
      } else if (dragging_to_index > dragging_item_index) {
        rackItems[dragging_item_index].display_pos = rackItems[dragging_to_index].stored_pos;
      }
      setRackItems(new_rack_items);
    }

    setIsUpdate(true);
  }

  function handleOnDragEnd(result: DropResult) {
    if (!result.destination) return;

    const new_rack_items = Array.from(rackItems);
    const [reordered_rack_items] = new_rack_items.splice(result.source.index, 1);
    new_rack_items.splice(result.destination.index, 0, reordered_rack_items);

    new_rack_items.forEach((item) => {
      item.stored_pos = item.display_pos;
    });

    setRackItems(new_rack_items);
  }

  function saveRackUpdate() {
    const new_hosts: SimpleHost[] = [];
    for (let i = rackItems.length - 1; i >= 0; i--) {
      const item = rackItems[i];
      if (item.host) {
        new_hosts.push({
          ...item.host,
          pos: item.display_pos,
        });
      }
    }

    setRack({
      ...rack,
      hosts: new_hosts,
      n_hosts: new_hosts.length,
    });
  }

  return (
    <div className="flex flex-col items-start justify-start gap-4">
      <DragDropContext onDragEnd={handleOnDragEnd} onDragUpdate={handleOnDragUpdate}>
        <Droppable droppableId="rack">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex h-[70vh] w-fit flex-col items-end overflow-y-scroll rounded-lg border-2 border-gray-950 p-4"
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
                          item.host ? "" : "pointer-events-none",
                        )}
                      >
                        <div className="w-12 pb-2 text-sm font-bold">{item.display_pos}</div>
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

      <div className="flex w-full flex-row items-start justify-between">
        <div className="flex flex-col">
          <Button
            variant="destructive"
            className={cn("w-[140px]", isUpdate ? "" : "pointer-events-none bg-gray-300")}
            onClick={() => {
              saveRackUpdate();
              toast.success("Rack saved successfully");
              setIsUpdate(false);
            }}
          >
            Save
          </Button>
          {isUpdate && <div className="text-red-500">You have changes not saved</div>}
        </div>
        <AddHostDialog rack={rack} setRack={setRack} isUpdate={isUpdate} />
      </div>
    </div>
  );
}

interface RackItem {
  host: SimpleHost | null;
  height: number;
  display_pos: number;
  stored_pos: number;
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
          display_pos: i,
          stored_pos: i,
        });
      }
    }

    items.push({
      host: host,
      height: host.height,
      display_pos: host.pos,
      stored_pos: host.pos,
    });

    currentPos = host.pos + host.height;
  });

  if (currentPos <= rack.height) {
    for (let i = currentPos; i <= rack.height; i++) {
      items.push({
        host: null,
        height: 1,
        display_pos: i,
        stored_pos: i,
      });
    }
  }

  return items.reverse();
}
