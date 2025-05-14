"use client";

import { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "./breadcrumb";
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getDC, getRoom } from "@/lib/api";

export type ViewLevel = "datacenter-table" | "room-table" | "rack-table";

export default function Explorer() {
  const navigate = useNavigate();
  const { dcId, roomId } = useParams<{ dcId?: string; roomId?: string }>();
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter-table");
  const [selectedDataCenter, setSelectedDataCenter] = useState<SimpleDatacenter | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SimpleRoom | null>(null);

  // 根據 URL 參數加載數據
  useEffect(() => {
    if (roomId) {
      // 加載 RackTable 所需的數據
      setCurrentView("rack-table");
      getRoom(roomId)
        .then((room) => {
          setSelectedRoom(room);
          getDC(room.dc_id).then((dc) => setSelectedDataCenter(dc));
        })
        .catch((error) => {
          console.error("Error loading room:", error);
          navigate("/explorer"); // 錯誤時導航回 All
        });
    } else if (dcId) {
      // 加載 RoomTable 所需的數據
      setCurrentView("room-table");
      getDC(dcId)
        .then((dc) => {
          setSelectedDataCenter(dc);
          setSelectedRoom(null);
        })
        .catch((error) => {
          console.error("Error loading datacenter:", error);
          navigate("/explorer");
        });
    } else {
      // 加載 DataCenterTable
      setCurrentView("datacenter-table");
      setSelectedDataCenter(null);
      setSelectedRoom(null);
    }
  }, [dcId, roomId, navigate]);

  const handleBreadcrumbClick = (level: ViewLevel) => {
    if (level === "datacenter-table") {
      navigate("/explorer");
    } else if (level === "room-table" && selectedDataCenter) {
      navigate(`/explorer/dc/${selectedDataCenter.id}`);
    } else if (level === "rack-table" && selectedDataCenter && selectedRoom) {
      navigate(`/explorer/room/${selectedRoom.id}`);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mt-5 ml-8 flex items-center justify-between p-4">
        <Breadcrumb
          currentView={currentView}
          dcName={selectedDataCenter ? selectedDataCenter.name : null}
          roomName={selectedRoom ? selectedRoom.name : null}
          onNavigate={handleBreadcrumbClick}
        />
      </div>

      <div className="flex-1 px-12">
        <Outlet
          context={{ datacenter: selectedDataCenter, room: selectedRoom, onSelect: navigate }}
        />
      </div>
    </div>
  );
}
