import { getCartId } from "@/components/cart/actions";
import { getCartItems } from "@/lib/dal/cart";
import { CartProvider } from "./cart-context";

const CartProviderServer = ({ children }: { children: React.ReactNode }) => {
  const cartId = getCartId();
  const items = getCartItems(cartId);

  return (
    <CartProvider initialItems={items} id={cartId}>
      {children}
    </CartProvider>
  );
};

export default CartProviderServer;
