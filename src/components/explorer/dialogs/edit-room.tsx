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
import { AlertCircle, Edit } from "lucide-react";
import type { SimpleRoom } from "@/lib/type";
import { modifyRoom } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditRoomDialogProps {
  room: SimpleRoom | null;
  onUpdateSuccess?: (updatedRoom: SimpleRoom) => void;
}

export function EditRoomDialog({ room, onUpdateSuccess }: EditRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    height: "",
  });

  useEffect(() => {
    if (!room) return;
    setOpen(true);
    setFormData({
      name: room.name,
      height: room.height.toString(),
    });
  }, [room]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!room) return;
    e.preventDefault();
    setError(null);

    try {
      const success = await modifyRoom(room.id, {
        name: formData.name,
        height: Number.parseInt(formData.height),
        dc_id: room.dc_id,
      });

      if (success) {
        // 如果修改成功，更新父组件中的数据
        // 由于modifyDC只返回布尔值，我们需要构造一个更新后的对象
        const updatedRoom: SimpleRoom = {
          ...room,
          name: formData.name,
          height: Number.parseInt(formData.height),
        };
        if (onUpdateSuccess) onUpdateSuccess(updatedRoom);
        setOpen(false);
      } else {
        setError("Failed to edit Room.");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      setError("Failed to edit Room.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Room
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
