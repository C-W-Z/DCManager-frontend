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
import { Edit } from "lucide-react";
import type { APIError, SimpleRoom } from "@/lib/type";
import { modifyRoom } from "@/lib/api";
import { toast } from "sonner";
import { AlertError } from "../alert-error-success";

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

  const handleSubmit = (e: React.FormEvent) => {
    if (!room) return;
    e.preventDefault();
    setError(null);

    modifyRoom(room.name, {
      name: formData.name,
      height: Number.parseInt(formData.height),
      dc_name: room.dc_name,
    })
      .then(() => {
        // 如果修改成功，更新父组件中的数据
        // 由于modifyDC只返回布尔值，我们需要构造一个更新后的对象
        const updatedRoom: SimpleRoom = {
          ...room,
          name: formData.name,
          height: Number.parseInt(formData.height),
        };
        toast.success(`Room ${formData.name} edited successfully`);
        if (onUpdateSuccess) onUpdateSuccess(updatedRoom);
        setOpen(false);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setError(e.error);
      });
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
          {error && <AlertError message={error} />}

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
