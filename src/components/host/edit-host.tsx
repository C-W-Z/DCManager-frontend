import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { host_schema, Host } from "@/lib/type";
import { modifyHost } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface EditHostDialogProps {
  host: Host | null;
  onUpdateSuccess?: (updatedHost: Host) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const form_schema = host_schema.pick({
  name: true,
  height: true,
  running: true,
});

// TODO: fix status -> running

export function EditHostDialog({ host, onUpdateSuccess }: EditHostDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<z.infer<typeof form_schema>>({
    name: "",
    height: 0,
    running: false,
  });

  useEffect(() => {
    if (!host) return;
    setOpen(true);
    setFormData({
      name: host.name,
      height: host.height,
      running: host.running,
    });
  }, [host]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!host) return;
    e.preventDefault();
    setError(null);

    modifyHost(host.name, {
      name: formData.name,
      height: formData.height,
      running: formData.running,
    })
      .then(() => {
        const updatedHost: Host = {
          ...host,
          name: formData.name,
          height: formData.height,
          running: formData.running,
        };
        if (onUpdateSuccess) onUpdateSuccess(updatedHost);
        setOpen(false);
        toast.success(`Host ${formData.name} edited successfully`);
      })
      .catch((error) => {
        console.error("Error updating rack:", error);
        setError("Failed to edit Rack.");
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Host
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (U)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="running">Status</Label>
            <Select
              defaultValue={host?.running ? "running" : "stopped"}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, running: value === "running" }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="running"
                >
                  Running
                </SelectItem>
                <SelectItem
                  value="stopped"
                >
                  Stopped
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
