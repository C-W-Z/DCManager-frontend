import { useEffect, useState, useReducer, createContext } from "react";
import { getHost, getRack } from "@/lib/api";
import { Host, Rack } from "@/lib/type";
import { InfoCard, Separator, CardColumn } from "@/components/infocard";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { useParams } from "react-router-dom";
import { DeleteConfirmation } from "../explorer/dialogs/delete-confirm";
import { EditHostDialog } from "./edit-host";
import { RackDroppable, RackDnDReducer, Action } from "@/components/rack-dnd/rack-dnd-reducer";
import RackDnD from "@/components/rack-dnd/rack-dnd";

export default function HostView() {
  const hostId = useParams().hostId as string;
  const [rack, setRack] = useState<Rack | null>(null);
  const [host, setHost] = useState<Host | null>(null);

  useEffect(() => {
    getHost(hostId)
      .then((host) => {
        setHost(host);

        getRack(host.rack_id)
          .then((rack) => {
            setRack(rack);
          })
          .catch((error) => {
            console.error("Error fetching rack data:", error);
            setRack(null);
          });
      })
      .catch((error) => {
        console.error("Error fetching host data:", error);
        setHost(null);
      });
  }, [hostId]);

  return (
    <>
      {host && rack ? (
        <Wrapper rack={rack} host={host} setHost={setHost} />
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-xl font-bold">Host ID: {hostId} not found :(</div>
        </div>
      )}
    </>
  );
}

const HostContext = createContext<{
  state: RackDroppable;
  dispatch: React.ActionDispatch<[action: Action]>;
} | null>(null);

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

function Wrapper({
  rack,
  host,
  setHost,
}: {
  rack: Rack;
  host: Host;
  setHost: (_: Host | null) => void;
}) {
  const [state, dispatch] = useReducer(RackDnDReducer, rack, createInitialState);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [editHost, setEditHost] = useState<Host | null>(null);

  function onMoveUpdate(newPos: number) {
    setHost({ ...host, pos: newPos });
  }

  return (
    <HostContext.Provider value={{ state, dispatch }}>
      <div className="mx-auto flex h-fit items-start justify-between px-20 pt-12">
        <div className="flex h-fit w-full flex-col items-start justify-start">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="host" className="size-8" />
            <div className="text-2xl font-bold">{host.name}</div>
          </div>
          <InfoCard>
            <>
              <Separator />
              <CardColumn label="Data Center" data={host.dc_id} />
              <CardColumn label="Room" data={host.room_id} />
              <CardColumn label="Rack" data={host.rack_id} />
              <CardColumn label="Position" data={`${host.pos}`} />
              <Separator />
              <CardColumn label="UUID" data={host.id} />
              <CardColumn label="Height" data={`${host.height}`} />
              <CardColumn label="IP" data={host.ip} />
              <CardColumn label="Service" data={host.service_id} />
              <CardColumn label="Status" data={host.status} />
              <div className="mt-4 flex flex-row items-center justify-center gap-8">
                <Button
                  variant="outline"
                  className="w-24"
                  onClick={() => {
                    setEditHost(null);
                    setTimeout(() => {
                      setEditHost(host);
                    }, 0);
                  }}
                >
                  Edit
                </Button>
                <EditHostDialog
                  host={editHost}
                  onUpdateSuccess={(updatedHost) => setHost({ ...host, ...updatedHost })}
                />
                <Button
                  variant="destructive"
                  className="w-24"
                  onClick={() => {
                    setDeleteIds([]);
                    setTimeout(() => {
                      setDeleteIds([host.id]);
                    }, 0);
                  }}
                >
                  DELETE
                </Button>
                <DeleteConfirmation
                  ids={deleteIds}
                  type="host"
                  itemNames={[host.name]}
                  onSuccess={() => setHost(null)}
                />
              </div>
            </>
          </InfoCard>
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <Button className="flex h-fit w-full flex-row items-center justify-start gap-3 text-sm font-bold">
            <Icon id="move" className="size-4 fill-white" />
            <p>Move Host To Other Rack</p>
          </Button>
          <RackDnD context={HostContext} hostId={host.id} onMoveUpdate={onMoveUpdate} />
          <div className="text-sm text-gray-500">Drag the host to move in rack.</div>
        </div>
      </div>
    </HostContext.Provider>
  );
}
