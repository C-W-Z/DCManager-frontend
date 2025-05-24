import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

export function AlertError({message}: {message: string}) {
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function AlertSuccess({message}: {message: string}) {
  return (
    <Alert variant="default" className="border-green-500 bg-green-500 text-green-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}