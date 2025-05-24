"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDC, deleteRoom, deleteRack, deleteHost } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { APIError } from "@/lib/type";

export type DeleteType = "datacenter" | "room" | "rack" | "host";

interface DeleteConfirmationProps {
  ids: string[];
  type: DeleteType;
  itemNames?: string[];
  onSuccess?: (ids: string[]) => void;
}

export function DeleteConfirmation({
  ids,
  type,
  itemNames,
  onSuccess,
}: DeleteConfirmationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 当 ids 变化时，如果有值则打开对话框
  useEffect(() => {
    if (ids && ids.length > 0) {
      setIsOpen(true);
    }
  }, [ids]);

  const onClose = () => {
    setIsOpen(false);
  };

  const onConfirm = async () => {
    if (!ids || ids.length === 0) return;

    setLoading(true);

    try {
      // 根据类型选择不同的删除函数
      const deleteFunction = getDeleteFunction();

      // 创建所有删除操作的Promise数组
      const deletePromises = ids.map((id) => deleteFunction(id));

      // 执行所有删除操作
      const results = await Promise.all(deletePromises);

      // 检查是否所有删除操作都成功
      const allSuccessful = results.every((result) => result === undefined);

      // 如果所有删除都成功，通知父组件
      if (allSuccessful) {
        const names = itemCount > 1 ? `${itemCount} ${typeName}s` : `${itemName || ""}`;
        toast.success(`Delete ${names} successfully`);
        if (onSuccess) onSuccess(ids);
      } else {
        console.error("Some delete operations failed");
        toast.error("Some delete operations failed");
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error((error as APIError).error);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  // 根据类型获取对应的删除函数
  const getDeleteFunction = () => {
    switch (type) {
      case "datacenter":
        return deleteDC;
      case "room":
        return deleteRoom;
      case "rack":
        return deleteRack;
      case "host":
        return deleteHost;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (_id: string) => Promise.resolve();
    }
  };

  // 获取类型的显示名称
  const getTypeName = (): string => {
    switch (type) {
      case "datacenter":
        return "Data Center";
      case "room":
        return "Room";
      case "rack":
        return "Rack";
      case "host":
        return "Host";
      default:
        return "Item";
    }
  };

  if (!isOpen) return null;

  const itemCount = ids?.length || 0;
  const typeName = getTypeName();

  // 如果提供了具体的项目名称，则使用它
  const itemName = itemNames && itemNames.length > 0 ? itemNames[0] : typeName;

  const title =
    itemCount > 1 ? `Delete ${itemCount} ${typeName}s` : `Delete ${itemName || "item"}`;

  const description =
    itemCount > 1
      ? `Are you sure you want to delete these ${itemCount} ${typeName}s?`
      : `Are you sure you want to delete ${itemName || "this item"}?`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-pretty"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600">
            <Trash2 className="h-5 w-5" />
            {title}
          </h2>
          <p className="text-sm text-black">{description}</p>
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. All associated content will also be deleted.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
