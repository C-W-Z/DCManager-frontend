"use client";

import { DataTable } from "@/components/explorer/data-table";
import { hostColumns } from "@/components/explorer/columns/host-columns";
import type { SimpleHost } from "@/lib/type";
import { getAllHost } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";

export default function HostTable() {
  const [host, setHost] = useState<SimpleHost[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDataCenters = useCallback(() => {
    setLoading(true);
    getAllHost()
      .then((hosts) => {
        setHost(hosts);
      })
      .catch((error) => {
        console.error("Error fetching all dc data:", error);
        setHost([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadDataCenters();
  }, [loadDataCenters]);

  const onUpdateSuccess = (updatedDC: SimpleHost) => {
    if (updatedDC) {
      setHost((prev) => prev.map((dc) => (dc.id === updatedDC.id ? updatedDC : dc)));
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedDCs = host.filter((dc) => !idsToDelete.includes(dc.id));
    setHost(updatedDCs);
  };

  const onMoveSuccess = (data: {
    dc_id: string | null;
    room_id: string | null;
    rack_id: string | null;
  }) => {
    // Handle the move success logic here
    console.log("Move success:", data);
    handleRefresh();
  };

  const handleRefresh = () => {
    loadDataCenters();
  };

  const columns = hostColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hosts</h1>
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
        getRowId={(row) => row.id}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        type="host"
      />
    </div>
  );
}
