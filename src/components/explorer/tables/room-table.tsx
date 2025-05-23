"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC } from "@/lib/api";
import { AddRoomDialog } from "../dialogs/add-room-dialog";
import { RoomSummary } from "../summary/room-summary";
import { useParams, useOutletContext } from "react-router-dom";
import { useUser } from "@/context/use-user";

interface OutletContext {
  datacenter: SimpleDatacenter | null;
}

export default function RoomTable() {
  const { user } = useUser();
  const { datacenter } = useOutletContext<OutletContext>();
  const { dcId } = useParams<{ dcId: string }>();
  const [rooms, setRooms] = useState<SimpleRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRooms = useCallback((dc_id: string) => {
    setLoading(true);
    getDC(dc_id)
      .then((dc) => {
        setRooms(dc.rooms);
      })
      .catch((error) => {
        console.error("Error fetching rooms data from datacenter:", error);
        setRooms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (dcId) {
      loadRooms(dcId);
    }
  }, [dcId, loadRooms]);

  const onUpdateSuccess = (updatedRoom: SimpleRoom) => {
    if (updatedRoom) {
      setRooms((prev) =>
        prev.map((room) => (room.name === updatedRoom.name ? updatedRoom : room)),
      );
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedRooms = rooms.filter((room) => !idsToDelete.includes(room.name));
    setRooms(updatedRooms);
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
    if (dcId) {
      loadRooms(dcId);
    }
  };

  const columns = roomColumns({
    onUpdateSuccess,
    onDeleteSuccess,
    onMoveSuccess,
    user: user || undefined,
  });

  return (
    <div>
      {datacenter && <RoomSummary datacenter={datacenter} />}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          {user?.role === "admin" && datacenter && <AddRoomDialog currentDC={datacenter} />}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rooms}
        getRowId={(row) => row.name}
        loading={loading}
        onMoveSuccess={onMoveSuccess}
        onDeleteSuccess={onDeleteSuccess}
        type="room"
      />
    </div>
  );
}
