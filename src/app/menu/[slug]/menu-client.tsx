"use client";

import { useEffect, useRef, useState } from "react";
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
  cover_images: string[];
  background_image_url: string | null;
  layout_style: LayoutStyle;
  accent_color: string;
  show_menu_name: boolean;
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

  // Force the body background to white for the public menu so iOS overscroll,
  // bottom safe-area, and short pages all render true white (instead of the
  // admin's dark canvas bleeding through).
  useEffect(() => {
    const prevBody = document.body.style.background;
    const prevHtml = document.documentElement.style.background;
    document.body.style.background = "#FFFFFF";
    document.documentElement.style.background = "#FFFFFF";
    return () => {
      document.body.style.background = prevBody;
      document.documentElement.style.background = prevHtml;
    };
  }, []);

  const cats = menu.categories;
  const hasArabic =
    !!menu.name_ar ||
    cats.some((c) => c.name_ar || c.items.some((i) => i.name_ar || i.description_ar));

  const layout: LayoutStyle = menu.layout_style || "cards";
  const accent = menu.accent_color || "#C99852";

  // Spy: highlight the active category in the sticky pill bar as you scroll.
  // Paused briefly after a pill click so the click's chosen state isn't
  // immediately overridden while smooth-scrolling.
  const lockUntil = useRef(0);
  useEffect(() => {
    const ids = cats.map((c) => `cat-${c.id}`);
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return;
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
      className="relative min-h-screen bg-white text-neutral-900"
    >
      {/* Background image — fixed <img> instead of CSS bg-attachment which is
          buggy on iOS Safari (was dimming uploads). z-0 sits above the parent
          bg-white so the image is fully visible; content gets z-10. */}
      {menu.background_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={menu.background_image_url}
          alt=""
          aria-hidden
          className="pointer-events-none fixed inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        />
      )}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 md:px-6">
        {/* Inset hero/cover (slideshow) */}
        <header className="pt-5">
          {menu.cover_images.length > 0 ? (
            <CoverSlideshow
              images={menu.cover_images}
              title={menu.show_menu_name ? pick(menu.name, menu.name_ar, lang) : ""}
              subtitle={
                menu.show_menu_name ? pick(menu.subtitle, menu.subtitle_ar, lang) : ""
              }
            />
          ) : menu.show_menu_name ? (
            <div className="py-8 text-center">
              <p className="label-eyebrow text-neutral-500">
                {lang === "ar" ? "قائمة الطعام" : "Menu"}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tighter2 text-neutral-900 md:text-5xl">
                {pick(menu.name, menu.name_ar, lang)}
              </h1>
              {(menu.subtitle || menu.subtitle_ar) && (
                <p className="mt-2 text-sm text-neutral-500">
                  {pick(menu.subtitle, menu.subtitle_ar, lang)}
                </p>
              )}
            </div>
          ) : null}
        </header>

        {/* Category pills — sticky so they stay reachable while scrolling */}
        <nav
          className="sticky top-0 z-20 -mx-4 mt-5 overflow-x-auto bg-white/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
          }}
        >
          <div className="flex gap-2 pb-1">
            {cats.map((c) => {
              const isActive = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCat(c.id);
                    lockUntil.current = Date.now() + 900;
                    const el = document.getElementById(`cat-${c.id}`);
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 72;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-150 active:scale-[0.96] ${
                    isActive
                      ? "bg-neutral-900 text-white shadow-md"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {pick(c.name, c.name_ar, lang)}
                </button>
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
                className={
                  layout === "elegant"
                    ? "scroll-mt-20 py-2"
                    : "scroll-mt-20 rounded-3xl bg-neutral-300/80 p-5 text-neutral-900 backdrop-blur md:p-6"
                }
              >
                <h2 className="text-2xl font-extrabold tracking-tighter2 text-neutral-900 md:text-3xl">
                  {pick(c.name, c.name_ar, lang)}
                </h2>

                {layout === "list" ? (
                  <ListLayout items={c.items} lang={lang} accent={accent} />
                ) : layout === "gallery" ? (
                  <GalleryLayout items={c.items} lang={lang} accent={accent} />
                ) : layout === "elegant" ? (
                  <ElegantLayout items={c.items} lang={lang} accent={accent} />
                ) : (
                  <CardsLayout items={c.items} lang={lang} accent={accent} />
                )}
              </section>
            ))
          )}
        </main>

        <footer className="pt-12 text-center text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Powered by QR Menu
        </footer>
      </div>

      {/* Floating language toggle */}
      {hasArabic && (
        <button
          onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
          className="fixed bottom-6 right-6 z-30 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl transition active:scale-95"
        >
          {lang === "en" ? "العربية" : "English"}
        </button>
      )}
    </div>
  );
}

/* ─── Cover slideshow ─────────────────────────────────────── */

function CoverSlideshow({
  images,
  title,
  subtitle,
}: {
  images: string[];
  title: string;
  subtitle: string;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + i}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-canvas/40 to-transparent" />
      {(title || subtitle) && (
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="text-2xl font-extrabold tracking-tighter2 drop-shadow md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted drop-shadow">{subtitle}</p>}
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Layouts ─────────────────────────────────────────────── */

function CardsLayout({ items, lang, accent }: { items: PublicItem[]; lang: Lang; accent: string }) {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 md:gap-4">
      {items.map((p) => (
        <li key={p.id} className="space-y-2.5">
          <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-neutral-400">{lang === "ar" ? "بدون صورة" : "No Image"}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-neutral-900 md:text-base">
              {pick(p.name, p.name_ar, lang)}
            </h3>
            <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} accent={accent} />
            {(p.description || p.description_ar) && (
              <p className="mt-1 line-clamp-2 text-xs text-neutral-900">
                {pick(p.description, p.description_ar, lang)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListLayout({ items, lang, accent }: { items: PublicItem[]; lang: Lang; accent: string }) {
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
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[10px] text-neutral-400">
              {lang === "ar" ? "بدون صورة" : "No Image"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold tracking-tightish text-neutral-900">
                {pick(p.name, p.name_ar, lang)}
              </h3>
              <div className="flex-1 border-b border-dotted border-neutral-300" />
              <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} accent={accent} />
            </div>
            {(p.description || p.description_ar) && (
              <p className="mt-1 text-sm leading-relaxed text-neutral-900">
                {pick(p.description, p.description_ar, lang)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function GalleryLayout({ items, lang, accent }: { items: PublicItem[]; lang: Lang; accent: string }) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((p) => (
        <li key={p.id} className="overflow-hidden rounded-2xl bg-neutral-100">
          {p.image_url ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt="" className="aspect-[21/9] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-2xl font-bold tracking-tighter2">
                    {pick(p.name, p.name_ar, lang)}
                  </h3>
                  <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} accent={accent} large />
                </div>
                {(p.description || p.description_ar) && (
                  <p className="mt-1 text-sm leading-relaxed text-white/80">
                    {pick(p.description, p.description_ar, lang)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 text-neutral-900">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-2xl font-bold tracking-tighter2">
                  {pick(p.name, p.name_ar, lang)}
                </h3>
                <PriceTag usd={p.price} lbp={p.price_lbp} lang={lang} accent={accent} large />
              </div>
              {(p.description || p.description_ar) && (
                <p className="mt-1 text-sm leading-relaxed text-neutral-900">
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

function ElegantLayout({ items, lang, accent }: { items: PublicItem[]; lang: Lang; accent: string }) {
  return (
    <ul className="mt-4 divide-y divide-neutral-200">
      {items.map((p) => (
        <li key={p.id} className="flex items-center gap-4 py-5">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.image_url}
              alt=""
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[10px] text-neutral-400">
              {lang === "ar" ? "بدون صورة" : "No Image"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-semibold text-neutral-900">
                {pick(p.name, p.name_ar, lang)}
              </h3>
              {(p.description || p.description_ar) && (
                <span className="text-[11px] uppercase tracking-widest text-neutral-500">
                  {pick(p.description, p.description_ar, lang)}
                </span>
              )}
            </div>
            <div className="mt-2 text-base font-medium tabular-nums text-neutral-900">
              {p.price_lbp != null
                ? `${lang === "ar" ? "ل.ل" : "L£"}${p.price_lbp.toLocaleString("en-US")}`
                : `$${p.price.toFixed(2)}`}
            </div>
          </div>
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
  accent,
  large,
}: {
  usd: number;
  lbp: number | null;
  lang: Lang;
  accent: string;
  large?: boolean;
}) {
  const lbpLabel = lang === "ar" ? "ل.ل" : "L.L";
  const primaryLbp = lbp != null;
  return (
    <div className="mt-1">
      <div className={`font-bold tabular-nums text-neutral-900 ${large ? "text-xl" : "text-sm md:text-base"}`}>
        {primaryLbp ? `${lbp.toLocaleString("en-US")} ${lbpLabel}` : `$${usd.toFixed(2)}`}
      </div>
      {primaryLbp && usd > 0 && (
        <div className={`tabular-nums text-neutral-700 ${large ? "text-xs" : "text-[11px]"}`}>
          ${usd.toFixed(2)}
        </div>
      )}
    </div>
  );
}
