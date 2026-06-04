export type EditorProduct = {
  id: string;
  name: string;
  name_ar: string | null;
  description: string;
  description_ar: string | null;
  price: number;
  price_lbp: number | null;
  image_url: string | null;
  available: boolean;
};

export type EditorCategory = {
  id: string;
  name: string;
  name_ar: string | null;
  products: EditorProduct[];
};

export type LayoutStyle = "list" | "cards" | "gallery";

export type EditorMenu = {
  id: string;
  name: string;
  name_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  slug: string;
  cover_image_url: string | null;
  background_image_url: string | null;
  layout_style: LayoutStyle;
  categories: EditorCategory[];
};

export type Selection =
  | { type: "menu" }
  | { type: "category"; id: string }
  | { type: "product"; id: string }
  | null;

export type MenuPatch = Partial<Pick<EditorMenu, "name" | "name_ar" | "subtitle" | "subtitle_ar" | "layout_style">>;
export type CategoryPatch = Partial<Pick<EditorCategory, "name" | "name_ar">>;

export interface EditorAdapter {
  updateMenu(patch: MenuPatch): void;
  addCategory(name: string): void;
  updateCategory(id: string, patch: CategoryPatch): void;
  deleteCategory(id: string): void;
  reorderCategories(orderedIds: string[]): void;
  addProduct(categoryId: string): void;
  updateProduct(id: string, patch: Partial<EditorProduct>): void;
  deleteProduct(id: string): void;
  reorderProducts(categoryId: string, orderedIds: string[]): void;
  uploadImage(productId: string, file: File): Promise<string>;
  uploadCover(file: File): Promise<string>;
  clearCover(): void;
  uploadBackground(file: File): Promise<string>;
  clearBackground(): void;
}
