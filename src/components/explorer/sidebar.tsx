import type React from "react"
import { FolderKanban, HardDrive, Settings, Server } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-60 bg-gray-50 border-r h-full flex flex-col">
      <div className="p-6 font-bold text-xl">DCManager</div>
      <nav className="flex-1">
        <SidebarItem icon={<FolderKanban className="h-5 w-5" />} label="Explorer" active />
        <SidebarItem icon={<HardDrive className="h-5 w-5" />} label="Hosts" />
        <SidebarItem icon={<Server className="h-5 w-5" />} label="Services" />
      </nav>
      <div className="p-4 border-t">
        <SidebarItem icon={<Settings className="h-5 w-5" />} label="Setting" />
      </div>
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
}

function SidebarItem({ icon, label, active }: SidebarItemProps) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-6 py-3 text-sm ${
        active ? "bg-gray-200 rounded-md mx-2" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </a>
  )
}
