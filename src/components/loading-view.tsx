export function LoadingView({ text }: { text?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-12">
      <div className="size-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
      <div className="text-lg font-semibold">{text}</div>
    </div>
  );
}
