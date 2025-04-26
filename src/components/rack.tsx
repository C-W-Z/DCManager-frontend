import { Rack } from "@/lib/schema";
import HostComponent from "./host";
import { HOST_HEIGHT, RACK_GAP } from "@/lib/constant";
import { JSX, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface RackProps {
  rack: Rack;
}

export default function RackComponent({ rack }: RackProps) {
  const [rackItems, setRackItems] = useState(buildRackItems(rack));

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    console.log(rackItems);
    console.log(result.source.index, result.destination.index);

    const newRackItems = Array.from(rackItems);
    const [reorderedItem] = newRackItems.splice(result.source.index, 1);
    newRackItems.splice(result.destination.index, 0, reorderedItem);

    setRackItems(newRackItems);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="rack">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-[720px] w-fit flex-col items-end overflow-y-scroll rounded-lg border-2 border-gray-950 p-4"
            style={{ gap: `${RACK_GAP}px` }}
          >
            {rackItems.map((item, index) => (
              <Draggable
                key={index}
                draggableId={`item-${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {item}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const spaceElement = (
  <div
    className="w-[400px] rounded-lg bg-gray-100"
    style={{ height: `${HOST_HEIGHT}px` }}
  ></div>
);

function buildRackItems(rack: Rack) {
  const items: JSX.Element[] = [];
  let currentPos = 1;

  rack.hosts.forEach((host) => {
    if (host.pos > currentPos) {
      for (let i = currentPos; i < host.pos; i++) {
        items.push(spaceElement);
      }
    }
    const hostElement = (
      <div className="flex w-fit flex-row items-end justify-start">
        <div className="w-8 pb-2 text-sm font-bold">{host.pos}</div>
        <HostComponent host={host} />
      </div>
    );
    items.push(hostElement);

    currentPos = host.pos + host.height;
  });

  if (currentPos <= rack.height) {
    for (let i = currentPos; i <= rack.height; i++) {
      items.push(spaceElement);
    }
  }

  return items.reverse();
}
