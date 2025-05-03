"use client"

import { DataTable } from "./data-table"
import { roomColumns } from "./columns/room-columns"
import { mockRooms } from "@/lib/mock-data"

interface RoomViewProps {
  dataCenterId: string
  onSelect: (id: string) => void
}

export function RoomView({ dataCenterId, onSelect }: RoomViewProps) {
  const columns = roomColumns(onSelect)
  const filteredRooms = mockRooms.filter((room) => room.dataCenterId === dataCenterId)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Rooms</h1>
      <DataTable columns={columns} data={filteredRooms} />
    </div>
  )
}
