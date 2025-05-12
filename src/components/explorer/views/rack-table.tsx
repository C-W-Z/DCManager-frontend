import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/explorer/data-table";
import { rackColumns } from "@/components/explorer/columns/rack-columns";
import type { SimpleRoom, SimpleRack, SimpleDatacenter } from "@/lib/type";
import { getRoom } from "@/lib/api";
import { AddRackDialog } from "@/components/explorer/dialogs/add-rack-dialog";
import { RackSummary } from "../summary/rack-summary";

interface RackTableProps {
  datacenter: SimpleDatacenter;
  room: SimpleRoom;
}

export default function RackTable({ datacenter, room }: RackTableProps) {
  const [racks, setRacks] = useState<SimpleRack[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRacks = useCallback((room_id: string) => {
      setLoading(true);
      getRoom(room_id)
        .then((room) => {
          setRacks(room.racks);
        })
        .catch((error) => {
          console.error("Error fetching racks data from room:", error);
          setRacks([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);

    useEffect(() => {
    loadRacks(room.id)
    }, [loadRacks, room.id]);

  const onUpdateSuccess = (updatedRack: SimpleRack) => {
    if (updatedRack) {
      // 如果更新成功，更新本地状态中的数据中心
      setRacks((prev) =>
        prev.map((rack) => (rack.id === updatedRack.id ? updatedRack : rack)),
      );
      // 重新加载数据以确保一致性
      // loadRacks();
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedRooms = racks.filter((rack) => !idsToDelete.includes(rack.id));
    setRacks(updatedRooms);
    // 重新加载数据
    // loadRacks();
  };

  const handleRefresh = () => {
    loadRacks(datacenter.id);
  };

  const columns = rackColumns(onUpdateSuccess, onDeleteSuccess);

  return (
    <div>
      <RackSummary room={room} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Racks</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <AddRackDialog currentDC={datacenter} currentRoom={room} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={racks}
        getRowId={(row) => row.id}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        type="rack"
      />
    </div>
  );
}
