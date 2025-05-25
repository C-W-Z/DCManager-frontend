"use client";

import { DataTable } from "@/components/overview/data-table";
import { dataCenterColumns } from "@/components/overview/columns/datacenter-columns";
import type { APIError, SimpleDatacenter } from "@/lib/type";
import { getAllDC } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { AddDatacenterDialog } from "@/components/dialogs/add-datacenter-dialog";
import { useUser } from "@/context/use-user";
import { Summary } from "@/components/overview/summary";
import { RefreshButton } from "@/components/refresh-button";
import { toast } from "sonner";

type dcSummary = {
  dc: number;
  room: number;
  rack: number;
  host: number;
};

export default function DataCenterTable() {
  const { user } = useUser();
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [summaryContent, setsummaryContent] = useState<dcSummary>({
    dc: 0,
    room: 0,
    rack: 0,
    host: 0,
  });
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
    setsummaryContent({
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
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
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
    console.log("Update Success", updatedDC);
    loadDataCenters();
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedDCs = dataCenters.filter((dc) => !idsToDelete.includes(dc.name));
    setDataCenters(updatedDCs);
    calculateTotalCounts(updatedDCs);
  };

  const columns = dataCenterColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    user: user || undefined,
  });

  return (
    <div>
      <Summary
        title="Overview"
        loading={loading}
        contents={[
          { label: "資料中心數量", value: summaryContent.dc },
          { label: "房間總數", value: summaryContent.room },
          { label: "機櫃總數", value: summaryContent.rack },
          { label: "主機總數", value: summaryContent.host },
        ]}
      />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Centers</h1>
        <div className="flex items-center gap-4">
          <RefreshButton isLoading={loading} onClick={() => loadDataCenters()} />
          {user?.role === "admin" && (
            <AddDatacenterDialog onSuccess={() => loadDataCenters()} />
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={dataCenters}
        getRowId={(row) => row.name}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        type="datacenter"
      />
    </div>
  );
}
