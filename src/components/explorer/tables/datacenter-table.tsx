"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import type { SimpleDatacenter } from "@/lib/type";
import { getAllDC } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AddDatacenterDialog } from "@/components/explorer/dialogs/add-datacenter-dialog";
import {
  type Count,
  DataCenterSummary,
} from "@/components/explorer/summary/datacenter-summary";
import { useOutletContext } from "react-router-dom";

interface OutletContext {
  onSelect: (path: string) => void;
}

export default function DataCenterTable() {
  const { onSelect } = useOutletContext<OutletContext>();
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [totalCounts, setTotalCounts] = useState<Count>({ dc: 0, room: 0, rack: 0, host: 0 });
  const [loading, setLoading] = useState(false);

  const calculateTotalCounts = useCallback((dcs: SimpleDatacenter[]) => {
    let n_rooms = 0;
    let n_racks = 0;
    let n_hosts = 0;
    dcs.forEach((dc: SimpleDatacenter) => {
      n_rooms += dc.n_rooms;
      n_racks += dc.n_racks;
      n_hosts += dc.n_hosts;
    });
    setTotalCounts({
      dc: dcs.length,
      room: n_rooms,
      rack: n_racks,
      host: n_hosts,
    });
  }, []);

  const loadDataCenters = useCallback(() => {
    setLoading(true);
    getAllDC()
      .then((dcs) => {
        setDataCenters(dcs);
        calculateTotalCounts(dcs);
      })
      .catch((error) => {
        console.error("Error fetching all dc data:", error);
        setDataCenters([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [calculateTotalCounts]);

  useEffect(() => {
    loadDataCenters();
  }, [loadDataCenters]);

  const onUpdateSuccess = (updatedDC: SimpleDatacenter) => {
    if (updatedDC) {
      setDataCenters((prev) => prev.map((dc) => (dc.id === updatedDC.id ? updatedDC : dc)));
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedDCs = dataCenters.filter((dc) => !idsToDelete.includes(dc.id));
    setDataCenters(updatedDCs);
    calculateTotalCounts(updatedDCs);
  };

  const handleRefresh = () => {
    loadDataCenters();
  };

  const columns = dataCenterColumns({
    onSelect: (dc) => onSelect(`/explorer/dc/${dc.id}`),
    onUpdateSuccess,
    onDeleteSuccess,
  });

  return (
    <div>
      <DataCenterSummary totalCount={totalCounts} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Centers</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <AddDatacenterDialog />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={dataCenters}
        getRowId={(row) => row.id}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        type="datacenter"
      />
    </div>
  );
}
