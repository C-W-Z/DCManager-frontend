import { JSX } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/icon";

export function InfoCard({ children }: { children: JSX.Element }) {
  return <div className="flex h-fit w-md flex-col gap-4">{children}</div>;
}

export const Separator = () => {
  return <div className="my-2 h-[2px] w-full bg-gray-200" />;
};

export const CardColumn = ({
  label,
  data,
  link,
}: {
  label: string;
  data: string;
  link?: string;
}) => {
  return (
    <div className="flex flex-row items-start justify-between gap-2">
      <div className="text-sm text-gray-500">{label}</div>
      {data ? (
        <>
          {link ? (
            <Link
              to={link}
              className="flex flex-row items-center gap-1 text-sm font-bold underline hover:text-cyan-500"
            >
              {data}
              <Icon id="open-new" className="size-4" />
            </Link>
          ) : (
            <div className="text-sm font-bold">{data}</div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500">NaN</div>
      )}
    </div>
  );
};
