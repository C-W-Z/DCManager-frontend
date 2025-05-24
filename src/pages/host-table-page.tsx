"use client";

import { DataTable } from "@/components/overview/data-table";
import { hostColumns } from "@/components/overview/columns/host-columns";
import type { Host } from "@/lib/type";
import { getAllHost } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/use-user";
import Icon from "@/components/icon";

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
      .catch((error) => {
        console.error("Error loading data:", error);
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
    if (updatedDC) {
      setHost((prev) => prev.map((dc) => (dc.name === updatedDC.name ? updatedDC : dc)));
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedDCs = host.filter((dc) => !idsToDelete.includes(dc.name));
    setHost(updatedDCs);
  };

  const onMoveSuccess = (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => {
    // Handle the move success logic here
    console.log("Move success:", data);
    handleRefresh();
  };

  const handleRefresh = () => {
    loadHosts();
  };

  const columns = hostColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
  });

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="mb-4 flex flex-row items-center gap-2">
          <Icon id="host" className="size-8" />
          <div className="text-2xl font-bold">Hosts</div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={host}
        getRowId={(row) => row.name}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        onMoveSuccess={onMoveSuccess}
        type="host"
      />
    </div>
  );
}
