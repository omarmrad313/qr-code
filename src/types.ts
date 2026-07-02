export type LayoutStyle = "list" | "cards" | "gallery" | "elegant";

export type Menu = {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  cover_image_url: string | null;
  cover_images: string[] | null;
  background_image_url: string | null;
  layout_style: LayoutStyle | null;
  accent_color: string | null;
  published: boolean | null;
  show_menu_name: boolean | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  menu_id: string;
  name: string;
  name_ar: string | null;
  sort_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  price: number;
  price_lbp: number | null;
  image_url: string | null;
  sort_order: number;
  available: boolean;
  created_at: string;
};
