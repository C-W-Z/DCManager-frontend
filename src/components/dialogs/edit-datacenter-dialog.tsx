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
import type { APIError, Datacenter, SimpleDatacenter } from "@/lib/type";
import { getDC, modifyDC } from "@/lib/api";
import { toast } from "sonner";
import { AlertError } from "../alert-error-success";

interface EditDatacenterDialogProps {
  datacenter: SimpleDatacenter | null;
  onUpdateSuccess?: (updatedDC: SimpleDatacenter) => void;
}

export function EditDatacenterDialog({
  datacenter,
  onUpdateSuccess,
}: EditDatacenterDialogProps) {
  // 添加内部状态管理打开/关闭状态
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    height: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当 datacenter 变化时，如果有值则打开对话框
  useEffect(() => {
    setLoading(true);
    if (!datacenter) return;
    setOpen(true);
    setError(null);
    getDC(datacenter.name)
      .then((dc: Datacenter) => {
        setFormData({
          name: dc.name,
          height: dc.height.toString(),
        });
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setFormData({
          name: datacenter.name,
          height: datacenter.height.toString(),
        });
        setError(e.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [datacenter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!datacenter) return;
    e.preventDefault();

    setError(null);
    setLoading(true);

    modifyDC(datacenter.name, {
      name: formData.name,
      height: Number.parseInt(formData.height),
    })
      .then(() => {
        // 如果修改成功，更新父组件中的数据
        // 由于modifyDC只返回布尔值，我们需要构造一个更新后的对象
        const updatedDC: SimpleDatacenter = {
          ...datacenter,
          name: formData.name,
          height: Number.parseInt(formData.height),
        };
        toast.success(`Data Center ${formData.name} edited successfully`);
        if (onUpdateSuccess) onUpdateSuccess(updatedDC);
        setOpen(false);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setError(e.error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Data Center
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
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
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
