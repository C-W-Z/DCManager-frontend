"use client";

import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC } from "@/lib/api";
import { useEffect, useState } from "react";
import { AddRoomDialog } from "@/components/explorer/dialogs/add-room-dialog";

interface RoomTableProps {
  datacenter: SimpleDatacenter;
  onSelect: (room: SimpleRoom) => void;
}

export function RoomTable({ datacenter, onSelect }: RoomTableProps) {
  const columns = roomColumns(onSelect);

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

  return (
    <div>
      <AddRoomDialog currentDC={datacenter} />
      <DataTable columns={columns} data={filteredRooms} />
    </div>
  );
}
