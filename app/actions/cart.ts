"use server";

import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import { getProductById } from "@/lib/store/products";
import { calculateCartTotals, formatCartTotals } from "@/lib/utils/cart";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];

type StorageCartItem = {
  variantId: string;
  productId: string;
  quantity: number;
};

export const calculateServerCartTotals = async (items: StorageCartItem[]) => {
  const productsMap: Record<string, DbProduct> = {};
  const variantsMap: Record<string, DbProductVariant> = {};
  const cartItems: DbCartItem[] = [];

  // Fetch products and variants in parallel
  await Promise.all(
    items.map(async (item) => {
      const [product, { data: variant }] = await Promise.all([
        getProductById({ id: item.productId }),
        (await createClient())
          .from("product_variants")
          .select("*")
          .eq("id", item.variantId)
          .single(),
      ]);

      if (product && variant) {
        productsMap[item.productId] = product;
        variantsMap[item.variantId] = variant;
        cartItems.push({
          id: crypto.randomUUID(), // Temporary ID for calculation
          cart_id: null,
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          created_at: null,
          updated_at: null,
        });
      }
    })
  );

  const totals = calculateCartTotals(cartItems, productsMap, variantsMap);
  return formatCartTotals(totals);
};
