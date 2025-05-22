export function FallbackView({ text }: { text?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-lg font-bold">{text}</div>
    </div>
  );
}
