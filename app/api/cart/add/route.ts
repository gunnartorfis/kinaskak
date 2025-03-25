import { addToCart, getOrCreateCart } from "@/lib/dal/cart";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const { variantId, productId } = await request.json();
    const cartId = await getCartId();

    await addToCart({
      cartId,
      productId,
      variantId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
