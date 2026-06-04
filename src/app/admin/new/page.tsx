import Link from "next/link";
import NewMenuForm from "../new-menu-form";

export default function NewMenuPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-xl px-6 py-12">
        <Link href="/admin" className="text-sm text-muted hover:text-fg">
          ← All menus
        </Link>
        <div className="label-eyebrow mt-6">New</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tighter2">Create menu</h1>
        <p className="mt-1 text-sm text-muted">
          Give it a name. You can add sections and items next.
        </p>
        <div className="card mt-8 p-6">
          <NewMenuForm />
        </div>
      </div>
    </div>
  );
}
