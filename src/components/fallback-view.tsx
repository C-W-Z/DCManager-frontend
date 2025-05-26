import { Link } from "react-router-dom";

export function FallbackView({ text, link }: { text: string; link?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-lg font-bold">{text}</div>
      {link && (
        <Link to={link} className="ml-2 text-blue-500 hover:underline">
          返回
        </Link>
      )}
    </div>
  );
}
