"use client"

import type React from "react"

import { useState } from "react"
import { FolderKanban, HardDrive, Settings, Server, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex h-full flex-col bg-gray-50 border-r transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("p-6 font-bold text-xl", collapsed && "text-center p-4")}>
        {collapsed ? "DC" : "DCManager"}
      </div>
      <nav className="flex-1">
        <SidebarItem icon={<FolderKanban className="h-5 w-5" />} label="Explorer" active collapsed={collapsed} />
        <SidebarItem icon={<HardDrive className="h-5 w-5" />} label="Hosts" collapsed={collapsed} />
        <SidebarItem icon={<Server className="h-5 w-5" />} label="Services" collapsed={collapsed} />
      </nav>
      <div className="py-4 border-t">
        <SidebarItem icon={<Settings className="h-5 w-5" />} label="Setting" collapsed={collapsed} />
      </div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm hover:bg-gray-100"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  collapsed?: boolean
}

function SidebarItem({ icon, label, active, collapsed }: SidebarItemProps) {
  return (
    <a
      href="#"
      className={cn(
        "flex items-center gap-3 px-6 py-3 text-sm transition-colors my-2 ml-2 mr-4 rounded-full",
        active ? "bg-gray-300" : "text-gray-700 hover:bg-gray-200",
        collapsed && "justify-center px-0",
      )}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </a>
  )
}
