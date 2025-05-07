"use client";

import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC, deleteRoom } from "@/lib/api";
import { useEffect, useState } from "react";
import { AddRoomDialog } from "../dialogs/add-room-dialog";
import type { Row } from "@tanstack/react-table";
import { RoomSummary } from "../summary/room-summary";

interface RoomTableProps {
  datacenter: SimpleDatacenter;
  onSelect: (room: SimpleRoom) => void;
}

export default function RoomTable({ datacenter, onSelect }: RoomTableProps) {
  const [filteredRooms, setFilteredRooms] = useState<SimpleRoom[]>([]);

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
        getRowId={(row) => row.id}
      />
    </div>
  );
}
