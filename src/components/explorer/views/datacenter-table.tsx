"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import { SimpleDatacenter } from "@/lib/type";
import { getAllDC, deleteDC } from "@/lib/api";
import { useEffect, useState } from "react";
import { AddDatacenterDialog } from "@/components/explorer/dialogs/add-datacenter-dialog";
import type { Row } from "@tanstack/react-table";
import { Count, DataCenterSummary } from "@/components/explorer/summary/datacenter-summary";
import { EditDatacenterDialog } from "../dialogs/edit-datacenter";

interface DataCenterTableProps {
  onSelect: (dc: SimpleDatacenter) => void;
}

export default function DataCenterTable({ onSelect }: DataCenterTableProps) {
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [totalCounts, setTotalCounts] = useState<Count>({ dc: 0, room: 0, rack: 0, host: 0 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentDC, setCurrentDC] = useState<SimpleDatacenter | null>(null);

  useEffect(() => {
    getAllDC()
      .then((dcs) => {
        setDataCenters(dcs);
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
      })
      .catch((error) => {
        console.error("Error fetching all dc data:", error);
        setDataCenters([]);
      });
  }, []);

  const handleDeleteDataCenter = (id: string) => {
    // Call API to delete room
    deleteDC(id);
    // Update local state
    setDataCenters((prev) => prev.filter((dc) => dc.id !== id));
  };

  const handleDeleteMultiple = (rows: Row<SimpleDatacenter>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    // Call API to delete rooms
    idsToDelete.forEach((id) => deleteDC(id));
    // Update local state
    setDataCenters((prev) => prev.filter((dc) => !idsToDelete.includes(dc.id)));
  };

  const handleEditDataCenter = (dc: SimpleDatacenter) => {
    setCurrentDC(dc);
    setEditDialogOpen(true);
  };

  const handleUpdateDataCenter = (/*updatedDC: SimpleDatacenter | null*/) => {
    // TODO: udpate table ?
    setEditDialogOpen(false);
  };

  const columns = dataCenterColumns(onSelect);

  return (
    <div>
      <DataCenterSummary totalCount={totalCounts} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Centers</h1>
        <AddDatacenterDialog />
      </div>

      <DataTable
        columns={columns}
        data={dataCenters}
        onDeleteRows={handleDeleteMultiple}
        onDeleteRow={handleDeleteDataCenter}
        onEditRow={handleEditDataCenter}
        getRowId={(row) => row.id}
      />

      {currentDC && (
        <EditDatacenterDialog
          datacenter={currentDC}
          onUpdate={handleUpdateDataCenter}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
