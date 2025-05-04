"use client";

import type React from "react";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "@/components/ui/plus-icon";

interface NewRoomModalProps {
  is_open: boolean;
  onClose: () => void;
  onAdd: (roomData: { location: string; name: string; height: string }) => void;
  currentDataCenter?: string;
}

export function NewRoomModal({
  is_open,
  onClose,
  onAdd,
  currentDataCenter = "",
}: NewRoomModalProps) {
  const [formData, setFormData] = useState({
    location: currentDataCenter,
    name: "",
    height: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <Dialog open={is_open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <PlusIcon className="h-5 w-5" /> New Room
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={currentDataCenter || "Unkown Location"}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="string"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (Unit)</Label>
            <Input
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="1U ~ 42U"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
