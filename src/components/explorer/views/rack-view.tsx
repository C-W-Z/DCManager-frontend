import { useEffect, useState, useReducer } from "react";
import { getRack } from "@/lib/api";
import { Rack } from "@/lib/type";
import { Skeleton } from "@/components/ui/skeleton";
import RackDnD from "@/components/rack/rack-dnd";
import { RackDnDReducer, RackDroppable } from "@/components/rack/rack-dnd-reducer";
import { RackContext } from "@/components/rack/rack-context";
import { AddHostDialog } from "../dialogs/add-host-dialog";

interface RackViewProps {
  rackId: string;
}

export default function RackView({ rackId }: RackViewProps) {
  const [rack, setRack] = useState<Rack | null>(null);

  useEffect(() => {
    getRack(rackId)
      .then((rack) => {
        setRack(rack);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setRack(null);
      });
  }, [rackId]);

  return (
    <>
      {rack ? (
        <Wrapper rack={rack} />
      ) : (
        <div className="flex w-full items-center justify-center">
          <Skeleton className="h-96 w-96" />
        </div>
      )}
    </>
  );
}

function createInitialState(rack: Rack): RackDroppable {
  const spaces = Array.from({ length: rack.height }, () => "space");

  rack.hosts.forEach((host) => {
    for (let i = 0; i < host.height; i++) {
      spaces[host.pos - 1 + i] = host.id;
    }
  });

  console.log("initial state", {
    rack,
    spaces,
  });

  return {
    rack,
    spaces,
    dragging: undefined,
  } as RackDroppable;
}

interface WrapperProps {
  rack: Rack;
}

function Wrapper({ rack }: WrapperProps) {
  const [state, dispatch] = useReducer(RackDnDReducer, rack, createInitialState);

  return (
    <RackContext.Provider value={{ state, dispatch }}>
      <div className="mx-auto flex max-w-6xl items-start justify-between p-4">
        <RackDnD />
        <AddHostDialog />
      </div>
    </RackContext.Provider>
  );
}
