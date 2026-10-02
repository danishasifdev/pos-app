import { Store } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-bg p-6">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Store aria-hidden="true" size={20} />
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg">
            Mall POS
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-fg">{description}</p>
        </div>
        {children}
        {footer && (
          <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-fg">
            {footer}
          </div>
        )}
      </section>
    </main>
  );
}