import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas p-8 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <span className="label-eyebrow mb-5 rounded-full border border-line bg-surface px-3 py-1.5 text-muted">
        Menu Builder
      </span>
      <h1 className="font-display text-6xl font-extrabold tracking-tighter2 text-fg md:text-7xl">
        Design menus.<br />
        <span className="text-muted">One scan to share.</span>
      </h1>
      <p className="mt-6 max-w-md text-muted">
        Build a restaurant menu, drop in product photos, generate a QR.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/admin" className="btn-primary px-5 py-3 text-base">
          Open admin
        </Link>
        <Link href="/preview" className="btn-secondary px-5 py-3 text-base">
          See a sample menu
        </Link>
      </div>
    </main>
  );
}
