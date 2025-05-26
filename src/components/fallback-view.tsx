import { Link } from "react-router-dom";

export function FallbackView({ text, link }: { text: string; link?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="text-lg font-bold">{text}</div>
      {link && (
        <Link to={link} className="ml-2 text-blue-500 hover:underline">
          返回
        </Link>
      )}
    </div>
  );
}
