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
import { type APIError, type SimpleRack } from "@/lib/type";
import { modifyRack } from "@/lib/api";
import { toast } from "sonner";
import { AlertError } from "../alert-error-success";

export function EditRackDialog({
  rack,
  onUpdateSuccess,
}: {
  rack: SimpleRack | null;
  onUpdateSuccess?: (updatedRack: SimpleRack) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    height: "",
  });

  const hasHosts = rack ? rack.n_hosts > 0 : false;

  // Initialize form data when rack changes
  useEffect(() => {
    if (!rack) return;
    setOpen(true);
    setFormData({
      name: rack.name,
      height: rack.height.toString(),
    });
  }, [rack]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!rack) return;
    e.preventDefault();
    setError(null);

    modifyRack(rack.name, {
      name: formData.name,
      height: Number.parseInt(formData.height),
      room_name: rack.room_name,
    })
      .then(() => {
        const updatedRack: SimpleRack = {
          ...rack,
          name: formData.name,
          height: Number.parseInt(formData.height),
        };
        toast.success(`Rack ${formData.name} edited successfully`);
        if (onUpdateSuccess) onUpdateSuccess(updatedRack);
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
            <Edit className="h-5 w-5" /> Edit Rack
          </DialogTitle>
        </DialogHeader>

        {hasHosts && (
          <AlertError
            message="There are hosts in this rack, so the height cannot be changed. Please remove all
              hosts before changing the height."
          />
        )}

        {error && <AlertError message={error} />}

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
