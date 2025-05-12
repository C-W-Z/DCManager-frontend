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
import { Edit, Plus, Trash2 } from "lucide-react";
import type { Datacenter, SimpleDatacenter } from "@/lib/type";
import { getDC, modifyDC } from "@/lib/api";

interface IPRange {
  start_ip: string;
  end_ip: string;
}

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
  const [ipRanges, setIpRanges] = useState<IPRange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && datacenter) {
      setLoading(true);
      getDC(datacenter.id)
        .then((dc: Datacenter) => {
          setFormData({
            name: dc.name,
            height: dc.height.toString(),
          });
          // 如果API返回的数据中有IP范围，则设置它
          if (dc.ip_ranges && Array.isArray(dc.ip_ranges)) {
            setIpRanges(dc.ip_ranges);
          } else {
            setIpRanges([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching datacenter data:", error);
          setFormData({
            name: datacenter.name,
            height: datacenter.height.toString(),
          });
          setIpRanges([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, datacenter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIpRangeChange = (index: number, field: keyof IPRange, value: string) => {
    setIpRanges((prev) => {
      const newRanges = [...prev];
      newRanges[index] = { ...newRanges[index], [field]: value };
      return newRanges;
    });
  };

  const addIpRange = () => {
    setIpRanges((prev) => [...prev, { start_ip: "", end_ip: "" }]);
  };

  const removeIpRange = (index: number) => {
    setIpRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedDC = await modifyDC(datacenter.id, {
        name: formData.name,
        height: Number.parseInt(formData.height),
        ip_ranges: ipRanges,
      });

      onUpdate(updatedDC);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating datacenter:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> 編輯數據中心
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="height">標準高度 (U)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>IP 範圍</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIpRange}
                  className="h-8"
                >
                  <Plus className="mr-1 h-4 w-4" /> 添加範圍
                </Button>
              </div>

              {ipRanges.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                  尚未設定 IP 範圍。點擊上方按鈕添加。
                </div>
              ) : (
                <div className="space-y-3">
                  {ipRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="起始 IP"
                          value={range.start_ip}
                          onChange={(e) =>
                            handleIpRangeChange(index, "start_ip", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex w-8 items-center justify-center">
                        <span className="text-gray-500">至</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="結束 IP"
                          value={range.end_ip}
                          onChange={(e) =>
                            handleIpRangeChange(index, "end_ip", e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIpRange(index)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
