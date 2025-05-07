"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import type { SimpleRoom, SimpleRack, SimpleDatacenter } from "@/lib/type";
import { getRoom, deleteRack } from "@/lib/api";
import { AddRackDialog } from "@/components/explorer/dialogs/add-rack-dialog";
import { EditRackDialog } from "@/components/explorer/dialogs/edit-rack";
import type { Row } from "@tanstack/react-table";
import { RackSummary } from "../summary/rack-summary";

interface RackTableProps {
  datacenter: SimpleDatacenter;
  room: SimpleRoom;
  onSelect: (room: SimpleRack) => void;
}

export default function RackTable({ datacenter, room, onSelect }: RackTableProps) {
  const [filteredRacks, setFilteredRacks] = useState<SimpleRack[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRack, setCurrentRack] = useState<SimpleRack | null>(null);

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

  const handleEditRack = (rack: SimpleRack) => {
    setCurrentRack(rack);
    setEditDialogOpen(true);
  };

  const handleUpdateRack = (/*updatedRack: SimpleRack | null*/) => {
    // TODO
    setEditDialogOpen(false);
  };

  const columns = rackColumns(onSelect);

  return (
    <div>
      <RackSummary room={room} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Racks</h1>
        <AddRackDialog currentDC={datacenter} currentRoom={room} />
      </div>

      <DataTable
        columns={columns}
        data={filteredRacks}
        onDeleteRow={handleDeleteRack}
        onDeleteRows={handleDeleteMultiple}
        onEditRow={handleEditRack}
        getRowId={(row) => row.id}
      />

      {currentRack && (
        <EditRackDialog
          rack={currentRack}
          onUpdate={handleUpdateRack}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
