"use client"

import { DataTable } from "./data-table"
import { dataCenterColumns } from "./columns/data-center-columns"
import { mockDataCenters } from "@/lib/mock-data"

interface DataCenterViewProps {
  onSelect: (id: string) => void
}

export function DataCenterView({ onSelect }: DataCenterViewProps) {
  const columns = dataCenterColumns(onSelect)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Centers</h1>
      <DataTable columns={columns} data={mockDataCenters} />
    </div>
  )
}
