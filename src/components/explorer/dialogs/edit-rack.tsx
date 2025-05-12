"use client";

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
import type { SimpleRack } from "@/lib/type";
import { modifyRack } from "@/lib/api";

interface EditRackDialogProps {
  rack: SimpleRack | null;
  onUpdateSuccess: (updatedRack: SimpleRack) => void;
}

export function EditRackDialog({ rack, onUpdateSuccess }: EditRackDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    service_name: "", // TODO: we need service ID
    height: "",
  });

  const hasHosts = rack ? rack.n_hosts > 0 : false;

  useEffect(() => {
    if (!rack) return;
    setOpen(true);
    setFormData({
      name: rack.name,
      service_name: rack.service_name,
      height: rack.height.toString(),
    });
  }, [rack]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!rack) return;
    e.preventDefault();
    setError(null);

    try {
      const success = await modifyRack(rack.id, {
        name: formData.name,
        service_id: formData.service_name, // TODO
        height: Number.parseInt(formData.height),
        room_id: rack.room_id,
      });

      if (success) {
        const updatedRack: SimpleRack = {
          ...rack,
          name: formData.name,
          height: Number.parseInt(formData.height),
        };
        onUpdateSuccess(updatedRack);
        setOpen(false);
      } else {
        setError("更新數據中心失敗，請稍後再試。");
      }
    } catch (error) {
      console.error("Error updating rack:", error);
      setError("更新數據中心時發生錯誤。");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Rack
          </DialogTitle>
        </DialogHeader>

        {hasHosts && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              此機架內有主機，無法修改高度。請先移除所有主機後再修改高度。
            </AlertDescription>
          </Alert>
        )}

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
            <Label htmlFor="service_name">Service</Label>
            <Input
              id="service_name"
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
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
              disabled={hasHosts}
            />
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
