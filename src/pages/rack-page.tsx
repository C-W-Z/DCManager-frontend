import { useEffect, useState, useReducer, useCallback, createContext } from "react";
import { getRack } from "@/lib/api";
import { Rack } from "@/lib/type";
import { RackDnD } from "@/components/rack-dnd/rack-dnd";
import {
  RackDroppable,
  Action,
  RackDnDReducer,
  createInitialState,
} from "@/components/rack-dnd/rack-dnd-reducer";
import { AddHostDialog } from "@/components/dialogs/add-host-dialog";
import { useParams } from "react-router-dom";
import Icon from "@/components/icon";
import { LoadingView } from "@/components/loading-view";
import { useUser } from "@/context/use-user";
import { FallbackView } from "@/components/fallback-view";
import { Separator, DataFlexRow } from "@/components/components";
import { Button } from "@/components/ui/button";
import { DeleteConfirmation } from "@/components/dialogs/delete-confirm";
import { EditRackDialog } from "@/components/dialogs/edit-rack-dialog";
import { MoveItemDialog } from "@/components/dialogs/move-item";

export function RackPage() {
  const rackName = useParams().rackName as string;
  const [rack, setRack] = useState<Rack | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user, accessableService } = useUser();

  const LoadRack = useCallback((rackName: string) => {
    setLoading(true);

    getRack(rackName)
      .then((rack) => {
        setRack(rack);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setRack(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    LoadRack(rackName);
  }, [LoadRack, rackName]);

  if (!user) {
    return <FallbackView text="請登入以瀏覽此頁面。" />;
  }

  if (loading) {
    return <LoadingView text="Loading rack..." />;
  }

  if (!rack) {
    return <FallbackView text={`Rack: ${rackName} not found.`} />;
  }

  if (user.role === "admin") {
    return <AdminWrapper rack={rack} setRack={setRack} LoadRack={LoadRack} />;
  }

  if (!accessableService.includes(rack.service_name)) {
    return <FallbackView text={`你沒有權限瀏覽 ${rack.name}`} />;
  }

  return <UserWrapper rack={rack} LoadRack={LoadRack} />;
}

const RackContext = createContext<{
  state: RackDroppable;
  dispatch: React.ActionDispatch<[action: Action]>;
} | null>(null);

function UserWrapper({ rack, LoadRack }: { rack: Rack; LoadRack: (_: string) => void }) {
  const [state, dispatch] = useReducer(RackDnDReducer, rack, createInitialState);

  return (
    <RackContext.Provider value={{ state, dispatch }}>
      <div className="flex h-screen w-full flex-row items-start justify-between px-20 pt-12">
        <div className="flex h-fit w-full flex-col items-start justify-start">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="rack" className="size-7" />
            <div className="text-2xl font-bold">{rack.name}</div>
          </div>
          <div className="flex h-fit w-md flex-col gap-4">
            <Separator />
            <DataFlexRow label="Datacenter" data={rack.dc_name} />
            <DataFlexRow label="Room" data={rack.room_name} />
            <Separator />
            <DataFlexRow
              label="運行服務"
              data={rack.service_name}
              link={`/service/${rack.service_name}`}
            />
            <DataFlexRow
              label="已用單位"
              data={`${rack.height - rack.capacity}/${rack.height}`}
            />
            <DataFlexRow label="已上架機器數量" data={`${rack.n_hosts}`} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <AddHostDialog context={RackContext} onSuccess={() => LoadRack(rack.name)} />
          <RackDnD context={RackContext} />
          <div className="text-sm text-gray-500">Click the host to manage host.</div>
        </div>
      </div>
    </RackContext.Provider>
  );
}

function AdminWrapper({
  rack,
  setRack,
  LoadRack,
}: {
  rack: Rack;
  setRack: (_: Rack | null) => void;
  LoadRack: (_: string) => void;
}) {
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
          <div className="flex h-fit w-md flex-col gap-4">
            <Separator />
            <DataFlexRow label="Datacenter" data={rack.dc_name} />
            <DataFlexRow label="Room" data={rack.room_name} />
            <Separator />
            <DataFlexRow
              label="運行服務"
              data={rack.service_name}
              link={`/service/${rack.service_name}`}
            />
            <DataFlexRow
              label="已用單位"
              data={`${rack.height - rack.capacity}/${rack.height}`}
            />
            <DataFlexRow label="已上架機器數量" data={`${rack.n_hosts}`} />
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
          </div>
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <AddHostDialog context={RackContext} onSuccess={() => LoadRack(rack.name)} />
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
