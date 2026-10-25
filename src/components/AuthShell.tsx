import {
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  ChartNoAxesCombined,
  Store,
} from "lucide-react";
import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
  footer,
  variant = "login",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "login" | "register" | "admin";
}) {
  const isRegister = variant === "register";
  const isAdmin = variant === "admin";
  const accentText = isRegister
    ? "text-sky-200"
    : isAdmin
      ? "text-violet-200"
      : "text-emerald-300";
  const accentGlow = isRegister
    ? "bg-sky-400/15"
    : isAdmin
      ? "bg-violet-400/20"
      : "bg-emerald-400/20";
  const accentBar = isRegister
    ? "bg-sky-300"
    : isAdmin
      ? "bg-violet-300"
      : "bg-emerald-300";

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-surface-muted px-4 py-6 sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 12% 8%, rgba(16,185,129,0.28), transparent 38%), radial-gradient(ellipse at 92% 88%, rgba(99,102,241,0.32), transparent 42%), linear-gradient(135deg, #111827 0%, #0f172a 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary opacity-[0.06] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-32 h-[32rem] w-[32rem] rounded-full bg-primary opacity-[0.06] blur-3xl"
      />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/40 bg-white/80 shadow-[0_32px_100px_-48px_rgba(15,23,42,0.3)] backdrop-blur-2xl lg:min-h-[680px] lg:grid-cols-[1.02fr_0.98fr] lg:border-border lg:bg-surface">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#111827] p-10 text-white lg:flex lg:p-14">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full ${accentGlow} blur-3xl`}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-28 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
          />
          <div className="relative">
            <Link
              className="inline-flex items-center gap-3"
              href="/"
              aria-label="POS home"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-950 shadow-lg shadow-black/20">
                <Store aria-hidden="true" size={20} />
              </span>
              <span className="text-lg font-bold tracking-tight">Counter</span>
            </Link>
          </div>

          <div className="relative my-12 max-w-lg">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-white/80">
              <span className={`h-1.5 w-1.5 rounded-full ${accentBar}`} />
              {isAdmin
                ? "Store operations, in one place"
                : isRegister
                  ? "A fresh start for your store"
                  : "A calmer way to run your counter"}
            </span>
            <h2 className="text-4xl font-semibold leading-[1.12] tracking-tight lg:text-[3.25rem]">
              {isRegister ? (
                <>
                  Your next great
                  <br />
                  <span className={accentText}>sale starts here.</span>
                </>
              ) : isAdmin ? (
                <>
                  Keep every
                  <br />
                  <span className={accentText}>store in view.</span>
                </>
              ) : (
                <>
                  Good to see
                  <br />
                  <span className={accentText}>you again.</span>
                </>
              )}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
              {isRegister
                ? "Set up your workspace and bring products, payments, and daily sales together."
                : isAdmin
                  ? "A clear overview of accounts, activity, and the details that keep your business moving."
                  : "Pick up right where you left off. Your products, receipts, and settings are ready when you are."}
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/55">
                    {isRegister ? "WORKSPACE PREVIEW" : "TODAY'S OVERVIEW"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/90">
                    {isRegister
                      ? "Everything in one place"
                      : "Your counter at a glance"}
                  </p>
                </div>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentGlow} ${accentText}`}
                >
                  <ChartNoAxesCombined aria-hidden="true" size={18} />
                </span>
              </div>
              <div className="flex items-end gap-2" aria-hidden="true">
                {[30, 46, 37, 62, 48, 76, 57, 88, 66, 100, 72, 91].map(
                  (height, index) => (
                    <span
                      className={`flex-1 rounded-t-sm ${
                        index === (isRegister ? 6 : 9)
                          ? accentBar
                          : "bg-white/20"
                      }`}
                      key={index}
                      style={{ height: `${height}px` }}
                    />
                  ),
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/60">
                <BadgeCheck
                  aria-hidden="true"
                  className={accentText}
                  size={15}
                />
                Private workspace, ready to go
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between text-xs text-white/45">
            <span>Simple tools for busy counters.</span>
            <Boxes aria-hidden="true" size={17} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col justify-center px-6 py-9 sm:px-12 sm:py-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              className="mb-9 inline-flex items-center gap-2.5 lg:hidden"
              href="/"
              aria-label="POS home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Store aria-hidden="true" size={19} />
              </span>
              <span className="text-base font-bold tracking-tight text-fg">
                Counter
              </span>
            </Link>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {isRegister
                  ? "Get started"
                  : isAdmin
                    ? "Control center"
                    : "Welcome back"}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-[2.1rem]">
                {title}
              </h1>
              <p className="mt-2.5 text-sm leading-6 text-muted-fg">
                {description}
              </p>
            </div>

            {children}

            {footer && (
              <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-fg">
                {footer}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="absolute bottom-2 left-0 right-0 hidden justify-center text-[11px] text-muted-fg sm:flex">
        <span className="inline-flex items-center gap-1.5">
          Built for your business
          <ArrowUpRight aria-hidden="true" size={12} />
        </span>
      </div>
    </main>
  );
}
