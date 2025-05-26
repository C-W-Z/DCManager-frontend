"use client";

import { DataTable } from "@/components/overview/data-table";
import { hostColumns } from "@/components/overview/columns/host-columns";
import type { APIError, Host } from "@/lib/type";
import { getAllHost } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/use-user";
import Icon from "@/components/icon";
import { RefreshButton } from "@/components/refresh-button";
import { toast } from "sonner";
import { FallbackView } from "@/components/fallback-view";

export function HostTablePage() {
  const { user, accessableService } = useUser();
  const [host, setHost] = useState<Host[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHosts = useCallback(() => {
    setLoading(true);
    getAllHost()
      .then((hosts) => {
        if (user?.role === "normal") {
          const updatedHost = hosts.filter((h) =>
            accessableService.some((s) => s == h.service_name),
          );
          setHost(updatedHost);
        } else {
          setHost(hosts);
        }
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setHost([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessableService, user?.role]);

  useEffect(() => {
    loadHosts();
  }, [loadHosts]);

  const onUpdateSuccess = (updatedDC: Host) => {
    console.log("Update success:", updatedDC);
    loadHosts();
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedDCs = host.filter((dc) => !idsToDelete.includes(dc.name));
    setHost(updatedDCs);
  };

  const onMoveSuccess = (rack_name: string) => {
    // Handle the move success logic here
    console.log(`Move host to ${rack_name} success`);
    loadHosts();
  };

  const columns = hostColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
  });

  if (!user) {
    return <FallbackView text="請登入以瀏覽此頁面。" />;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-12">
      <div className="flex items-start justify-between">
        <div className="mb-4 flex flex-row items-center gap-2">
          <Icon id="host" className="size-8" />
          <div className="text-2xl font-bold">Hosts</div>
        </div>

        <RefreshButton isLoading={loading} onClick={() => loadHosts()} />
      </div>

      <DataTable
        columns={columns}
        data={host}
        getRowId={(row) => row.name}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        type="host"
      />
    </div>
  );
}
