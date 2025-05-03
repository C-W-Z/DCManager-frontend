"use client"

import { ChevronRight } from "lucide-react"
import type { ViewLevel } from "./dc-manager"

interface BreadcrumbProps {
  currentView: ViewLevel
  dataCenter: string | null
  room: string | null
  onNavigate: (level: ViewLevel) => void
}

export function Breadcrumb({ currentView, dataCenter, room, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center text-sm">
      <button
        onClick={() => onNavigate("datacenter")}
        className={`hover:underline ${currentView === "datacenter" ? "font-medium" : "text-gray-500"}`}
      >
        All
      </button>

      {dataCenter && (
        <>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <button
            onClick={() => onNavigate("room")}
            className={`hover:underline ${currentView === "room" ? "font-medium" : "text-gray-500"}`}
          >
            {dataCenter}
          </button>
        </>
      )}

      {room && (
        <>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <button
            onClick={() => onNavigate("rack")}
            className={`hover:underline ${currentView === "rack" ? "font-medium" : ""}`}
          >
            {room}
          </button>
        </>
      )}
    </div>
  )
}
