import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import { Collection } from "./types";

export type DbProduct = Database["public"]["Tables"]["products"]["Row"];
export type DbProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];

const collections: Collection[] = [
  {
    handle: "jackets",
    title: "Jackets",
    description: "Our collection of premium jackets",
    seo: {
      title: "Jackets Collection",
      description: "Explore our premium collection of jackets",
    },
    updatedAt: new Date().toISOString(),
  },
];

export const getProduct = async ({
  handle,
}: {
  handle: string;
}): Promise<DbProduct | undefined> => {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("handle", handle)
    .single();

  return product || undefined;
};

export const getProductById = async ({
  id,
}: {
  id: string;
}): Promise<DbProduct | undefined> => {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return product || undefined;
};

export const getProductsByIds = async ({
  ids,
}: {
  ids: string[];
}): Promise<DbProduct[]> => {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  return products || [];
};

export const getProducts = async ({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<DbProduct[]> => {
  const supabase = await createClient();
  let productsQuery = supabase.from("products").select("*");

  if (query) {
    productsQuery = productsQuery.or(
      `name.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  if (sortKey) {
    const column =
      sortKey === "TITLE"
        ? "name"
        : sortKey === "CREATED_AT"
          ? "created_at"
          : "base_price";

    productsQuery = productsQuery.order(column, { ascending: !reverse });
  }

  const { data: products } = await productsQuery;

  return products || [];
};

export const getProductRecommendations = async ({
  productId,
}: {
  productId: string;
}): Promise<DbProduct[]> => {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .neq("id", productId)
    .limit(4);

  return products || [];
};

export const getCollectionProducts = async ({
  collection,
  sortKey,
  reverse,
}: {
  collection: string;
  sortKey?: string;
  reverse?: boolean;
}): Promise<DbProduct[]> => {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("name", collection)
    .single();

  if (!category) {
    return [];
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", category.id);

  if (!products?.length) {
    return [];
  }

  let sortedProducts = [...products];

  if (sortKey) {
    sortedProducts.sort((a, b) => {
      switch (sortKey) {
        case "TITLE":
          return reverse
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        case "PRICE":
          return reverse
            ? b.base_price - a.base_price
            : a.base_price - b.base_price;
        case "CREATED_AT":
          return reverse
            ? new Date(b.created_at || "").getTime() -
                new Date(a.created_at || "").getTime()
            : new Date(a.created_at || "").getTime() -
                new Date(b.created_at || "").getTime();
        default:
          return 0;
      }
    });
  }

  return sortedProducts;
};

export const getCollections = (): Promise<Collection[]> => {
  return Promise.resolve(collections);
};
