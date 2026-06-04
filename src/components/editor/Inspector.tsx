"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { TrashIcon, UploadIcon, XIcon } from "@/components/icons";
import type { EditorAdapter, EditorCategory, EditorMenu, EditorProduct, Selection } from "./types";

export default function Inspector({
  menu,
  adapter,
  selection,
  setSelection,
  selectedProduct,
  selectedCategory,
  onClose,
  mobileOpen,
}: {
  menu: EditorMenu;
  adapter: EditorAdapter;
  selection: Selection;
  setSelection: (s: Selection) => void;
  selectedProduct: EditorProduct | null;
  selectedCategory: EditorCategory | null;
  onClose: () => void;
  mobileOpen: boolean;
}) {
  const body = selectedProduct ? (
    <ProductInspector product={selectedProduct} adapter={adapter} setSelection={setSelection} />
  ) : selectedCategory ? (
    <CategoryInspector category={selectedCategory} adapter={adapter} setSelection={setSelection} />
  ) : (
    <MenuInspector menu={menu} adapter={adapter} />
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-l border-line bg-canvas md:block">
        <InspectorHeader selection={selection} onClose={() => setSelection({ type: "menu" })} desktop />
        <div className="p-5">{body}</div>
      </aside>

      {/* Mobile slide-up */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-canvas shadow-2xl transition-transform md:hidden ${
          mobileOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <InspectorHeader selection={selection} onClose={onClose} />
        <div className="p-5 pb-24">{body}</div>
      </div>
    </>
  );
}

function InspectorHeader({
  selection,
  onClose,
  desktop = false,
}: {
  selection: Selection;
  onClose: () => void;
  desktop?: boolean;
}) {
  const title =
    selection?.type === "product" ? "Item" : selection?.type === "category" ? "Section" : "Menu";
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-canvas/80 px-5 py-3 backdrop-blur">
      <div>
        <div className="label-eyebrow">Inspector</div>
        <div className="text-sm font-semibold tracking-tightish">{title}</div>
      </div>
      {!desktop && (
        <button onClick={onClose} className="icon-btn" aria-label="Close">
          <XIcon />
        </button>
      )}
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-eyebrow">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function BilingualField({
  label,
  en,
  enPlaceholder,
  ar,
  arPlaceholder,
  multiline,
  onChangeEn,
  onChangeAr,
}: {
  label: string;
  en: string;
  enPlaceholder?: string;
  ar: string;
  arPlaceholder?: string;
  multiline?: boolean;
  onChangeEn: (v: string) => void;
  onChangeAr: (v: string) => void;
}) {
  const EnTag = multiline ? "textarea" : "input";
  const ArTag = multiline ? "textarea" : "input";
  return (
    <div>
      <label className="label-eyebrow">{label}</label>
      <div className="mt-1.5 space-y-1.5">
        <div className="relative">
          <span className="pointer-events-none absolute right-2 top-1.5 rounded bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-dim">EN</span>
          <EnTag
            defaultValue={en}
            onBlur={(e: any) => onChangeEn(e.target.value)}
            placeholder={enPlaceholder}
            rows={multiline ? 3 : undefined}
            className={`input ${multiline ? "resize-none" : ""} pr-10`}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute right-2 top-1.5 rounded bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-dim">AR</span>
          <ArTag
            defaultValue={ar}
            onBlur={(e: any) => onChangeAr(e.target.value)}
            placeholder={arPlaceholder ?? "العربية (اختياري)"}
            dir="rtl"
            rows={multiline ? 3 : undefined}
            className={`input ${multiline ? "resize-none" : ""} pr-10 text-right`}
          />
        </div>
      </div>
    </div>
  );
}

function ProductInspector({
  product,
  adapter,
  setSelection,
}: {
  product: EditorProduct;
  adapter: EditorAdapter;
  setSelection: (s: Selection) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files[0]) return;
      setUploading(true);
      try {
        await adapter.uploadImage(product.id, files[0]);
      } finally {
        setUploading(false);
      }
    },
    [adapter, product.id]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="space-y-5">
      <Field label="Image">
        <div
          {...getRootProps()}
          className={`relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition ${
            isDragActive ? "border-fg bg-elevated" : "border-line bg-surface hover:border-focus"
          }`}
        >
          <input {...getInputProps()} />
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <UploadIcon />
              <span className="text-xs">Drop image or click</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas/70 text-xs">
              Uploading…
            </div>
          )}
        </div>
        {product.image_url && (
          <button
            onClick={() => adapter.updateProduct(product.id, { image_url: null })}
            className="mt-2 text-xs text-muted hover:text-fg"
          >
            Remove image
          </button>
        )}
      </Field>

      <BilingualField
        label="Name"
        en={product.name}
        ar={product.name_ar ?? ""}
        onChangeEn={(v) => {
          const t = v.trim();
          if (t && t !== product.name) adapter.updateProduct(product.id, { name: t });
        }}
        onChangeAr={(v) => {
          const t = v.trim() || null;
          if (t !== product.name_ar) adapter.updateProduct(product.id, { name_ar: t });
        }}
      />

      <BilingualField
        label="Description"
        multiline
        en={product.description}
        enPlaceholder="Optional"
        ar={product.description_ar ?? ""}
        onChangeEn={(v) => {
          if (v !== product.description) adapter.updateProduct(product.id, { description: v });
        }}
        onChangeAr={(v) => {
          const t = v || null;
          if (t !== product.description_ar) adapter.updateProduct(product.id, { description_ar: t });
        }}
      />

      <Field label="Price">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
              <input
                type="number"
                step="0.01"
                defaultValue={product.price}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v) && v !== product.price) adapter.updateProduct(product.id, { price: v });
                }}
                className="input pl-7"
              />
            </div>
            <p className="mt-1 text-[10px] text-dim">USD</p>
          </div>
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-muted">LBP</span>
              <input
                type="number"
                step="1"
                defaultValue={product.price_lbp ?? ""}
                onBlur={(e) => {
                  const raw = e.target.value.trim();
                  const v = raw === "" ? null : Number(raw);
                  if (raw !== "" && Number.isNaN(v as number)) return;
                  if (v !== product.price_lbp) adapter.updateProduct(product.id, { price_lbp: v });
                }}
                placeholder="Optional"
                className="input pr-12"
              />
            </div>
            <p className="mt-1 text-[10px] text-dim">Lebanese Lira</p>
          </div>
        </div>
      </Field>

      <Field label="Availability">
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-3 py-2.5">
          <span className="text-sm">Available to diners</span>
          <input
            type="checkbox"
            checked={product.available}
            onChange={(e) => adapter.updateProduct(product.id, { available: e.target.checked })}
            className="h-4 w-4"
          />
        </label>
      </Field>

      <div className="border-t border-line pt-4">
        <button
          onClick={() => {
            if (confirm("Delete this item?")) {
              adapter.deleteProduct(product.id);
              setSelection({ type: "menu" });
            }
          }}
          className="btn-danger w-full"
        >
          <TrashIcon /> Delete item
        </button>
      </div>
    </div>
  );
}

function CategoryInspector({
  category,
  adapter,
  setSelection,
}: {
  category: EditorCategory;
  adapter: EditorAdapter;
  setSelection: (s: Selection) => void;
}) {
  return (
    <div className="space-y-5">
      <BilingualField
        label="Name"
        en={category.name}
        ar={category.name_ar ?? ""}
        onChangeEn={(v) => {
          const t = v.trim();
          if (t && t !== category.name) adapter.updateCategory(category.id, { name: t });
        }}
        onChangeAr={(v) => {
          const t = v.trim() || null;
          if (t !== category.name_ar) adapter.updateCategory(category.id, { name_ar: t });
        }}
      />
      <Field label="Stats">
        <div className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-muted">
          {category.products.length} {category.products.length === 1 ? "item" : "items"}
        </div>
      </Field>
      <div className="border-t border-line pt-4">
        <button
          onClick={() => {
            if (confirm("Delete this section?")) {
              adapter.deleteCategory(category.id);
              setSelection({ type: "menu" });
            }
          }}
          className="btn-danger w-full"
        >
          <TrashIcon /> Delete section
        </button>
      </div>
    </div>
  );
}

function MenuInspector({ menu, adapter }: { menu: EditorMenu; adapter: EditorAdapter }) {
  const totalItems = menu.categories.reduce((s, c) => s + c.products.length, 0);
  return (
    <div className="space-y-5">
      <BilingualField
        label="Menu name"
        en={menu.name}
        ar={menu.name_ar ?? ""}
        onChangeEn={(v) => {
          const t = v.trim();
          if (t && t !== menu.name) adapter.updateMenu({ name: t });
        }}
        onChangeAr={(v) => {
          const t = v.trim() || null;
          if (t !== menu.name_ar) adapter.updateMenu({ name_ar: t });
        }}
      />

      <BilingualField
        label="Subtitle"
        en={menu.subtitle ?? ""}
        enPlaceholder="Optional tagline"
        ar={menu.subtitle_ar ?? ""}
        onChangeEn={(v) => {
          const t = v.trim() || null;
          if (t !== menu.subtitle) adapter.updateMenu({ subtitle: t });
        }}
        onChangeAr={(v) => {
          const t = v.trim() || null;
          if (t !== menu.subtitle_ar) adapter.updateMenu({ subtitle_ar: t });
        }}
      />

      <Field label="Overview">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-surface p-3">
            <div className="text-xs text-muted">Sections</div>
            <div className="mt-1 text-lg font-semibold">{menu.categories.length}</div>
          </div>
          <div className="rounded-lg border border-line bg-surface p-3">
            <div className="text-xs text-muted">Items</div>
            <div className="mt-1 text-lg font-semibold">{totalItems}</div>
          </div>
        </div>
      </Field>

      <p className="text-xs text-muted">
        Select a section or item on the canvas to edit it here.
      </p>
    </div>
  );
}
