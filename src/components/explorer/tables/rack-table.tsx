"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import { SimpleRoom, SimpleRack } from "@/lib/type";
import { getRoom } from "@/lib/api";

interface RackTableProps {
  room: SimpleRoom;
  onSelect: (rack: SimpleRack) => void;
}

export function RackTable({ room, onSelect }: RackTableProps) {
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

  return <DataTable columns={columns} data={filteredRacks} />;
}
