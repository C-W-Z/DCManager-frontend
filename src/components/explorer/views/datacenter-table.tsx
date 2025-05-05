"use client";

import { DataTable } from "@/components/explorer/data-table";
import { dataCenterColumns } from "@/components/explorer/columns/datacenter-columns";
import { SimpleDatacenter } from "@/lib/type";
import { getAllDC } from "@/lib/api";
import { useEffect, useState } from "react";
import { AddDatacenterDialog } from "@/components/explorer/dialogs/add-datacenter-dialog";

interface DataCenterTableProps {
  onSelect: (dc: SimpleDatacenter) => void;
}

export default function DataCenterTable({ onSelect }: DataCenterTableProps) {
  const columns = dataCenterColumns(onSelect);

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <AddDatacenterDialog />
      </div>
      <DataTable columns={columns} data={dataCenters} />
    </div>
  );
}
