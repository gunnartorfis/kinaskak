import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import { Collection, Product, ProductVariant } from "./types";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

const transformVariant = (
  variant: DbProductVariant,
  productName: string
): ProductVariant => ({
  id: variant.id,
  title: variant.name || productName,
  availableForSale: variant.is_available ?? true,
  selectedOptions: [{ name: "Default", value: "Default" }],
  price: {
    amount: variant.price_adjustment?.toString() || "0",
    currencyCode: "ISK",
  },
});

const transformProduct = (
  product: DbProduct,
  variants: DbProductVariant[]
): Product => {
  const productVariants = variants.map((v) =>
    transformVariant(v, product.name)
  );

  const prices = productVariants.map((v) => parseFloat(v.price.amount));
  const minPrice = Math.min(...prices, product.base_price);
  const maxPrice = Math.max(...prices, product.base_price);

  return {
    id: product.id,
    handle: product.handle || product.id,
    availableForSale: product.is_available ?? true,
    title: product.name,
    description: product.description || "",
    descriptionHtml: product.description ? `<p>${product.description}</p>` : "",
    options: [
      {
        id: "default",
        name: "Default",
        values: ["Default"],
      },
    ],
    priceRange: {
      maxVariantPrice: {
        amount: maxPrice.toString(),
        currencyCode: "ISK",
      },
      minVariantPrice: {
        amount: minPrice.toString(),
        currencyCode: "ISK",
      },
    },
    variants: productVariants,
    featuredImage: {
      source: {
        type: "remote",
        url: product.image_url,
      },
      altText: product.name,
    },
    images: product.image_url
      ? [
          {
            source: {
              type: "remote",
              url: product.image_url,
            },
            altText: product.name,
          },
        ]
      : [],
    seo: {
      title: product.name,
      description: product.description || "",
    },
    tags: [],
    updatedAt: product.updated_at || new Date().toISOString(),
  };
};

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
}): Promise<Product | undefined> => {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("handle", handle)
    .single();

  if (!product) {
    return undefined;
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id);

  return transformProduct(product, variants || []);
};

export const getProductById = async ({
  id,
}: {
  id: string;
}): Promise<Product | undefined> => {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    return undefined;
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id);

  return transformProduct(product, variants || []);
};

export const getProductsByIds = async ({
  ids,
}: {
  ids: string[];
}): Promise<Product[]> => {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (!products?.length) {
    return [];
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in(
      "product_id",
      products.map((p) => p.id)
    );

  return products.map((product) =>
    transformProduct(
      product,
      (variants || []).filter((v) => v.product_id === product.id)
    )
  );
};

export const getProducts = async ({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
} = {}): Promise<Product[]> => {
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

  if (!products?.length) {
    return [];
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in(
      "product_id",
      products.map((p) => p.id)
    );

  return products.map((product) =>
    transformProduct(
      product,
      (variants || []).filter((v) => v.product_id === product.id)
    )
  );
};

export const getProductRecommendations = async ({
  productId,
}: {
  productId: string;
}): Promise<Product[]> => {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .neq("id", productId)
    .limit(4);

  if (!products?.length) {
    return [];
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in(
      "product_id",
      products.map((p) => p.id)
    );

  return products.map((product) =>
    transformProduct(
      product,
      (variants || []).filter((v) => v.product_id === product.id)
    )
  );
};

export const getCollectionProducts = async ({
  collection,
  sortKey,
  reverse,
}: {
  collection: string;
  sortKey?: string;
  reverse?: boolean;
}): Promise<Product[]> => {
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

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in(
      "product_id",
      products.map((p) => p.id)
    );

  let transformedProducts = products.map((product) =>
    transformProduct(
      product,
      (variants || []).filter((v) => v.product_id === product.id)
    )
  );

  if (sortKey) {
    transformedProducts.sort((a, b) => {
      switch (sortKey) {
        case "TITLE":
          return reverse
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        case "PRICE":
          return reverse
            ? parseFloat(b.priceRange.minVariantPrice.amount) -
                parseFloat(a.priceRange.minVariantPrice.amount)
            : parseFloat(a.priceRange.minVariantPrice.amount) -
                parseFloat(b.priceRange.minVariantPrice.amount);
        case "CREATED_AT":
          return reverse
            ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        default:
          return 0;
      }
    });
  }

  return transformedProducts;
};

export const getCollections = (): Promise<Collection[]> => {
  return Promise.resolve(collections);
};
