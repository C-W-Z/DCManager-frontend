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
  rack: SimpleRack;
  onUpdate: (updatedRack: SimpleRack | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRackDialog({ rack, onUpdate, open, onOpenChange }: EditRackDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    service_name: "",
    height: "",
  });

  const hasHosts = rack?.n_hosts > 0;

  useEffect(() => {
    if (open && rack) {
      setFormData({
        name: rack.name,
        service_name: rack.service_name,
        height: rack.height.toString(),
      });
    }
  }, [open, rack]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedRack = await modifyRack(rack.id, {
        // TODO
        name: formData.name,
        service_id: formData.service_name,
        height: Number.parseInt(formData.height),
        room_id: rack.room_id,
      });

      onUpdate(updatedRack);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating rack:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> 編輯機架
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">名稱</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_name">服務名稱</Label>
            <Input
              id="service_name"
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">高度 (U)</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
