import { JSX } from "react";

export function InfoCard({ children }: { children: JSX.Element }) {
  return <div className="flex h-fit w-md flex-col gap-4">{children}</div>;
}

export const Separator = () => {
  return <div className="my-2 h-[2px] w-full bg-gray-200" />;
};

export const CardColumn = ({ label, data }: { label: string; data: string }) => {
  return (
    <div className="flex flex-row items-start justify-between gap-2">
      <div className="text-sm text-gray-500">{label}</div>
      {data ? (
        <div className="text-sm font-bold">{data}</div>
      ) : (
        <div className="text-sm text-gray-500">NaN</div>
      )}
    </div>
  );
};
