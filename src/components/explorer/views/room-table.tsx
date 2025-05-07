"use client";

import { useState, useEffect } from "react";
import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC, deleteRoom } from "@/lib/api";
import { AddRoomDialog } from "../dialogs/add-room-dialog";
import { EditRoomDialog } from "../dialogs/edit-room";
import type { Row } from "@tanstack/react-table";
import { RoomSummary } from "../summary/room-summary";

interface RoomTableProps {
  datacenter: SimpleDatacenter;
  onSelect: (room: SimpleRoom) => void;
}

export default function RoomTable({ datacenter, onSelect }: RoomTableProps) {
  const [filteredRooms, setFilteredRooms] = useState<SimpleRoom[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<SimpleRoom | null>(null);

  useEffect(() => {
    getDC(datacenter.id)
      .then((dc) => {
        setFilteredRooms(dc.rooms);
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        setFilteredRooms([]);
      });
  }, [datacenter]);

  const handleDeleteRoom = (id: string) => {
    // Call API to delete room
    deleteRoom(id);
    // Update local state
    setFilteredRooms((prev) => prev.filter((room) => room.id !== id));
  };

  const handleDeleteMultiple = (rows: Row<SimpleRoom>[]) => {
    const idsToDelete = rows.map((row) => row.original.id);
    // Call API to delete rooms
    idsToDelete.forEach((id) => deleteRoom(id));
    // Update local state
    setFilteredRooms((prev) => prev.filter((room) => !idsToDelete.includes(room.id)));
  };

  const handleEditRoom = (room: SimpleRoom) => {
    setCurrentRoom(room);
    setEditDialogOpen(true);
  };

  const handleUpdateRoom = (/*updatedRoom: SimpleRoom | null*/) => {
    // TODO: udpate table ?
    setEditDialogOpen(false);
  };

  const columns = roomColumns(onSelect);

  return (
    <div>
      <RoomSummary datacenter={datacenter} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <AddRoomDialog currentDC={datacenter} />
      </div>

      <DataTable
        columns={columns}
        data={filteredRooms}
        onDeleteRow={handleDeleteRoom}
        onDeleteRows={handleDeleteMultiple}
        onEditRow={handleEditRoom}
        getRowId={(row) => row.id}
      />

      {currentRoom && (
        <EditRoomDialog
          room={currentRoom}
          onUpdate={handleUpdateRoom}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
