"use client";

import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";
import { GripIcon, PlusIcon, TrashIcon, UploadIcon } from "@/components/icons";
import type { EditorAdapter, EditorCategory, EditorMenu, EditorProduct, Selection } from "./types";

export default function Canvas({
  menu,
  adapter,
  selection,
  setSelection,
}: {
  menu: EditorMenu;
  adapter: EditorAdapter;
  selection: Selection;
  setSelection: (s: Selection) => void;
}) {
  const [newCat, setNewCat] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeKind, setActiveKind] = useState<"category" | "product" | null>(null);

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    setActiveId(id);
    setActiveKind(menu.categories.some((c) => c.id === id) ? "category" : "product");
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    setActiveKind(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Category reorder
    const fromCatIdx = menu.categories.findIndex((c) => c.id === activeId);
    const toCatIdx = menu.categories.findIndex((c) => c.id === overId);
    if (fromCatIdx !== -1 && toCatIdx !== -1) {
      const reordered = arrayMove(menu.categories, fromCatIdx, toCatIdx);
      adapter.reorderCategories(reordered.map((c) => c.id));
      return;
    }

    // Product reorder within same category
    const cat = menu.categories.find(
      (c) => c.products.some((p) => p.id === activeId) && c.products.some((p) => p.id === overId)
    );
    if (cat) {
      const from = cat.products.findIndex((p) => p.id === activeId);
      const to = cat.products.findIndex((p) => p.id === overId);
      const reordered = arrayMove(cat.products, from, to);
      adapter.reorderProducts(cat.id, reordered.map((p) => p.id));
    }
  }

  const activeProduct =
    activeKind === "product"
      ? menu.categories.flatMap((c) => c.products).find((p) => p.id === activeId)
      : null;
  const activeCategory =
    activeKind === "category" ? menu.categories.find((c) => c.id === activeId) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <div className="label-eyebrow">Canvas</div>
        <h2 className="text-2xl font-semibold tracking-tighter2">{menu.name}</h2>
        <p className="mt-1 text-sm text-muted">
          Drag the handle to reorder. Click an item to edit it on the right.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const name = newCat.trim();
          if (!name) return;
          adapter.addCategory(name);
          setNewCat("");
        }}
        className="card flex gap-2 p-3"
      >
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Add a section — e.g. Starters"
          className="input"
        />
        <button type="submit" className="btn-primary">
          <PlusIcon /> Add
        </button>
      </form>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {menu.categories.length === 0 ? (
          <Empty />
        ) : (
          <SortableContext items={menu.categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-5">
              {menu.categories.map((c) => (
                <CategoryBlock
                  key={c.id}
                  category={c}
                  adapter={adapter}
                  selection={selection}
                  setSelection={setSelection}
                />
              ))}
            </div>
          </SortableContext>
        )}

        <DragOverlay>
          {activeCategory && <CategoryGhost category={activeCategory} />}
          {activeProduct && <ProductGhost product={activeProduct} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Empty() {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 py-20 text-center">
      <p className="text-base font-medium tracking-tightish">No sections yet.</p>
      <p className="max-w-xs text-sm text-muted">
        Start by adding your first menu section above.
      </p>
    </div>
  );
}

function CategoryBlock({
  category,
  adapter,
  selection,
  setSelection,
}: {
  category: EditorCategory;
  adapter: EditorAdapter;
  selection: Selection;
  setSelection: (s: Selection) => void;
}) {
  const isSelected = selection?.type === "category" && selection.id === category.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`card overflow-hidden transition ${isSelected ? "ring-1 ring-focus" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelection({ type: "category", id: category.id });
      }}
    >
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="icon-btn h-7 w-7 cursor-grab active:cursor-grabbing"
          aria-label="Drag section"
        >
          <GripIcon />
        </button>
        <input
          defaultValue={category.name}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== category.name) adapter.updateCategory(category.id, { name: v });
          }}
          className="input-bare flex-1 text-base font-semibold tracking-tightish"
        />
        <span className="label-eyebrow">{category.products.length} items</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            adapter.addProduct(category.id);
          }}
          className="btn-secondary"
        >
          <PlusIcon /> Item
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this section?")) adapter.deleteCategory(category.id);
          }}
          className="btn-danger"
          title="Delete section"
        >
          <TrashIcon />
        </button>
      </header>

      <div className="p-3">
        {category.products.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">
            No items in this section yet.
          </p>
        ) : (
          <SortableContext items={category.products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1.5">
              {category.products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  adapter={adapter}
                  selected={selection?.type === "product" && selection.id === p.id}
                  onSelect={() => setSelection({ type: "product", id: p.id })}
                />
              ))}
            </ul>
          </SortableContext>
        )}
      </div>
    </section>
  );
}

function ProductRow({
  product,
  adapter,
  selected,
  onSelect,
}: {
  product: EditorProduct;
  adapter: EditorAdapter;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files[0]) return;
      await adapter.uploadImage(product.id, files[0]);
    },
    [adapter, product.id]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...getRootProps({
        onClick: (e) => {
          e.stopPropagation();
          onSelect();
        },
        className: `group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition cursor-pointer ${
          selected ? "border-focus bg-elevated" : "border-line bg-surface hover:border-focus hover:bg-elevated"
        } ${isDragActive ? "ring-1 ring-white/30" : ""}`,
      })}
    >
      <input {...getInputProps()} />
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="icon-btn h-7 w-7 cursor-grab opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag item"
      >
        <GripIcon />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-elevated"
        title="Replace image"
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dim">
            <UploadIcon size={14} />
          </div>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <div className="truncate text-sm font-medium tracking-tightish">{product.name}</div>
          {!product.available && (
            <span className="label-eyebrow rounded-full bg-elevated px-2 py-0.5 text-dim">
              hidden
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-0.5 truncate text-xs text-muted">{product.description}</p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <div className="text-sm font-medium tabular-nums">${Number(product.price).toFixed(2)}</div>
        {product.price_lbp != null && (
          <div className="text-[10px] tabular-nums text-dim">
            {Number(product.price_lbp).toLocaleString("en-US")} LBP
          </div>
        )}
      </div>
    </li>
  );
}

function CategoryGhost({ category }: { category: EditorCategory }) {
  return (
    <div className="card-elevated rounded-xl px-4 py-3 shadow-2xl">
      <div className="text-sm font-semibold">{category.name}</div>
      <div className="text-xs text-muted">{category.products.length} items</div>
    </div>
  );
}

function ProductGhost({ product }: { product: EditorProduct }) {
  return (
    <div className="card-elevated flex items-center gap-3 rounded-lg px-3 py-2.5 shadow-2xl">
      <div className="h-10 w-10 overflow-hidden rounded-md border border-line bg-canvas">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="text-sm font-medium">{product.name}</div>
    </div>
  );
}
