"use client";

import { useState } from "react";
import { Sidebar } from "./explorer/sidebar";
import { DataCenterView } from "./explorer/data-center-view";
import { RoomView } from "./explorer/room-view";
import { RackView } from "./explorer/rack-view";
import { Breadcrumb } from "./explorer/breadcrumb";
import { mockDataCenters, mockRooms } from "@/lib/mock-data";
import { NewDCModal } from "./AddDCDialog";
import { NewRoomModal } from "./AddRoomDialog";
import { NewRackModal } from "./AddRackDialog";
import { PlusIcon } from "@/components/ui/plus-icon";

export type ViewLevel = "datacenter" | "room" | "rack";

export function DCManager() {
  const [currentView, setCurrentView] = useState<ViewLevel>("datacenter");
  const [selectedDataCenter, setSelectedDataCenter] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Modal states
  const [newDCModalOpen, setNewDCModalOpen] = useState(false);
  const [newRoomModalOpen, setNewRoomModalOpen] = useState(false);
  const [newRackModalOpen, setNewRackModalOpen] = useState(false);

  const handleDataCenterSelect = (dcId: string) => {
    setSelectedDataCenter(dcId);
    setCurrentView("room");
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setCurrentView("rack");
  };

  const handleBreadcrumbClick = (level: ViewLevel) => {
    setCurrentView(level);
    if (level === "datacenter") {
      setSelectedDataCenter(null);
      setSelectedRoom(null);
    } else if (level === "room") {
      setSelectedRoom(null);
    }
  };

  const handleAddDC = (dcData: { name: string; defalut_height: number }) => {
    console.log("Adding new DC:", dcData);
    // Here you would typically add the new DC to your data store
  };

  const handleAddRoom = (roomData: { location: string; name: string; height: string }) => {
    console.log("Adding new Room:", roomData);
    // Here you would typically add the new Room to your data store
  };

  const handleAddRack = (rackData: { location: string; name: string; height: string }) => {
    console.log("Adding new Rack:", rackData);
    // Here you would typically add the new Rack to your data store
  };

  const selectedDataCenterName = selectedDataCenter
    ? (mockDataCenters.find((dc) => dc.id === selectedDataCenter)?.name ?? null)
    : null;

  const selectedRoomName = selectedRoom
    ? (mockRooms.find((room) => room.id === selectedRoom)?.name ?? null)
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
            <button
              className="flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => setNewDCModalOpen(true)}
            >
              <PlusIcon className="mr-2 h-5 w-5" /> New DataCenter
            </button>
          )}
          {currentView === "room" && (
            <button
              className="flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => setNewRoomModalOpen(true)}
            >
              <PlusIcon className="mr-2 h-5 w-5" /> New Room
            </button>
          )}
          {currentView === "rack" && (
            <button
              className="flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => setNewRackModalOpen(true)}
            >
              <PlusIcon className="mr-2 h-5 w-5" /> New Rack
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
          {currentView === "rack" && selectedRoom && <RackView roomId={selectedRoom} />}
        </div>
      </div>

      {/* Modals */}
      <NewDCModal
        is_open={newDCModalOpen}
        onClose={() => setNewDCModalOpen(false)}
        onAdd={handleAddDC}
      />

      <NewRoomModal
        is_open={newRoomModalOpen}
        onClose={() => setNewRoomModalOpen(false)}
        onAdd={handleAddRoom}
        currentDataCenter={selectedDataCenterName || ""}
      />

      <NewRackModal
        is_open={newRackModalOpen}
        onClose={() => setNewRackModalOpen(false)}
        onAdd={handleAddRack}
        currentLocation={
          selectedDataCenterName && selectedRoomName
            ? `${selectedDataCenterName}/${selectedRoomName}`
            : ""
        }
      />
    </div>
  );
}
