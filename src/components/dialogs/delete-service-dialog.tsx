import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteService } from "@/lib/api";
import { toast } from "sonner";
import { APIError } from "@/lib/type";
import { Trash2 } from "lucide-react";
import { AlertError } from "../alert-error-success";
import { useUser } from "@/context/use-user";

export function DeleteServiceDialog({
  serviceName,
  onSuccess,
}: {
  serviceName: string;
  onSuccess: () => void;
  }) {
  const { loadAccessableService } = useUser();

  const handleDelete = () => {
    deleteService(serviceName)
      .then(() => {
        toast.success(`Service ${serviceName} deleted successfully`);
        onSuccess();
        loadAccessableService();
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-5 w-5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-6 w-6" />
            {`刪除服務 ${serviceName}`}
          </DialogTitle>
        </DialogHeader>
        <AlertError message="正在被該服務使用的所有機櫃和 IP 將被釋放，所有Host將被刪除。 此動作無法復原。" />
        <DialogFooter className="sm:justify-end mt-2">
          <DialogClose asChild>
            <Button variant="outline" className="mt-2 sm:mt-0">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              DELETE
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
