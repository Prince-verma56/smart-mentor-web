interface FormDividerProps {
  label?: string;
}

export function FormDivider({ label = "or continue with" }: FormDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
