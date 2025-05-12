import { useEffect, useState, useReducer } from "react";
import { getRack } from "@/lib/api";
import { Rack } from "@/lib/type";
import RackDnD from "@/components/rack/rack-dnd";
import { RackDnDReducer, RackDroppable } from "@/components/rack/rack-dnd-reducer";
import { RackContext } from "@/components/rack/rack-context";
import { InfoCard, Separator, CardColumn } from "@/components/infocard";
import { AddHostDialog } from "@/components/rack/add-host-dialog";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import Icon from "@/components/icon";

export default function RackView() {
  const rackId = useParams().rackId as string;
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
          <div className="text-xl font-bold">Rack ID: {rackId} not found :(</div>
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

function Wrapper({ rack }: { rack: Rack }) {
  const [state, dispatch] = useReducer(RackDnDReducer, rack, createInitialState);

  return (
    <RackContext.Provider value={{ state, dispatch }}>
      <div className="mx-auto flex h-fit items-start justify-between px-20 pt-12">
        <div className="flex h-fit w-full flex-col items-start justify-start">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="rack" className="size-8" />
            <div className="text-2xl font-bold">{rack.name}</div>
          </div>
          <InfoCard>
            <>
              <Separator />
              <CardColumn label="Data Center" data={rack.dc_id} />
              <CardColumn label="Room" data={rack.room_id} />
              <CardColumn label="Service" data={rack.service_name} />
              <Separator />
              <CardColumn label="UUID" data={rack.id} />
              <CardColumn label="Capacity" data={`${rack.capacity}/${rack.height}`} />
              <CardColumn label="Hosts" data={`${rack.n_hosts}`} />
              <div className="mt-4 flex flex-row items-center justify-center gap-8">
                {/* This will be replace by Dialogs*/}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Edit rack");
                  }}
                >
                  Edit Rack
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    console.log("Delete rack");
                  }}
                >
                  Delete Rack
                </Button>
              </div>
            </>
          </InfoCard>
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <AddHostDialog />
          <RackDnD />
          <div className="text-sm text-gray-500">
            Drag the host to move. Click the host to see host information.
          </div>
        </div>
      </div>
    </RackContext.Provider>
  );
}
