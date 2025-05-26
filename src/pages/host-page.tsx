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
import { HostToggleButton } from "@/components/host-toggle-button";

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
      })
      .finally(() => {
        setLoading(false);
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

  if (
    host.service_name &&
    host.service_name.length > 0 &&
    !accessableService.includes(host.service_name) &&
    user.role !== "admin"
  ) {
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
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const navigate = useNavigate();

  function onMoveUpdate(newPos: number) {
    setHost({ ...host, pos: newPos });
  }

  function onMoveSuccess(rack_name: string) {
    navigate(`/rack/${rack_name}`);
  }

  return (
    <HostContext.Provider value={{ state, dispatch }}>
      <div className="mx-auto flex h-fit flex-col items-center gap-10 px-20 pt-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex h-fit w-md flex-col items-start justify-start">
          <div className="mb-4 flex flex-row items-center gap-2">
            <Icon id="host" className="size-8" />
            <div className="text-2xl font-bold">{host.name}</div>
          </div>
          <div className="flex h-fit w-full flex-col gap-4">
            <Separator />
            <DataFlexRow label="Datacenter" data={host.dc_name} />
            <DataFlexRow label="Room" data={host.room_name} />
            <DataFlexRow label="Rack" data={host.rack_name} link={`/rack/${host.rack_name}`} />
            <DataFlexRow label="機櫃內位置" data={`${host.pos}`} />
            <Separator />
            <DataFlexRow
              label="運行服務"
              data={
                host.service_name && host.service_name.length > 0 ? host.service_name : "無"
              }
              link={
                host.service_name && host.service_name.length > 0
                  ? `/service/${host.service_name}`
                  : undefined
              }
            />
            <DataFlexRow label="機器高度" data={`${host.height}`} />
            <DataFlexRow label="分配 IP" data={host.ip ? host.ip : "無"} />
            <DataFlexRow label="Status" data={host.running ? "running" : "stopped"} />
            <div className="mt-4 flex flex-row items-center justify-center gap-8">
              <HostToggleButton
                host={host}
                onUpdateSuccess={(updatedHost) => {
                  // navigate(`/host/${updatedHost.name}`);
                  // 強制重載
                  window.location.href = `/host/${updatedHost.name}`;
                }}
                className="w-24"
              />
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
        <div className="mb-10 flex flex-col items-center justify-start gap-2 lg:mb-0">
          <Button
            onClick={() => setMoveDialogOpen(true)}
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
        onUpdateSuccess={(updatedHost) => {
          // navigate(`/host/${updatedHost.name}`);
          // 強制重載
          window.location.href = `/host/${updatedHost.name}`;
        }}
      />
      <MoveHostDialog
        host={host}
        isOpen={moveDialogOpen}
        setIsOpen={setMoveDialogOpen}
        onSuccess={onMoveSuccess}
      />
      <DeleteConfirmation
        ids={deleteIds}
        type="host"
        itemNames={[host.name]}
        onSuccess={() => navigate(`/rack/${host.rack_name}`)}
      />
    </HostContext.Provider>
  );
}
