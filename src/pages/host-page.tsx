import { useEffect, useState, useReducer, useCallback, createContext } from "react";
import { getHost, getRack } from "@/lib/api";
import { APIError, Host, Rack } from "@/lib/type";
import { Separator, DataFlexRow } from "@/components/components";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { useParams, useNavigate } from "react-router-dom";
import { DeleteConfirmation } from "@/components/dialogs/delete-confirm";
import { EditHostDialog } from "../components/dialogs/edit-host-dialog";
import {
  RackDroppable,
  RackDnDReducer,
  Action,
  createInitialState,
} from "@/components/rack-dnd/rack-dnd-reducer";
import { RackDnD } from "@/components/rack-dnd/rack-dnd";
import { LoadingView } from "@/components/loading-view";
import { FallbackView } from "@/components/fallback-view";
import { useUser } from "@/context/use-user";
import { MoveHostDialog } from "../components/dialogs/move-host-dialog";
import { toast } from "sonner";

export function HostPage() {
  const hostName = useParams().hostName as string;
  const [loading, setLoading] = useState<boolean>(false);
  const [rack, setRack] = useState<Rack | null>(null);
  const [host, setHost] = useState<Host | null>(null);
  const { user, accessableService } = useUser();

  const LoadRack = useCallback((rackName: string) => {
    getRack(rackName)
      .then((rack) => {
        setRack(rack);
      })
     .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setRack(null);
      });
  }, []);

  const LoadHost = useCallback(
    (hostName: string) => {
      setLoading(true);

      getHost(hostName)
        .then((host) => {
          setHost(host);
          LoadRack(host.rack_name);
        })
        .catch((e: APIError) => {
          console.error(e);
          toast.error(e.error);
          setHost(null);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [LoadRack],
  );

  useEffect(() => {
    LoadHost(hostName);
  }, [LoadHost, hostName]);

  if (!user) {
    return <FallbackView text="請登入以瀏覽此頁面。" />;
  }

  if (loading) {
    return <LoadingView text={`Loading host...`} />;
  }

  if (!host || !rack) {
    return <FallbackView text={`Host: ${hostName} not found.`} />;
  }

  if (!accessableService.includes(host.service_name) && user.role !== "admin") {
    return <FallbackView text={`你沒有權限瀏覽 ${host.name}`} />;
  }

  return <Wrapper rack={rack} host={host} setHost={setHost} />;
}

const HostContext = createContext<{
  state: RackDroppable;
  dispatch: React.ActionDispatch<[action: Action]>;
} | null>(null);

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

  function onMoveSuccess(rack_name: string) {
    navigate(`/rack/${rack_name}`);
  }

  return (
    <HostContext.Provider value={{ state, dispatch }}>
      <div className="mx-auto flex h-fit items-start justify-between px-20 pt-12">
        <div className="flex h-fit w-full flex-col items-start justify-start">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="host" className="size-8" />
            <div className="text-2xl font-bold">{host.name}</div>
          </div>
          <div className="flex h-fit w-md flex-col gap-4">
            <Separator />
            <DataFlexRow label="Datacenter" data={host.dc_name} />
            <DataFlexRow label="Room" data={host.room_name} />
            <DataFlexRow label="Rack" data={host.rack_name} link={`/rack/${host.rack_name}`} />
            <DataFlexRow label="機櫃內位置" data={`${host.pos}`} />
            <Separator />
            <DataFlexRow
              label="運行服務"
              data={host.service_name}
              link={`/service/${host.service_name}`}
            />
            <DataFlexRow label="機器高度" data={`${host.height}`} />
            <DataFlexRow label="分配 IP" data={host.ip ? host.ip : "無"} />
            {/* TODO: not sure is this ok? */}
            <DataFlexRow label="Status" data={host.running ? "running" : "stopped"} />
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
          </div>
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
            <p className="pr-2">移動主機至其他機櫃</p>
          </Button>
          <RackDnD context={HostContext} hostId={host.name} onMoveUpdate={onMoveUpdate} />
          <div className="text-sm text-gray-500">拖動主機來改變機櫃內位置</div>
        </div>
      </div>

      <EditHostDialog
        host={editHost}
        onUpdateSuccess={(updatedHost) => navigate(`/host/${updatedHost.name}`)}
      />
      <MoveHostDialog items={moveHost} onSuccess={onMoveSuccess} />
      <DeleteConfirmation
        ids={deleteIds}
        type="host"
        itemNames={[host.name]}
        onSuccess={() => setHost(null)}
      />
    </HostContext.Provider>
  );
}
