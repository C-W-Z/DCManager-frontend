"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import { SimpleDatacenter, SimpleRoom, SimpleRack } from "@/lib/type";
import { getRoom } from "@/lib/api";
import { AddRackDialog } from "../dialogs/add-rack-dialog";

interface RackTableProps {
  datacenter: SimpleDatacenter;
  room: SimpleRoom;
  onSelect: (rack: SimpleRack) => void;
}

export function RackTable({ datacenter, room, onSelect }: RackTableProps) {
  const columns = rackColumns(onSelect);

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

  return (
    <div>
      <AddRackDialog currentDC={datacenter} currentRoom={room} />
      <DataTable columns={columns} data={filteredRacks} />
    </div>
  );
}
