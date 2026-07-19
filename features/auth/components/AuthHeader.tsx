interface AuthHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthHeader({ icon, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          {icon}
        </div>
      )}
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
