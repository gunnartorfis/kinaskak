import { updateCartItemQuantity } from "@/lib/dal/cart";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CART_ID_COOKIE = "cartId";

const getCartId = async () => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;
  return cartId;
};

export async function POST(request: Request) {
  try {
    const { variantId, quantity } = await request.json();
    const cartId = await getCartId();

    if (!cartId) {
      return NextResponse.json({ error: "No cart found" }, { status: 404 });
    }

    await updateCartItemQuantity({
      cartId,
      variantId,
      quantity,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}
