"use client"

import { DataTable } from "./data-table"
import { rackColumns } from "./columns/rack-columns"
import { mockRacks } from "@/lib/mock-data"

interface RackViewProps {
  roomId: string
}

export function RackView({ roomId }: RackViewProps) {
  const filteredRacks = mockRacks.filter((rack) => rack.room_id === roomId)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Racks</h1>
      <DataTable columns={rackColumns} data={filteredRacks} />
    </div>
  )
}
