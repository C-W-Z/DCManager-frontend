import { useEffect, useState } from "react";
import { getHost } from "@/lib/api";
import { Host } from "@/lib/type";
import { InfoCard, Separator, CardColumn } from "@/components/infocard";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { height2Px } from "@/lib/constant";
import { DeleteConfirmation } from "../explorer/dialogs/delete-confirm";
import { EditHostDialog } from "./edit-host";

export default function HostView() {
  const hostId = useParams().hostId as string;
  const [host, setHost] = useState<Host | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [editHost, setEditHost] = useState<Host | null>(null);

  useEffect(() => {
    getHost(hostId)
      .then((host) => {
        setHost(host);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setHost(null);
      });
  }, [hostId]);

  return (
    <>
      {host ? (
        <div className="mx-auto flex h-full items-start justify-between px-20 pt-12">
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
                  {/* This will be replace by Dialogs*/}
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
                  <Button variant="outline">Move Host</Button>
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
        </div>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-xl font-bold">Host ID: {hostId} not found :(</div>
        </div>
      )}
    </>
  );
}

const HostComponent = ({ host }: { host: Host }) => {
  return (
    <div
      className={
        "flex w-[400px] flex-row items-center justify-between rounded-lg border-3 border-gray-950 bg-white px-4 py-2 hover:bg-blue-100"
      }
      style={{
        height: height2Px(host.height),
      }}
    >
      <div className="text-sm font-bold">{host.name}</div>
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          host.status === "running"
            ? "bg-green-600"
            : host.status === "idle"
              ? "bg-gray-400"
              : "bg-red-400",
        )}
      ></div>
    </div>
  );
};
