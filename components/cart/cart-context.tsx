"use client";

import { Product, ProductVariant } from "lib/store/types";
import { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "./actions";

export type CartState = {
  lines: {
    merchandise: ProductVariant & {
      product: Product;
    };
    quantity: number;
  }[];
  totalQuantity: number;
  cost: {
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
  };
};

type CartContextType = {
  cart: CartState;
  addCartItem: (variant: ProductVariant, product: Product) => void;
  removeCartItem: (variantId: string) => void;
  updateCartItem: (variantId: string, quantity: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const defaultCartState: CartState = {
  lines: [],
  totalQuantity: 0,
  cost: {
    subtotalAmount: {
      amount: "0",
      currencyCode: "ISK",
    },
    totalAmount: {
      amount: "0",
      currencyCode: "ISK",
    },
    totalTaxAmount: {
      amount: "0",
      currencyCode: "ISK",
    },
  },
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(defaultCartState);

  // Load cart from database
  useEffect(() => {
    const loadCart = async () => {
      const cartData = await getCart();
      if (cartData) {
        setCart(cartData);
      }
    };

    loadCart();
  }, []);

  const addCartItem = async (variant: ProductVariant, product: Product) => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantId: variant.id,
        productId: product.id,
      }),
    });
    const cartData = await getCart();
    setCart(cartData ?? defaultCartState);
  };

  const removeCartItem = async (variantId: string) => {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantId,
      }),
    });
    const cartData = await getCart();
    setCart(cartData ?? defaultCartState);
  };

  const updateCartItem = async (variantId: string, quantity: number) => {
    await fetch("/api/cart/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        variantId,
        quantity,
      }),
    });
    const cartData = await getCart();
    setCart(cartData ?? defaultCartState);
  };

  return (
    <CartContext.Provider
      value={{ cart, addCartItem, removeCartItem, updateCartItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
