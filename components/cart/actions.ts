"use server";

import { Database } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import {
  addToCart as addToCartDb,
  calculateCartTotals,
  getOrCreateCart,
  removeFromCart as removeFromCartDb,
  updateCartItemQuantity as updateCartItemQuantityDb,
} from "@/lib/dal/cart";
import {
  sendCompanyNotificationEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";
import { createCheckout } from "@/lib/rapyd/checkout";
import { getProductById, getProductsByIds } from "@/lib/store/products";
import { TAGS } from "lib/constants";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

const getCartId = async () => {
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
  productId: string
): Promise<DbProductVariant | null> => {
  const supabase = await createClient();
  const { data: variant } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .limit(1)
    .single();

  return variant;
};

export const addToCart = async (productId: string) => {
  const cartId = await getCartId();
  const product = await getProductById({ id: productId });
  if (!product) return;

  const variant = await getProductVariant(productId);
  if (!variant) return;

  await addToCartDb({
    cartId,
    productId,
    variantId: variant.id,
  });

  return calculateCartTotals(cartId);
};

export const removeFromCart = async (productId: string) => {
  const cartId = await getCartId();
  const product = await getProductById({ id: productId });
  if (!product) return;

  const variant = await getProductVariant(productId);
  if (!variant) return;

  await removeFromCartDb({
    cartId,
    variantId: variant.id,
  });

  return calculateCartTotals(cartId);
};

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number
) => {
  const cartId = await getCartId();
  const product = await getProductById({ id: productId });
  if (!product) return;

  const variant = await getProductVariant(productId);
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

export async function removeItem(merchandiseId: string | undefined) {
  if (!merchandiseId) {
    return "Missing product ID";
  }

  try {
    await removeFromCart(merchandiseId);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  merchandiseId: string | undefined,
  quantity: number
) {
  if (!merchandiseId) {
    return "Missing product ID";
  }

  try {
    await updateCartItemQuantity(merchandiseId, quantity);
    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout({ items }: { items: CheckoutItem[] }) {
  const products = await getProductsByIds({
    ids: items.map((item) => item.id),
  });

  const cartItems = await Promise.all(
    items.map(async ({ id, quantity }) => {
      const product = products.find((p) => p.id === id);
      if (!product) return null;

      const variant = await getProductVariant(product.id);
      const amount = variant?.price_adjustment ?? product.base_price;

      return {
        id,
        quantity,
        amount,
        name: product.name,
      };
    })
  );

  const validCartItems = cartItems.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  const totalAmount = validCartItems.reduce(
    (acc, item) => acc + item.quantity * item.amount,
    0
  );

  const merchantReferenceId = crypto.randomUUID();
  const checkout = await createCheckout({
    amount: totalAmount,
    description: "Cart",
    merchantReferenceId,
    completeCheckoutUrl: getBaseCheckoutRedirectUrl() + "/order-successful",
    cancelCheckoutUrl: getBaseCheckoutRedirectUrl() + "/order-error",
  });

  const orderDetails = {
    items: validCartItems,
    totalAmount,
    merchantReferenceId,
  };

  try {
    await Promise.all([
      sendOrderConfirmationEmail(orderDetails),
      sendCompanyNotificationEmail(orderDetails),
    ]);
  } catch (error) {
    console.error("Failed to send order emails:", error);
  }

  // Clear cart after successful checkout
  const cartId = await getCartId();
  const cookieStore = await cookies();
  cookieStore.delete(CART_ID_COOKIE);

  redirect(checkout.redirect_url);
}

const getBaseCheckoutRedirectUrl = () => {
  const url = process.env.NEXT_PUBLIC_VERCEL_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_VERCEL_URL is not set");
  }

  if (!url.startsWith("https://")) {
    return "https://" + url;
  }

  return url;
};
