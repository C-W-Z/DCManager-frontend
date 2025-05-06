"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import type { SimpleRoom, SimpleRack, SimpleDatacenter } from "@/lib/type";
import { getRoom, deleteRack } from "@/lib/api";
import { AddRackDialog } from "@/components/explorer/dialogs/add-rack-dialog";
import type { Row } from "@tanstack/react-table";

interface RackTableProps {
  datacenter: SimpleDatacenter;
  room: SimpleRoom;
  onSelect: (room: SimpleRack) => void;
}

export default function RackTable({ datacenter, room, onSelect }: RackTableProps) {
  const [filteredRacks, setFilteredRacks] = useState<SimpleRack[]>([]);

  useEffect(() => {
    getRoom(room.id)
      .then((room) => {
        setFilteredRacks(room.racks);
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        setFilteredRacks([]);
      });
  }, [room.id]);

  const handleDeleteRack = (id: string) => {
    // Call API to delete rack
    deleteRack(id);
    // Update local state
    setFilteredRacks((prev) => prev.filter((rack) => rack.id !== id));
  };

  const handleDeleteMultiple = (rows: Row<SimpleRack>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    // Call API to delete racks
    idsToDelete.forEach((id) => deleteRack(id));
    // Update local state
    setFilteredRacks((prev) => prev.filter((rack) => !idsToDelete.includes(rack.id)));
  };

  const columns = rackColumns(onSelect);

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <AddRackDialog currentDC={datacenter} currentRoom={room} />
      </div>
      <DataTable
        columns={columns}
        data={filteredRacks}
        onDeleteRow={handleDeleteRack}
        onDeleteRows={handleDeleteMultiple}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
