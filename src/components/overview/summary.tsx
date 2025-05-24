import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type SummaryContent = {
  label: string;
  value: string | number | undefined;
}[];

export function Summary({
  title,
  contents,
  loading = false,
}: {
  title: string | undefined;
  contents: SummaryContent;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">loading</h2>
        <div className={cn("mt-2 grid grid-cols-1 gap-4", "md:grid-cols-4")}>
          {contents.map((_, index) => (
            <Skeleton key={index} className="h-18 w-full rounded-md bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className={cn("mt-2 grid grid-cols-1 gap-4", "md:grid-cols-4")}>
        {contents.map((item, index) => (
          <div key={index} className="h-18 rounded-md bg-gray-50 p-3">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
