import { CART_ID_COOKIE } from "@/lib/constants";
import { getCartItems } from "@/lib/dal/cart";
import { cookies } from "next/headers";
import { CartProvider } from "./cart-context";

const CartProviderServer = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  const items = cartId ? await getCartItems(cartId) : [];
  const initialItems = items.map((item) => ({
    product: item.product,
    variant: item.variant,
    quantity: item.quantity,
  }));

  return <CartProvider initialItems={initialItems}>{children}</CartProvider>;
};

export default CartProviderServer;
