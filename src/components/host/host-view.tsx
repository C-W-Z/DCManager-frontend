import { useEffect, useState } from "react";
import { getHost } from "@/lib/api";
import { Host } from "@/lib/type";
import { Skeleton } from "@/components/ui/skeleton";
import { height2Px } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import HostInfoCard from "./host-infocard";

export default function HostView() {
  const hostId = useParams().hostId as string;

  const [host, setHost] = useState<Host | null>(null);

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
        <div className="mx-auto flex max-w-5xl items-start justify-between p-4">
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
          <HostInfoCard host={host} />
        </div>
      ) : (
        <div className="flex w-full items-center justify-center">
          host with id {hostId} not found
          <Skeleton className="h-96 w-96" />
        </div>
      )}
    </>
  );
}
