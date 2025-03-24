"use server";

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

export interface CartItem {
  id: string;
  quantity: number;
  amount: number;
}

export interface CheckoutItem {
  id: string;
  quantity: number;
}

const CART_COOKIE = "cart";

const getCartFromCookie = async (): Promise<CartItem[]> => {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get(CART_COOKIE)?.value;
  return cartCookie ? JSON.parse(cartCookie) : [];
};

const setCartCookie = async (cart: CartItem[]) => {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(cart));
};

export const addToCart = async (productId: string) => {
  const cart = await getCartFromCookie();
  const product = await getProductById({ id: productId });

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1,
      amount: parseFloat(product?.variants[0]?.price.amount ?? "0"),
    });
  }

  await setCartCookie(cart);
  return cart;
};

export const removeFromCart = async (productId: string) => {
  const cart = await getCartFromCookie();
  const updatedCart = cart.filter((item) => item.id !== productId);
  await setCartCookie(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number
) => {
  const cart = await getCartFromCookie();

  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = quantity;
  }

  const updatedCart = cart.filter((item) => item.quantity > 0);
  await setCartCookie(updatedCart);
  return updatedCart;
};

export const getCart = async (): Promise<CartItem[]> => {
  return getCartFromCookie();
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
    const cart = await getCart();

    const lineItem = cart.find((line) => line.id === merchandiseId);

    if (lineItem) {
      await removeFromCart(merchandiseId);
      revalidateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
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
    const cart = await getCart();

    const lineItem = cart.find((line) => line.id === merchandiseId);

    if (lineItem) {
      if (quantity === 0) {
        await removeFromCart(merchandiseId);
      } else {
        await updateCartItemQuantity(merchandiseId, quantity);
      }
    } else if (quantity > 0) {
      await addToCart(merchandiseId);
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error updating item quantity";
  }
}

export async function createCart() {
  const cart = {
    id: crypto.randomUUID(),
  };

  return cart;
}

export async function createCartAndSetCookie() {
  let cart = await createCart();
  (await cookies()).set("cartId", cart.id!);
}

export async function redirectToCheckout({ items }: { items: CheckoutItem[] }) {
  const products = await getProductsByIds({
    ids: items.map((item) => item.id),
  });
  const cartItems = items.map(({ id, quantity }) => {
    const item = products.find((product) => product.id === id);
    const amount = item?.variants[0]?.price.amount ?? "0";
    return {
      id,
      quantity,
      amount: parseFloat(amount),
      name: item?.title ?? "Unknown Product",
    };
  });

  const totalAmount = cartItems.reduce(
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
    items: cartItems,
    totalAmount,
    merchantReferenceId,
  };

  try {
    // Send both emails in parallel
    await Promise.all([
      sendOrderConfirmationEmail(orderDetails),
      sendCompanyNotificationEmail(orderDetails),
    ]);
  } catch (error) {
    console.error("Failed to send order emails:", error);
    // Continue with checkout even if emails fail
  }

  // clear cart cookie
  const cookieStore = await cookies();
  cookieStore.delete("cart");

  redirect(checkout.redirect_url);
}

const getBaseCheckoutRedirectUrl = () => {
  const url = process.env.NEXT_PUBLIC_VERCEL_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_VERCEL_URL is not set");
  }

  // if the url doesn't start with https://, add it
  if (!url.startsWith("https://")) {
    return "https://" + url;
  }

  return url;
};
