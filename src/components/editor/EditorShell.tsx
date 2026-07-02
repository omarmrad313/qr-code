"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalIcon,
  FoldersIcon,
  ImageIcon,
  LayersIcon,
  ListIcon,
  QrIcon,
  SettingsIcon,
} from "@/components/icons";
import Canvas from "./Canvas";
import Inspector from "./Inspector";
import QRPanel from "./QRPanel";
import type { EditorAdapter, EditorMenu, Selection } from "./types";

type Tab = "menus" | "categories" | "items" | "media" | "qr" | "settings";

export default function EditorShell({
  menu,
  adapter,
  publicUrl,
  homeHref,
  onHome,
  homeLabel = "Menus",
  rightHeader,
  initialTab,
}: {
  menu: EditorMenu;
  adapter: EditorAdapter;
  publicUrl: string;
  homeHref?: string;
  onHome?: () => void;
  homeLabel?: string;
  rightHeader?: React.ReactNode;
  initialTab?: string;
}) {
  const validTabs: Tab[] = ["menus", "categories", "items", "media", "qr", "settings"];
  const startTab = validTabs.includes(initialTab as Tab) ? (initialTab as Tab) : "items";
  const [tab, setTab] = useState<Tab>(startTab);
  const [collapsed, setCollapsed] = useState(false);
  const [selection, setSelection] = useState<Selection>({ type: "menu" });
  const [mobilePanel, setMobilePanel] = useState<"canvas" | "inspector">("canvas");

  const selectedProduct = useMemo(() => {
    if (selection?.type !== "product") return null;
    for (const c of menu.categories) {
      const p = c.products.find((x) => x.id === selection.id);
      if (p) return { product: p, categoryId: c.id };
    }
    return null;
  }, [selection, menu]);

  const selectedCategory = useMemo(() => {
    if (selection?.type !== "category") return null;
    return menu.categories.find((c) => c.id === selection.id) ?? null;
  }, [selection, menu]);

  useEffect(() => {
    if (selection && selection.type === "product" && !selectedProduct) {
      setSelection({ type: "menu" });
    }
    if (selection && selection.type === "category" && !selectedCategory) {
      setSelection({ type: "menu" });
    }
  }, [selection, selectedProduct, selectedCategory]);

  return (
    <div className="flex min-h-screen bg-canvas text-fg">
      <LeftRail
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        tab={tab}
        setTab={setTab}
        menu={menu}
        homeHref={homeHref}
        onHome={onHome}
        homeLabel={homeLabel}
        adapter={adapter}
        selection={selection}
        setSelection={setSelection}
      />

      <div className={`flex flex-1 flex-col ${mobilePanel === "inspector" ? "hidden md:flex" : "flex"}`}>
        <TopBar
          menu={menu}
          publicUrl={publicUrl}
          onOpenQR={() => setTab("qr")}
          rightHeader={rightHeader}
        />
        <main className="flex-1 overflow-auto px-6 py-8 md:px-10 md:py-10">
          {tab === "qr" ? (
            <QRPanel menu={menu} url={publicUrl} />
          ) : tab === "media" ? (
            <MediaTab menu={menu} />
          ) : tab === "settings" ? (
            <SettingsTab menu={menu} adapter={adapter} />
          ) : (
            <Canvas
              menu={menu}
              adapter={adapter}
              selection={selection}
              setSelection={(s) => {
                setSelection(s);
                if (s?.type === "product") setMobilePanel("inspector");
              }}
            />
          )}
        </main>
      </div>

      <Inspector
        menu={menu}
        adapter={adapter}
        selection={selection}
        setSelection={setSelection}
        selectedProduct={selectedProduct?.product ?? null}
        selectedCategory={selectedCategory}
        onClose={() => setMobilePanel("canvas")}
        mobileOpen={mobilePanel === "inspector"}
      />

      {/* Mobile bottom nav */}
      <MobileNav tab={tab} setTab={setTab} />
    </div>
  );
}

function LeftRail({
  collapsed,
  setCollapsed,
  tab,
  setTab,
  menu,
  homeHref,
  onHome,
  homeLabel,
  adapter,
  selection,
  setSelection,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  menu: EditorMenu;
  homeHref?: string;
  onHome?: () => void;
  homeLabel: string;
  adapter: EditorAdapter;
  selection: Selection;
  setSelection: (s: Selection) => void;
}) {
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "menus", label: "Menus", icon: <FoldersIcon /> },
    { id: "categories", label: "Categories", icon: <LayersIcon /> },
    { id: "items", label: "Items", icon: <ListIcon /> },
    { id: "media", label: "Media", icon: <ImageIcon /> },
    { id: "qr", label: "QR Code", icon: <QrIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-canvas md:flex ${
        collapsed ? "w-14" : "w-60"
      } transition-[width] duration-200`}
    >
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-4`}>
        {!collapsed && (
          onHome ? (
            <button onClick={onHome} className="text-sm font-semibold tracking-tightish">
              ← {homeLabel}
            </button>
          ) : (
            <Link href={homeHref ?? "/"} className="text-sm font-semibold tracking-tightish">
              ← {homeLabel}
            </Link>
          )
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="icon-btn h-7 w-7"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {items.map((it) => {
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg"
              }`}
              title={it.label}
            >
              <span className="flex h-5 w-5 items-center justify-center">{it.icon}</span>
              {!collapsed && <span>{it.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (tab === "categories" || tab === "items") && (
        <div className="mt-4 border-t border-line px-3 pt-3">
          <div className="label-eyebrow mb-2">
            {tab === "categories" ? "Sections" : "Items"}
          </div>
          <div className="space-y-1 overflow-y-auto pb-4">
            {menu.categories.length === 0 ? (
              <p className="px-1 text-xs text-dim">None yet.</p>
            ) : tab === "categories" ? (
              menu.categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelection({ type: "category", id: c.id })}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                    selection?.type === "category" && selection.id === c.id
                      ? "bg-elevated text-fg"
                      : "text-muted hover:bg-elevated hover:text-fg"
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] text-dim">{c.products.length}</span>
                </button>
              ))
            ) : (
              menu.categories.flatMap((c) =>
                c.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelection({ type: "product", id: p.id })}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                      selection?.type === "product" && selection.id === p.id
                        ? "bg-elevated text-fg"
                        : "text-muted hover:bg-elevated hover:text-fg"
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] text-dim">{c.name}</span>
                  </button>
                ))
              )
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

function TopBar({
  menu,
  publicUrl,
  onOpenQR,
  rightHeader,
}: {
  menu: EditorMenu;
  publicUrl: string;
  onOpenQR: () => void;
  rightHeader?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-canvas/80 px-6 py-3 backdrop-blur md:px-10">
      <div className="min-w-0">
        <div className="label-eyebrow">Editing</div>
        <div className="truncate text-lg font-semibold tracking-tightish">{menu.name}</div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary hidden md:inline-flex"
        >
          <ExternalIcon /> View
        </a>
        <button onClick={onOpenQR} className="btn-primary">
          <QrIcon /> QR
        </button>
        {rightHeader}
      </div>
    </header>
  );
}

function MobileNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; icon: React.ReactNode }[] = [
    { id: "categories", icon: <LayersIcon /> },
    { id: "items", icon: <ListIcon /> },
    { id: "media", icon: <ImageIcon /> },
    { id: "qr", icon: <QrIcon /> },
    { id: "settings", icon: <SettingsIcon /> },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-line bg-canvas/95 px-2 py-2 backdrop-blur md:hidden">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setTab(it.id)}
          className={`icon-btn h-10 w-10 ${tab === it.id ? "icon-btn-active" : ""}`}
        >
          {it.icon}
        </button>
      ))}
    </nav>
  );
}

function MediaTab({ menu }: { menu: EditorMenu }) {
  const images = menu.categories.flatMap((c) =>
    c.products.filter((p) => p.image_url).map((p) => ({ id: p.id, name: p.name, src: p.image_url! }))
  );
  return (
    <div className="mx-auto max-w-5xl">
      <div className="label-eyebrow mb-2">Media</div>
      <h2 className="text-2xl font-semibold tracking-tighter2">Image library</h2>
      <p className="mt-1 text-sm text-muted">
        Every image you upload to an item appears here.
      </p>

      {images.length === 0 ? (
        <div className="card mt-8 py-16 text-center">
          <p className="text-sm text-muted">No images yet. Drop one onto any item to start.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="card-elevated overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.name} className="aspect-square w-full object-cover" />
              <div className="truncate px-3 py-2 text-xs text-muted">{img.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="label-eyebrow mb-2">Settings</div>
      <h2 className="text-2xl font-semibold tracking-tighter2">Menu settings</h2>

      <div className="card mt-6 space-y-5 p-5">
        <LayoutPicker menu={menu} adapter={adapter} />

        <div className="border-t border-line pt-5">
          <CoverSlideshowManager menu={menu} adapter={adapter} />
        </div>

        <div className="border-t border-line pt-5">
          <AccentColorPicker menu={menu} adapter={adapter} />
        </div>

        <div className="border-t border-line pt-5">
          <BackgroundUploader menu={menu} adapter={adapter} />
        </div>

        <div className="border-t border-line pt-5">
          <label className="text-xs font-medium text-muted">Menu name</label>
          <input
            defaultValue={menu.name}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== menu.name) adapter.updateMenu({ name: v });
            }}
            className="input mt-1.5"
          />
          <label className="mt-3 flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-3 py-2.5">
            <span className="text-sm">Show name in menu header</span>
            <input
              type="checkbox"
              checked={menu.show_menu_name}
              onChange={(e) => adapter.updateMenu({ show_menu_name: e.target.checked })}
              className="h-4 w-4"
            />
          </label>
        </div>
        <div>
          <label className="text-xs font-medium text-muted">URL slug</label>
          <div className="mt-1.5 flex overflow-hidden rounded-lg border border-line bg-surface">
            <span className="flex items-center bg-elevated px-3 text-sm text-muted">/menu/</span>
            <input
              defaultValue={menu.slug}
              disabled
              className="w-full bg-surface px-3 py-2 text-sm text-muted"
            />
          </div>
          <p className="mt-1 text-xs text-dim">Slug is fixed once the menu is created.</p>
        </div>
      </div>
    </div>
  );
}

function LayoutPicker({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  const options: { id: "list" | "cards" | "gallery" | "elegant"; title: string; desc: string; preview: React.ReactNode }[] = [
    {
      id: "list",
      title: "List",
      desc: "Compact rows, dotted leader.",
      preview: <PreviewList />,
    },
    {
      id: "cards",
      title: "Cards",
      desc: "Image-on-top cards, two per row.",
      preview: <PreviewCards />,
    },
    {
      id: "gallery",
      title: "Gallery",
      desc: "Full-width hero images.",
      preview: <PreviewGallery />,
    },
    {
      id: "elegant",
      title: "Elegant",
      desc: "Image left, name+price stacked, divider rows.",
      preview: <PreviewElegant />,
    },
  ];

  return (
    <div>
      <label className="text-xs font-medium text-muted">Layout style</label>
      <p className="mt-0.5 text-xs text-dim">How items appear on the public menu.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {options.map((opt) => {
          const active = menu.layout_style === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => adapter.updateMenu({ layout_style: opt.id })}
              className={`flex flex-col items-stretch gap-2 rounded-lg border p-2 text-left transition ${
                active ? "border-fg bg-elevated" : "border-line bg-surface hover:border-focus"
              }`}
            >
              <div className="rounded bg-canvas p-2">{opt.preview}</div>
              <div>
                <div className="text-xs font-semibold tracking-tightish">{opt.title}</div>
                <div className="text-[10px] leading-tight text-dim">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PreviewList = () => (
  <svg viewBox="0 0 80 50" className="h-12 w-full">
    <rect x="6" y="8" width="14" height="14" rx="2" fill="#444" />
    <rect x="24" y="9" width="30" height="3" fill="#888" />
    <rect x="24" y="15" width="40" height="2" fill="#444" />
    <rect x="66" y="9" width="8" height="3" fill="#bbb" />
    <rect x="6" y="30" width="14" height="14" rx="2" fill="#444" />
    <rect x="24" y="31" width="30" height="3" fill="#888" />
    <rect x="24" y="37" width="40" height="2" fill="#444" />
    <rect x="66" y="31" width="8" height="3" fill="#bbb" />
  </svg>
);
const PreviewCards = () => (
  <svg viewBox="0 0 80 50" className="h-12 w-full">
    <rect x="6" y="6" width="32" height="20" rx="2" fill="#444" />
    <rect x="6" y="29" width="22" height="3" fill="#888" />
    <rect x="6" y="35" width="28" height="2" fill="#444" />
    <rect x="42" y="6" width="32" height="20" rx="2" fill="#444" />
    <rect x="42" y="29" width="22" height="3" fill="#888" />
    <rect x="42" y="35" width="28" height="2" fill="#444" />
  </svg>
);
const PreviewGallery = () => (
  <svg viewBox="0 0 80 50" className="h-12 w-full">
    <rect x="6" y="5" width="68" height="18" rx="2" fill="#444" />
    <rect x="6" y="27" width="68" height="18" rx="2" fill="#444" />
  </svg>
);
const PreviewElegant = () => (
  <svg viewBox="0 0 80 50" className="h-12 w-full">
    <rect x="6" y="8" width="14" height="14" rx="3" fill="#444" />
    <rect x="24" y="9" width="24" height="3" fill="#888" />
    <rect x="24" y="15" width="14" height="3" fill="#bbb" />
    <line x1="6" y1="24" x2="74" y2="24" stroke="#bbb" strokeWidth="0.5" />
    <rect x="6" y="30" width="14" height="14" rx="3" fill="#444" />
    <rect x="24" y="31" width="24" height="3" fill="#888" />
    <rect x="24" y="37" width="14" height="3" fill="#bbb" />
  </svg>
);

function CoverSlideshowManager({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  const [uploading, setUploading] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      await adapter.addCoverImage(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted">Cover images (slideshow)</label>
      <p className="mt-0.5 text-xs text-dim">
        Add one or more — they'll auto-rotate in the banner.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {menu.cover_images.map((url) => (
          <div key={url} className="group relative aspect-video overflow-hidden rounded-lg border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => {
                if (confirm("Remove this image?")) adapter.removeCoverImage(url);
              }}
              className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-canvas/80 text-fg group-hover:flex"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}

        <label className="flex aspect-video cursor-pointer items-center justify-center rounded-lg border border-dashed border-line bg-surface text-xs text-muted hover:border-focus hover:text-fg">
          {uploading ? "Uploading…" : "+ Add"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

const ACCENT_PRESETS = [
  "#C99852", // gold (default)
  "#DC2626", // red
  "#EA580C", // orange
  "#16A34A", // green
  "#0EA5E9", // sky
  "#2563EB", // blue
  "#9333EA", // purple
  "#EC4899", // pink
  "#FFFFFF", // white
];

function AccentColorPicker({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  const [custom, setCustom] = useState(menu.accent_color);

  return (
    <div>
      <label className="text-xs font-medium text-muted">Accent color</label>
      <p className="mt-0.5 text-xs text-dim">Used for the active category pill and prices.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ACCENT_PRESETS.map((c) => {
          const active = menu.accent_color.toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              onClick={() => {
                adapter.updateMenu({ accent_color: c });
                setCustom(c);
              }}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full border-2 transition ${
                active ? "border-fg scale-110" : "border-line hover:border-muted"
              }`}
              title={c}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={() => adapter.updateMenu({ accent_color: custom })}
          className="h-8 w-12 cursor-pointer rounded border border-line bg-transparent"
        />
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={() => {
            if (/^#[0-9a-f]{6}$/i.test(custom)) adapter.updateMenu({ accent_color: custom });
          }}
          className="input flex-1 font-mono text-sm"
          placeholder="#C99852"
        />
      </div>
    </div>
  );
}

function BackgroundUploader({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  const [uploading, setUploading] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      await adapter.uploadBackground(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted">Background image</label>
      <p className="mt-0.5 text-xs text-dim">Sits behind everything on the public page (a dark overlay keeps text legible).</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className="relative mt-3 aspect-[16/7] overflow-hidden rounded-xl border border-dashed border-line bg-surface"
      >
        {menu.background_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={menu.background_image_url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-canvas/60" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            Drop an image, or use the button below
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs">
            Uploading…
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <label className="btn-secondary cursor-pointer">
          {menu.background_image_url ? "Replace background" : "Upload background"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
            className="hidden"
          />
        </label>
        {menu.background_image_url && (
          <button onClick={() => adapter.clearBackground()} className="btn-danger">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function CoverUploader({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  const [uploading, setUploading] = useState(false);

  async function onFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      await adapter.uploadCover(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-muted">Cover image</label>
      <p className="mt-0.5 text-xs text-dim">Shows behind the menu title on the public page.</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files?.[0]);
        }}
        className="relative mt-3 aspect-[16/7] overflow-hidden rounded-xl border border-dashed border-line bg-surface"
      >
        {menu.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={menu.cover_image_url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            Drop an image here or use the button below
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs">
            Uploading…
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <label className="btn-secondary cursor-pointer">
          {menu.cover_image_url ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
            className="hidden"
          />
        </label>
        {menu.cover_image_url && (
          <button onClick={() => adapter.clearCover()} className="btn-danger">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
