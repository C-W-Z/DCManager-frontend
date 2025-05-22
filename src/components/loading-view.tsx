import Icon from "@/components/icon";

export function LoadingView({ text }: { text?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 p-12">
      <Icon id="loading" className="mr-1 size-6 animate-spin" />
      <div className="text-lg font-semibold">{text}</div>
    </div>
  );
}
