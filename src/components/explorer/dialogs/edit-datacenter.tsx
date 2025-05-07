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
import type { SimpleDatacenter } from "@/lib/type";
import { modifyDC } from "@/lib/api";

interface EditDatacenterDialogProps {
  datacenter: SimpleDatacenter;
  onUpdate: (updatedDC: SimpleDatacenter | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDatacenterDialog({
  datacenter,
  onUpdate,
  open,
  onOpenChange,
}: EditDatacenterDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    height: "",
  });

  useEffect(() => {
    if (open && datacenter) {
      setFormData({
        name: datacenter.name,
        height: datacenter.height.toString(),
      });
    }
  }, [open, datacenter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedDC = await modifyDC(datacenter.id, {
        name: formData.name,
        height: Number.parseInt(formData.height),
        ip_ranges: [], // TODO
      });

      onUpdate(updatedDC);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating datacenter:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Data Center
          </DialogTitle>
        </DialogHeader>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
