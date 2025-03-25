"use server";

import { CartState } from "@/components/cart/cart-context";
import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import { getProductById } from "@/lib/store/products";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

const VAT_RATE = 0.24; // 24% VAT rate for physical products in Iceland
const VAT_MULTIPLIER = 1 + VAT_RATE; // 1.24 for calculating tax-inclusive amounts

type StorageCartItem = {
  variantId: string;
  productId: string;
  quantity: number;
};

export const calculateCartTotals = async (
  items: StorageCartItem[]
): Promise<CartState> => {
  const cartItems = [];
  let totalQuantity = 0;

  // Fetch products and build cart items
  for (const item of items) {
    const product = await getProductById({ id: item.productId });
    if (!product) continue;

    const supabase = await createClient();
    const { data: variant } = await supabase
      .from("product_variants")
      .select("*")
      .eq("id", item.variantId)
      .single();

    if (variant) {
      cartItems.push({
        merchandise: {
          ...variant,
          product,
        },
        quantity: item.quantity,
      });
      totalQuantity += item.quantity;
    }
  }

  // Calculate totals
  const subtotalAmount = cartItems
    .reduce(
      (sum, item) =>
        sum + (item.merchandise.price_adjustment || 0) * item.quantity,
      0
    )
    .toFixed(2);

  // Calculate tax from the subtotal (tax is now included in the price)
  // For a 24% VAT rate, we divide by 1.24 to get the pre-tax amount
  const taxAmount = (
    parseFloat(subtotalAmount) -
    parseFloat(subtotalAmount) / VAT_MULTIPLIER
  ).toFixed(2);
  const totalAmount = subtotalAmount;

  return {
    items: cartItems,
    totalQuantity,
    status: "idle",
    cost: {
      subtotalAmount: {
        amount: subtotalAmount,
        currencyCode: "ISK",
      },
      totalAmount: {
        amount: totalAmount,
        currencyCode: "ISK",
      },
      totalTaxAmount: {
        amount: taxAmount,
        currencyCode: "ISK",
      },
    },
  };
};
