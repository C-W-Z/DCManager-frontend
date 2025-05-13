"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "../data-table";
import { roomColumns } from "../columns/room-columns";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC } from "@/lib/api";
import { AddRoomDialog } from "../dialogs/add-room-dialog";
import { RoomSummary } from "../summary/room-summary";

interface RoomTableProps {
  datacenter: SimpleDatacenter;
  onSelect: (room: SimpleRoom) => void;
}

export default function RoomTable({ datacenter, onSelect }: RoomTableProps) {
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
    loadRooms(datacenter.id);
  }, [loadRooms, datacenter.id]);

  const onUpdateSuccess = (updatedRoom: SimpleRoom) => {
    if (updatedRoom) {
      // 如果更新成功，更新本地状态中的数据中心
      setRooms((prev) =>
        prev.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
      );
      // 重新加载数据以确保一致性
      // loadRooms();
    }
  };

  const onDeleteSuccess = (idsToDelete: string[]) => {
    const updatedRooms = rooms.filter((room) => !idsToDelete.includes(room.id));
    setRooms(updatedRooms);
    // 重新加载数据
    // loadRooms();
  };

  // 添加手动刷新功能
  const handleRefresh = () => {
    loadRooms(datacenter.id);
  };

  const columns = roomColumns(onSelect, onUpdateSuccess, onDeleteSuccess);

  return (
    <div>
      <RoomSummary datacenter={datacenter} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <AddRoomDialog currentDC={datacenter} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rooms}
        getRowId={(row) => row.id}
        loading={loading}
        onDeleteSuccess={onDeleteSuccess}
        type="room"
      />
    </div>
  );
}
