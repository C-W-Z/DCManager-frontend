"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import { SimpleDatacenter } from "@/lib/type";
import { getAllDC } from "@/lib/api";
import { useEffect, useState } from "react";
import { AddDatacenterDialog } from "@/components/explorer/dialogs/add-datacenter-dialog";
import type { Row } from "@tanstack/react-table";

interface DataCenterTableProps {
  onSelect: (dc: SimpleDatacenter) => void;
}

export default function DataCenterTable({ onSelect }: DataCenterTableProps) {
  const handleDeleteDataCenter = (id: string) => {
    setDataCenters((prev) => prev.filter((dc) => dc.id !== id));
  };

  const handleDeleteMultiple = (rows: Row<SimpleDatacenter>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    setDataCenters((prev) => prev.filter((dc) => !idsToDelete.includes(dc.id)));
  };

  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);

  useEffect(() => {
    getAllDC()
      .then((dcs) => {
        setDataCenters(dcs);
      })
      .catch((error) => {
        console.error("Error fetching all dc data:", error);
        setDataCenters([]);
      });
  }, []);

  const columns = dataCenterColumns(onSelect);

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <AddDatacenterDialog />
      </div>
      <h1 className="mb-6 text-2xl font-bold">Data Centers</h1>
      <DataTable
        columns={columns}
        data={dataCenters}
        onDeleteRows={handleDeleteMultiple}
        onDeleteRow={handleDeleteDataCenter}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
