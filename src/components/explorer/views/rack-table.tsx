"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import { SimpleRoom, SimpleRack, SimpleDatacenter } from "@/lib/type";
import { getRoom } from "@/lib/api";
import { AddRackDialog } from "@/components/explorer/dialogs/add-rack-dialog";

interface RackTableProps {
  datacenter: SimpleDatacenter;
  room: SimpleRoom;
  onSelect: (room: SimpleRack) => void;
}

export default function RackTable({ datacenter, room, onSelect }: RackTableProps) {
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
      <div className="mb-4 flex items-center justify-end">
        <AddRackDialog currentDC={datacenter} currentRoom={room} />
      </div>
      <DataTable columns={columns} data={filteredRacks} />
    </div>
  );
}
