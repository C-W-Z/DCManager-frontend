import { useEffect, useState, useReducer, createContext } from "react";
import { getHost, getRack } from "@/lib/api";
import { Host, Rack } from "@/lib/type";
import { InfoCard, Separator, CardColumn } from "@/components/infocard";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { useParams, useNavigate } from "react-router-dom";
import { DeleteConfirmation } from "../explorer/dialogs/delete-confirm";
import { EditHostDialog } from "./edit-host";
import { RackDroppable, RackDnDReducer, Action } from "@/components/rack-dnd/rack-dnd-reducer";
import RackDnD from "@/components/rack-dnd/rack-dnd";
import { MoveItemDialog } from "../explorer/dialogs/move-item";
import { LoadingView } from "../loading-view";

export default function HostView() {
  const hostId = useParams().hostId as string;
  const [loading, setLoading] = useState<boolean>(false);
  const [rack, setRack] = useState<Rack | null>(null);
  const [host, setHost] = useState<Host | null>(null);

  useEffect(() => {
    setLoading(true);
    getHost(hostId)
      .then((host) => {
        setHost(host);

        getRack(host.rack_name)
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

  useEffect(() => {
    if (loading && host && rack) {
      setLoading(false);
    }
  }, [loading, host, rack]);

  if (loading) {
    return <LoadingView text={`Loading host ${hostId}...`} />;
  }

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
  const [moveHost, setMoveHost] = useState<Host[]>([]);
  const navigate = useNavigate();

  function onMoveUpdate(newPos: number) {
    setHost({ ...host, pos: newPos });
  }

  function onMoveSuccess(data: { rack_name: string | null }) {
    if (data.rack_name) {
      setHost({ ...host, rack_name: data.rack_name });
      navigate(`/rack/${data.rack_name}`);
    }
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
              <CardColumn label="Data Center" data={host.dc_name} />
              <CardColumn label="Room" data={host.room_name} />
              <CardColumn
                label="Rack"
                data={host.rack_name}
                link={`/rack/${host.rack_name}`}
              />
              <CardColumn label="Position" data={`${host.pos}`} />
              <Separator />
              <CardColumn label="UUID" data={host.name} />
              <CardColumn label="Height" data={`${host.height}`} />
              <CardColumn label="IP" data={host.ip} />
              <CardColumn
                label="Service"
                data={host.service_name}
                link={`/service/${host.service_name}`}
              />
              {/* TODO: not sure is this ok? */}
              <CardColumn label="Status" data={host.running ? "running" : "stopped"} />
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
                <Button
                  variant="destructive"
                  className="w-24"
                  onClick={() => {
                    setDeleteIds([]);
                    setTimeout(() => {
                      setDeleteIds([host.name]);
                    }, 0);
                  }}
                >
                  DELETE
                </Button>
              </div>
            </>
          </InfoCard>
        </div>
        <div className="flex flex-col items-center justify-start gap-2">
          <Button
            onClick={() => {
              setMoveHost([]);
              setTimeout(() => {
                setMoveHost([host]);
              }, 0);
            }}
            className="flex h-fit w-full flex-row items-center justify-start gap-3 self-start text-sm font-bold"
          >
            <Icon id="move" className="size-4 fill-white" />
            <p className="pr-2">Move Host To Other Rack</p>
          </Button>
          <RackDnD context={HostContext} hostId={host.name} onMoveUpdate={onMoveUpdate} />
          <div className="text-sm text-gray-500">Drag the host to move in rack.</div>
        </div>
      </div>

      <EditHostDialog
        host={editHost}
        onUpdateSuccess={(updatedHost) => setHost({ ...host, ...updatedHost })}
      />
      <MoveItemDialog type="host" items={moveHost} onSuccess={onMoveSuccess} />
      <DeleteConfirmation
        ids={deleteIds}
        type="host"
        itemNames={[host.name]}
        onSuccess={() => setHost(null)}
      />
    </HostContext.Provider>
  );
}
