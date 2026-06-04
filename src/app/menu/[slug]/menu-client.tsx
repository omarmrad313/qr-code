"use client";

import { useEffect, useState } from "react";
import type { LayoutStyle } from "@/types";

export type PublicItem = {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  price_lbp: number | null;
  image_url: string | null;
};

export type PublicCategory = {
  id: string;
  name: string;
  name_ar: string | null;
  items: PublicItem[];
};

export type PublicMenu = {
  name: string;
  name_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  cover_image_url: string | null;
  background_image_url: string | null;
  layout_style: LayoutStyle;
  categories: PublicCategory[];
};

type Lang = "en" | "ar";

const pick = (en: string | null | undefined, ar: string | null | undefined, lang: Lang) =>
  lang === "ar" ? ar || en || "" : en || ar || "";

export default function MenuClient({ menu }: { menu: PublicMenu }) {
  const [lang, setLang] = useState<Lang>("en");
  const [activeCat, setActiveCat] = useState<string | null>(
    menu.categories[0]?.id ?? null
  );
  const dir = lang === "ar" ? "rtl" : "ltr";

  const cats = menu.categories;
  const hasArabic =
    !!menu.name_ar ||
    cats.some((c) => c.name_ar || c.items.some((i) => i.name_ar || i.description_ar));

  const layout: LayoutStyle = menu.layout_style || "cards";

  // Spy: highlight the active category in the sticky pill bar
  useEffect(() => {
    const ids = cats.map((c) => `cat-${c.id}`);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^cat-/, "");
          setActiveCat(id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [cats]);

  return (
    <div
      dir={dir}
      className="relative min-h-screen text-fg"
      style={{
        backgroundColor: "#0A0A0A",
        backgroundImage: menu.background_image_url
          ? `linear-gradient(rgba(10,10,10,0.78), rgba(10,10,10,0.78)), url(${menu.background_image_url})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 pb-24 md:px-6">
        {/* Inset hero/cover */}
        <header className="pt-5">
          {menu.cover_image_url ? (
            <div className="relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={menu.cover_image_url}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/30 to-transparent" />
              {(menu.name || menu.name_ar) && (
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h1 className="text-2xl font-extrabold tracking-tighter2 drop-shadow md:text-3xl">
                    {pick(menu.name, menu.name_ar, lang)}
                  </h1>
                  {(menu.subtitle || menu.subtitle_ar) && (
                    <p className="mt-1 text-sm text-muted drop-shadow">
                      {pick(menu.subtitle, menu.subtitle_ar, lang)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="label-eyebrow text-muted">
                {lang === "ar" ? "قائمة الطعام" : "Menu"}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tighter2 md:text-5xl">
                {pick(menu.name, menu.name_ar, lang)}
              </h1>
              {(menu.subtitle || menu.subtitle_ar) && (
                <p className="mt-2 text-sm text-muted">
                  {pick(menu.subtitle, menu.subtitle_ar, lang)}
                </p>
              )}
            </div>
          )}
        </header>

        {/* Category pills */}
        <nav className="mt-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 pb-1">
            {cats.map((c) => {
              const isActive = activeCat === c.id;
              return (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  onClick={() => setActiveCat(c.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gold text-canvas shadow-sm"
                      : "bg-elevated/80 text-muted hover:bg-elevated hover:text-fg"
                  }`}
                >
                  {pick(c.name, c.name_ar, lang)}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Sections */}
        <main className="mt-5 space-y-5">
          {cats.length === 0 ? (
            <p className="py-12 text-center text-muted">
              {lang === "ar" ? "قريباً" : "Menu coming soon."}
            </p>
          ) : (
            cats.map((c) => (
              <section
                key={c.id}
                id={`cat-${c.id}`}
                className="scroll-mt-4 rounded-3xl bg-surface/40 p-5 ring-1 ring-white/5 backdrop-blur md:p-6"
              >
                <h2 className="text-2xl font-extrabold tracking-tighter2 md:text-3xl">
                  {pick(c.name, c.name_ar, lang)}
                </h2>

                {layout === "list" ? (
                  <ListLayout items={c.items} lang={lang} />
                ) : layout === "gallery" ? (
                  <GalleryLayout items={c.items} lang={lang} />
                ) : (
                  <CardsLayout items={c.items} lang={lang} />
                )}
              </section>
            ))
          )}
        </main>

        <footer className="pt-12 text-center text-[10px] uppercase tracking-[0.25em] text-dim">
          Powered by QR Menu
        </footer>
      </div>

      {/* Floating language toggle */}
      {hasArabic && (
        <button
          onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
          className="fixed bottom-6 right-6 z-30 rounded-full bg-fg px-5 py-2.5 text-sm font-semibold text-canvas shadow-lg transition active:scale-95"
        >
          {lang === "en" ? "العربية" : "English"}
        </button>
      )}
    </div>
  );
}

/* ─── Layouts ─────────────────────────────────────────────── */

function CardsLayout({ items, lang }: { items: PublicItem[]; lang: Lang }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 md:gap-4">
      {items.map((p) => (
        <li key={p.id} className="space-y-2.5">
          <div className="aspect-square overflow-hidden rounded-2xl bg-elevated">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-dim">{lang === "ar" ? "بدون صورة" : "No Image"}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight md:text-base">
              {pick(p.name, p.name_ar, lang)}
            </h3>
            <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} />
            {(p.description || p.description_ar) && (
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                {pick(p.description, p.description_ar, lang)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListLayout({ items, lang }: { items: PublicItem[]; lang: Lang }) {
  return (
    <ul className="mt-5 space-y-5">
      {items.map((p) => (
        <li key={p.id} className="flex gap-4">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image_url}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-elevated text-[10px] text-dim">
              {lang === "ar" ? "بدون صورة" : "No Image"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tightish">
                {pick(p.name, p.name_ar, lang)}
              </h3>
              <div className="flex-1 border-b border-dotted border-line" />
              <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} />
            </div>
            {(p.description || p.description_ar) && (
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {pick(p.description, p.description_ar, lang)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function GalleryLayout({ items, lang }: { items: PublicItem[]; lang: Lang }) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-2xl bg-elevated">
          {p.image_url ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt="" className="aspect-[21/9] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-canvas/90 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-2xl font-bold tracking-tighter2">
                    {pick(p.name, p.name_ar, lang)}
                  </h3>
                  <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} large />
                </div>
                {(p.description || p.description_ar) && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {pick(p.description, p.description_ar, lang)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-2xl font-bold tracking-tighter2">
                  {pick(p.name, p.name_ar, lang)}
                </h3>
                <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} large />
              </div>
              {(p.description || p.description_ar) && (
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {pick(p.description, p.description_ar, lang)}
                </p>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ─── Price ───────────────────────────────────────────────── */

function PriceTag({
  usd,
  lbp,
  lang,
  large,
}: {
  usd: number;
  lbp: number | null;
  lang: Lang;
  large?: boolean;
}) {
  const lbpLabel = lang === "ar" ? "ل.ل" : "L.L";
  // Prefer LBP if entered; otherwise show USD.
  const primaryLbp = lbp != null;
  return (
    <div className="mt-1">
      {primaryLbp ? (
        <div className={`font-bold tabular-nums text-gold ${large ? "text-xl" : "text-sm md:text-base"}`}>
          {lbp.toLocaleString("en-US")} {lbpLabel}
        </div>
      ) : (
        <div className={`font-bold tabular-nums text-gold ${large ? "text-xl" : "text-sm md:text-base"}`}>
          ${usd.toFixed(2)}
        </div>
      )}
      {primaryLbp && usd > 0 && (
        <div className={`tabular-nums text-dim ${large ? "text-xs" : "text-[11px]"}`}>
          ${usd.toFixed(2)}
        </div>
      )}
    </div>
  );
}
