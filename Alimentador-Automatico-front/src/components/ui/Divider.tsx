interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  if (!label) {
    return <hr className="my-4 border-zinc-300" />;
  }

  return (
    <div className="flex items-center gap-3 my-4">
      <span className="h-px flex-1 bg-zinc-300" />
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className="h-px flex-1 bg-zinc-300" />
    </div>
  );
}

export default Divider;
