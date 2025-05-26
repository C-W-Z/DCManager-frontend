import { Button } from "@/components/ui/button";
import { Host, APIError } from "@/lib/type";
import { modifyHost } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { DropdownMenuItem } from "./ui/dropdown-menu";

interface HostToggleButtonProps {
  host: Host;
  onUpdateSuccess?: (updatedHost: Host) => void;
  className?: string;
  dropdown?: boolean;
}

export function HostToggleButton({
  host,
  onUpdateSuccess,
  className,
  dropdown,
}: HostToggleButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const newRunningState = !host.running;
    modifyHost(host.name, {
      name: host.name,
      running: newRunningState,
    })
      .then(() => {
        const updatedHost: Host = { ...host, running: newRunningState };
        if (onUpdateSuccess) onUpdateSuccess(updatedHost);
        toast.success(
          `Host ${host.name} ${newRunningState ? "started" : "stopped"} successfully`,
        );
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
      })
      .finally(() => setLoading(false));
  };

  if (dropdown) {
    return (
      <DropdownMenuItem
        onClick={handleToggle}
        disabled={loading}
        variant={host.running ? "destructive" : "default"}
        className={className}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : host.running ? (
          <Square className="mr-2 h-4 w-4" fill="red" strokeWidth={0} />
        ) : (
          <Play className="mr-2 h-4 w-4" fill="black"/>
        )}
        {host.running ? "Stop" : "Run"}
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={host.running ? "destructive" : "default"}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : host.running ? (
        <Square className="h-4 w-4" fill="white" strokeWidth={0} />
      ) : (
        <Play className="mr-2 h-4 w-4" fill="white" strokeWidth={0} />
      )}
      {host.running ? "Stop" : "Run"}
    </Button>
  );
}
