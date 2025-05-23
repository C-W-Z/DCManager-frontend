import { useEffect, useState, useReducer, createContext } from "react";
import { getRack } from "@/lib/api";
import { Rack } from "@/lib/type";
import RackDnD from "@/components/rack-dnd/rack-dnd";
import { RackDnDReducer, RackDroppable, Action } from "@/components/rack-dnd/rack-dnd-reducer";
import { InfoCard, Separator, CardColumn } from "@/components/components";
import { AddHostDialog } from "@/components/rack/add-host-dialog";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import Icon from "@/components/icon";
import { DeleteConfirmation } from "../explorer/dialogs/delete-confirm";
import { EditRackDialog } from "../explorer/dialogs/edit-rack";
import { MoveItemDialog } from "../explorer/dialogs/move-item";
import { LoadingView } from "../loading-view";
import { useUser } from "@/context/use-user";

const RackContext = createContext<{
  state: RackDroppable;
  dispatch: React.ActionDispatch<[action: Action]>;
} | null>(null);

export default function RackView() {
  const rackId = useParams().rackId as string;
  const [loading, setLoading] = useState<boolean>(false);
  const [rack, setRack] = useState<Rack | null>(null);

  useEffect(() => {
    setLoading(true);
    getRack(rackId)
      .then((rack) => {
        setRack(rack);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setRack(null);
      });
  }, [rackId]);

  useEffect(() => {
    if (loading && rack) {
      setLoading(false);
    }
  }, [loading, rack]);

  if (loading) {
    return <LoadingView text={`Loading rack ${rackId}...`} />;
  }

  return (
    <>
      {rack ? (
        <Wrapper rack={rack} setRack={setRack} />
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
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
      spaces[host.pos - 1 + i] = host.name;
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

function Wrapper({ rack, setRack }: { rack: Rack; setRack: (_: Rack | null) => void }) {
  const { user } = useUser();
  const [state, dispatch] = useReducer(RackDnDReducer, rack, createInitialState);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [editRack, setEditRack] = useState<Rack | null>(null);
  const [racksToMove, setRacksToMove] = useState<Rack[]>([]);

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
              <CardColumn label="Data Center" data={rack.dc_name} />
              <CardColumn label="Room" data={rack.room_name} />
              <Separator />
              <CardColumn label="UUID" data={rack.name} />
              <CardColumn
                label="Capacity"
                data={`${rack.height - rack.capacity}/${rack.height}`}
              />
              <CardColumn label="Hosts" data={`${rack.n_hosts}`} />
              <CardColumn
                label="Service"
                data={rack.service_name}
                link={`/service/${rack.service_name}`}
              />
              {user?.role === "admin" && (
                <div className="mt-4 flex flex-row items-center justify-center gap-8">
                  <Button
                    variant="outline"
                    className="w-24"
                    onClick={() => {
                      setEditRack(null);
                      setTimeout(() => {
                        setEditRack(rack);
                      }, 0);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRacksToMove([]);
                      setTimeout(() => {
                        setRacksToMove([rack]);
                      }, 0);
                    }}
                  >
                    Move Rack
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-24"
                    onClick={() => {
                      setDeleteIds([]);
                      setTimeout(() => {
                        setDeleteIds([rack.name]);
                      }, 0);
                    }}
                  >
                    DELETE
                  </Button>
                </div>
              )}
            </>
          </InfoCard>
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <AddHostDialog context={RackContext} />
          <RackDnD context={RackContext} />
          <div className="text-sm text-gray-500">Click the host to manage host.</div>
        </div>
      </div>

      <EditRackDialog
        rack={editRack}
        onUpdateSuccess={(updatedRack) => setRack({ ...rack, ...updatedRack })}
      />
      <MoveItemDialog type="rack" items={racksToMove} />
      <DeleteConfirmation
        ids={deleteIds}
        type="rack"
        itemNames={[rack.name]}
        onSuccess={() => setRack(null)}
      />
    </RackContext.Provider>
  );
}
