import { Database } from "@/database/database.types";
import React, { createContext, useContext } from "react";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export interface CartContextStateItem {
  product: DbProduct;
  variant: DbProductVariant;
  quantity: number;
}

interface CartContextState {
  items: CartContextStateItem[];
}

type AddItem = (
  args: Omit<CartContextState["items"][number], "quantityChange">
) => void;
type RemoveItem = (args: { productId: string; variantId: string }) => void;
type UpdateItemQuantity = (args: {
  productId: string;
  variantId: string;
  quantityChange: number;
}) => void;

const CartContext = createContext<
  | {
      cartId: string | null;
      setCartId: (cartId: string) => void;
      cart: CartContextState;
      addItem: AddItem;
      removeItem: RemoveItem;
      updateItemQuantity: UpdateItemQuantity;
    }
  | undefined
>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
  initialItems?: CartContextStateItem[];
  cartId: string | null;
}

export const CartProvider = ({
  children,
  initialItems,
  cartId: initialCartId,
}: CartProviderProps) => {
  const [cartId, setCartId] = React.useState<string | null>(initialCartId);
  const [cart, setCart] = React.useState<CartContextState>({
    items: initialItems ?? [],
  });

  const addItem: AddItem = (item) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (existingItem) =>
          existingItem.product.id === item.product.id &&
          existingItem.variant.id === item.variant.id
      );

      const newItems =
        existingItemIndex >= 0
          ? prevCart.items.map((existingItem, index) =>
              index === existingItemIndex
                ? {
                    ...existingItem,
                    quantity: existingItem.quantity + item.quantity,
                  }
                : existingItem
            )
          : [...prevCart.items, item];

      return {
        ...prevCart,
        items: newItems,
      };
    });
  };

  const removeItem: RemoveItem = (item) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter(
        (existingItem) =>
          existingItem.product.id !== item.productId ||
          existingItem.variant.id !== item.variantId
      ),
    }));
  };

  const updateItemQuantity: UpdateItemQuantity = ({
    productId,
    variantId,
    quantityChange,
  }) => {
    setCart((prevCart) => {
      return {
        ...prevCart,
        items: prevCart.items
          .map((existingItem) => {
            const newQuantity = existingItem.quantity + quantityChange;

            if (newQuantity <= 0) {
              return null;
            }

            return existingItem.product.id === productId &&
              existingItem.variant.id === variantId
              ? {
                  ...existingItem,
                  quantity: newQuantity,
                }
              : existingItem;
          })
          .filter((item) => !!item),
      };
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartId,
        setCartId,
        cart,
        addItem,
        removeItem,
        updateItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Helper hooks for derived state
export const useCartQuantity = () => {
  const { cart } = useCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};
