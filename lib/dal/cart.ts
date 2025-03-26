import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import { getProductsByIds } from "@/lib/store/products";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
type DbCart = Database["public"]["Tables"]["carts"]["Row"];

interface CartItemWithDetails extends DbCartItem {
  product: DbProduct;
  variant: DbProductVariant;
}

interface CartTotals {
  subtotalAmount: {
    amount: string;
    currencyCode: string;
  };
  totalAmount: {
    amount: string;
    currencyCode: string;
  };
  totalTaxAmount: {
    amount: string;
    currencyCode: string;
  };
  totalQuantity: number;
}

const VAT_RATE = 0.24;
const VAT_MULTIPLIER = 1 + VAT_RATE;

export const getOrCreateCart = async (userId?: string): Promise<DbCart> => {
  const supabase = await createClient();

  // If user is logged in, try to find their cart
  if (userId) {
    const { data: existingCart } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingCart) {
      return existingCart;
    }
  }

  // Create a new cart
  const { data: newCart, error } = await supabase
    .from("carts")
    .insert([{ user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return newCart;
};

export const getCartItems = async (
  cartIdPromise: Promise<string> | string
): Promise<CartItemWithDetails[]> => {
  const cartId =
    typeof cartIdPromise === "string" ? cartIdPromise : await cartIdPromise;
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId);

  if (!items) return [];

  const productIds = items.map((item) => item.product_id!).filter(Boolean);
  const products = await getProductsByIds({ ids: productIds });
  const productsMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // Fetch all variants in parallel
  const variantIds = items.map((item) => item.variant_id!).filter(Boolean);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in("id", variantIds);
  const variantsMap = Object.fromEntries(
    (variants ?? []).map((v) => [v.id, v])
  );

  // Filter out items with missing products or variants
  return items
    .map((item) => ({
      ...item,
      product: productsMap[item.product_id ?? ""],
      variant: variantsMap[item.variant_id ?? ""],
    }))
    .filter(
      (item): item is CartItemWithDetails =>
        item.product !== undefined && item.variant !== undefined
    );
};

export const addToCart = async ({
  cartId,
  productId,
  variantId,
  quantity = 1,
}: {
  cartId: string;
  productId: string;
  variantId: string;
  quantity?: number;
}): Promise<void> => {
  const supabase = await createClient();

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("variant_id", variantId)
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);

    if (error) throw error;
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert([
      {
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      },
    ]);

    if (error) throw error;
  }
};

export const updateCartItemQuantity = async ({
  cartId,
  variantId,
  quantity,
}: {
  cartId: string;
  variantId: string;
  quantity: number;
}): Promise<void> => {
  const supabase = await createClient();

  if (quantity <= 0) {
    // Remove item
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("variant_id", variantId);

    if (error) throw error;
  } else {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cartId)
      .eq("variant_id", variantId);

    if (error) throw error;
  }
};

export const removeFromCart = async ({
  cartId,
  variantId,
}: {
  cartId: string;
  variantId: string;
}): Promise<void> => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("variant_id", variantId);

  if (error) throw error;
};

export const calculateCartTotals = async (
  cartId: string
): Promise<CartTotals> => {
  const items = await getCartItems(cartId);
  let totalQuantity = 0;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price =
      item.variant?.price_adjustment ?? item.product?.base_price ?? 0;
    const itemTotal = price * item.quantity;
    totalQuantity += item.quantity;
    return sum + itemTotal;
  }, 0);

  const subtotalAmount = subtotal.toFixed(2);
  const taxAmount = (subtotal - subtotal / VAT_MULTIPLIER).toFixed(2);
  const totalAmount = subtotalAmount;

  return {
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
    totalQuantity,
  };
};
