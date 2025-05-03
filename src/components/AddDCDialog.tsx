"use client";

import type React from "react";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "@/components/ui/plus-icon";

interface NewDCModalProps {
  is_open: boolean;
  onClose: () => void;
  onAdd: (dcData: { name: string; defalut_height: number }) => void;
}

export function NewDCModal({ is_open: isOpen, onClose, onAdd }: NewDCModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    defalut_height: 42,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <PlusIcon className="h-5 w-5" /> New DC
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
              placeholder="string"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defalut_height">Default Height (Unit)</Label>
            <Input
              id="defalut_height"
              name="defalut_height"
              value={formData.defalut_height}
              onChange={handleChange}
              placeholder="1U ~ 42U"
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
