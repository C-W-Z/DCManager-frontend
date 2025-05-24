import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/overview/data-table";
import { rackColumns } from "@/components/overview/columns/rack-columns";
import type { SimpleRoom, SimpleRack } from "@/lib/type";
import { getRoom } from "@/lib/api";
import { AddRackDialog } from "@/components/dialogs/add-rack-dialog";
import { useParams } from "react-router-dom";
import { useUser } from "@/context/use-user";
import { Summary } from "../summary";

export default function RackTable() {
  const { user } = useUser();
  const { roomName } = useParams<{ roomName: string }>();
  const [room, setRoom] = useState<SimpleRoom | null>(null);
  const [racks, setRacks] = useState<SimpleRack[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRacks = useCallback((roomName: string) => {
    setLoading(true);
    getRoom(roomName)
      .then((room) => {
        setRoom(room);
        setRacks(room.racks);
      })
      .catch((error) => {
        console.error("Error fetching room data:", error);
        setRoom(null);
        setRacks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (roomName) {
      loadRacks(roomName);
    }
  }, [roomName, loadRacks]);

  const onUpdateSuccess = (updatedRack: SimpleRack) => {
    if (updatedRack) {
      setRacks((prev) =>
        prev.map((rack) => (rack.name === updatedRack.name ? updatedRack : rack)),
      );
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedRacks = racks.filter((rack) => !idsToDelete.includes(rack.name));
    setRacks(updatedRacks);
  };

  const onMoveSuccess = (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => {
    // Handle the move success logic here
    console.log("Move success:", data);
    handleRefresh();
  };

  const handleRefresh = () => {
    if (roomName) {
      loadRacks(roomName);
    }
  };

  const columns = rackColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
    user: user || undefined,
  });

  return (
    <div>
      <Summary
        title={room?.name}
        loading={loading}
        contents={[
          { label: "房間高度", value: room?.height },
          { label: "機櫃數量", value: room?.n_racks },
          { label: "主機數量", value: room?.n_hosts },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Racks</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {room && <AddRackDialog currentRoom={room} />}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={racks}
        getRowId={(row) => row.name}
        loading={loading}
        onMoveSuccess={onMoveSuccess}
        onDeleteSuccess={onDeleteSuccess}
        type="rack"
      />
    </div>
  );
}
