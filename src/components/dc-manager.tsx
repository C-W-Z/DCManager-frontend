"use client";

import { useState } from "react";
import { Sidebar } from "./explorer/sidebar";
import { DataCenterView } from "./explorer/data-center-view";
import { RoomView } from "./explorer/room-view";
import { RackView } from "./explorer/rack-view";
import { Breadcrumb } from "./explorer/breadcrumb";
import { mockDataCenters, mockRooms } from "@/lib/mock-data";

export type ViewLevel = "datacenter" | "room" | "rack";

export function DCManager() {
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter");
  const [selectedDataCenter, setSelectedDataCenter] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleDataCenterSelect = (dcId: string) => {
    setSelectedDataCenter(dcId);
    setCurrentView("room");
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setCurrentView("rack");
  };

  // const handleRackSelect = (roomId: string) => {

  // };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    setCurrentView(level);
    if (level === "datacenter") {
      setSelectedDataCenter(null);
      setSelectedRoom(null);
    } else if (level === "room") {
      setSelectedRoom(null);
    }
  };

  const selectedDataCenterName = selectedDataCenter
    ? mockDataCenters.find((dc) => dc.id === selectedDataCenter)?.name ?? null
    : null;

  const selectedRoomName = selectedRoom
    ? mockRooms.find((room) => room.id === selectedRoom)?.name ?? null
    : null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <Breadcrumb
            currentView={currentView}
            dataCenter={selectedDataCenterName}
            room={selectedRoomName}
            onNavigate={handleBreadcrumbClick}
          />
          {currentView === "datacenter" && (
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              New DataCenter
            </button>
          )}
          {currentView === "room" && (
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              New Room
            </button>
          )}
          {currentView === "rack" && (
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              New Rack
            </button>
          )}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {currentView === "datacenter" && (
            <DataCenterView onSelect={handleDataCenterSelect} />
          )}
          {currentView === "room" && selectedDataCenter && (
            <RoomView dataCenterId={selectedDataCenter} onSelect={handleRoomSelect} />
          )}
          {currentView === "rack" && selectedRoom && (
            <RackView roomId={selectedRoom}/>
          )}
        </div>
      </div>
    </div>
  );
}
