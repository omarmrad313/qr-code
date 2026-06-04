import MenuClient, { type PublicMenu } from "@/app/menu/[slug]/menu-client";

const menu: PublicMenu = {
  name: "Café Lamar",
  name_ar: "كافيه لمار",
  subtitle: "Sample menu preview",
  subtitle_ar: "معاينة قائمة الطعام",
  cover_image_url:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=700&fit=crop",
  background_image_url:
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&h=900&fit=crop",
  layout_style: "cards",
  categories: [
    {
      id: "starters",
      name: "Starters",
      name_ar: "المقبلات",
      items: [
        {
          id: "hummus",
          name: "Hummus Beiruti",
          name_ar: "حمص بيروتي",
          description: "Chickpea purée, tahini, lemon, garlic, olive oil",
          description_ar: "حمص بالطحينة، ليمون، ثوم، زيت زيتون",
          price: 8,
          price_lbp: 720000,
          image_url: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb8?w=240&h=240&fit=crop",
        },
        {
          id: "fattoush",
          name: "Fattoush Salad",
          name_ar: "فتوش",
          description: "Mixed greens, sumac, crisp pita, pomegranate molasses",
          description_ar: "خضار مشكلة، سماق، خبز محمص، دبس رمان",
          price: 10,
          price_lbp: 900000,
          image_url: null,
        },
      ],
    },
    {
      id: "mains",
      name: "Mains",
      name_ar: "الأطباق الرئيسية",
      items: [
        {
          id: "grill",
          name: "Mixed Grill",
          name_ar: "مشاوي مشكلة",
          description: "Shish taouk, kafta, lamb skewer, garlic sauce",
          description_ar: "شيش طاووق، كفتة، لحم مشوي، ثومية",
          price: 26,
          price_lbp: 2340000,
          image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=240&h=240&fit=crop",
        },
        {
          id: "sayadieh",
          name: "Sayadieh",
          name_ar: "صيادية",
          description: "Slow-cooked spiced fish over saffron rice",
          description_ar: "سمك متبل مع أرز بالزعفران",
          price: 22,
          price_lbp: 1980000,
          image_url: null,
        },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      name_ar: "الحلويات",
      items: [
        {
          id: "knafeh",
          name: "Knafeh",
          name_ar: "كنافة",
          description: "Warm cheese pastry, rose syrup, crushed pistachio",
          description_ar: "كنافة بالجبنة، قطر بماء الورد، فستق حلبي",
          price: 9,
          price_lbp: 810000,
          image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=240&h=240&fit=crop",
        },
      ],
    },
  ],
};

export default function PreviewMenu() {
  return <MenuClient menu={menu} />;
}
