import Link from "next/link";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  backHref?: string;
};

export function MobileShell({ title, subtitle, children, backHref }: Props) {
  return (
    <main className="flex flex-1 flex-col px-4 pb-6">
      <header className="mb-6 flex items-start gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="mt-1 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
          >
            ←
          </Link>
        ) : null}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Reto ICFES
          </p>
          <h1 className="text-2xl font-bold leading-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      </header>
      {children}
    </main>
  );
}
