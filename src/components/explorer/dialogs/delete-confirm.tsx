"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemCount?: number;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemCount = 1,
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  const defaultTitle =
    itemCount > 1 ? `Delete ${itemCount} items` : `Delete ${itemName || "item"}`;

  const defaultDescription =
    itemCount > 1
      ? `Are you sure you want to delete these ${itemCount} items? This action cannot be undone.`
      : `Are you sure you want to delete this ${itemName || "item"}? This action cannot be undone.`;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex flex-col space-y-2 text-center sm:text-left">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600">
            <Trash2 className="h-5 w-5" />
            {title || defaultTitle}
          </h2>
          <p className="text-sm text-gray-500">{description || defaultDescription}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 text-white hover:bg-red-700">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
