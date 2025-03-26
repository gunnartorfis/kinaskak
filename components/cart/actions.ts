import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import {
  addToCart as addToCartDb,
  calculateCartTotals,
  getOrCreateCart,
  removeFromCart as removeFromCartDb,
  updateCartItemQuantity as updateCartItemQuantityDb,
} from "@/lib/dal/cart";
import { TAGS } from "lib/constants";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export interface CartItem {
  id: string;
  quantity: number;
  amount: number;
}

export interface CheckoutItem {
  id: string;
  quantity: number;
}

const CART_ID_COOKIE = "cartId";

export const getCartId = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    const cart = await getOrCreateCart();
    cookieStore.set(CART_ID_COOKIE, cart.id);
    return cart.id;
  }

  return cartId;
};

const getProductVariant = async (
  variantId: string
): Promise<DbProductVariant | null> => {
  const supabase = await createClient();
  const { data: variant } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantId)
    .limit(1)
    .single();

  return variant;
};

export const addToCart = async (variantId: string) => {
  const cartId = await getCartId();
  const variant = await getProductVariant(variantId);
  if (!variant) return;
  await addToCartDb({
    cartId,
    productId: variant.product_id,
    variantId: variant.id,
  });

  return calculateCartTotals(cartId);
};

export const removeFromCart = async (variantId: string) => {
  const cartId = await getCartId();
  const variant = await getProductVariant(variantId);
  if (!variant) return;

  await removeFromCartDb({
    cartId,
    variantId: variant.id,
  });

  return calculateCartTotals(cartId);
};

export const updateCartItemQuantity = async (
  variantId: string,
  quantity: number
) => {
  const cartId = await getCartId();
  const variant = await getProductVariant(variantId);
  if (!variant) return;

  await updateCartItemQuantityDb({
    cartId,
    variantId: variant.id,
    quantity,
  });

  return calculateCartTotals(cartId);
};

export const getCart = async () => {
  const cartId = await getCartId();
  return calculateCartTotals(cartId);
};

export async function addItem(selectedVariantId: string | undefined) {
  if (!selectedVariantId) {
    return "Missing product variant ID";
  }

  try {
    await addToCart(selectedVariantId);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error adding item to cart";
  }
}

export async function removeItem(selectedVariantId: string | undefined) {
  if (!selectedVariantId) {
    return "Missing product variant ID";
  }

  try {
    await removeFromCart(selectedVariantId);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  variantId: string | undefined,
  quantity: number
) {
  if (!variantId) {
    return "Missing product variant ID";
  }

  try {
    await updateCartItemQuantity(variantId, quantity);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error updating item quantity";
  }
}
