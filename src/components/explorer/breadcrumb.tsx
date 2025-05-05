"use client";

import { ChevronRight } from "lucide-react";
import type { ViewLevel } from "../../pages/explorer";

interface BreadcrumbProps {
  currentView: ViewLevel;
  dcName: string | null;
  roomName: string | null;
  onNavigate: (level: ViewLevel) => void;
}

export function Breadcrumb({ currentView, dcName, roomName, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center text-2xl">
      <button
        onClick={() => onNavigate("datacenter")}
        className={`hover:underline ${currentView === "datacenter" ? "font-bold" : "text-gray-500"}`}
      >
        All
      </button>

      {dcName && (
        <>
          <ChevronRight className="mx-1 h-4 w-6 text-gray-400" />
          <button
            onClick={() => onNavigate("room")}
            className={`hover:underline ${currentView === "room" ? "font-bold" : "text-gray-500"}`}
          >
            {dcName}
          </button>
        </>
      )}

      {roomName && (
        <>
          <ChevronRight className="mx-1 h-4 w-6 text-gray-400" />
          <button
            onClick={() => onNavigate("rack")}
            className={`hover:underline ${currentView === "rack" ? "font-bold" : ""}`}
          >
            {roomName}
          </button>
        </>
      )}
    </div>
  );
}
