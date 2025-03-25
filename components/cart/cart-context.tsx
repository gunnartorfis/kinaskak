"use client";

import { Database } from "@/database.types";
import { createContext, useContext, useReducer } from "react";

type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export interface CartContextStateItem {
  product: DbProduct;
  variant: DbProductVariant;
  quantity: number;
}

interface CartContextState {
  items: CartContextStateItem[];
  status: "idle" | "loading" | "error";
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartContextStateItem }
  | { type: "REMOVE_ITEM"; payload: CartContextStateItem }
  | {
      type: "UPDATE_ITEM_QUANTITY";
      payload: CartContextStateItem;
    }
  | { type: "SET_STATUS"; payload: CartContextState["status"] }
  | { type: "SET_ITEMS"; payload: CartContextStateItem[] };

const CartContext = createContext<
  | {
      cart: CartContextState;
      addItem: (item: CartContextState["items"][number]) => void;
      removeItem: (item: CartContextState["items"][number]) => void;
      updateItemQuantity: (item: CartContextState["items"][number]) => void;
    }
  | undefined
>(undefined);

const cartReducer = (
  state: CartContextState,
  action: CartAction
): CartContextState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product.id === action.payload.product.id &&
          item.variant.id === action.payload.variant.id
      );

      const newItems =
        existingItemIndex >= 0
          ? state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + action.payload.quantity }
                : item
            )
          : [...state.items, action.payload];

      return {
        ...state,
        items: newItems,
      };
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) =>
          item.product.id !== action.payload.product.id &&
          item.variant.id !== action.payload.variant.id
      );
      return {
        ...state,
        items: newItems,
      };
    }
    case "UPDATE_ITEM_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.product.id === action.payload.product.id &&
        item.variant.id === action.payload.variant.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
      };
    }
    case "SET_STATUS":
      return {
        ...state,
        status: action.payload,
      };
    case "SET_ITEMS":
      return {
        ...state,
        items: action.payload,
      };
    default:
      return state;
  }
};

interface CartProviderProps {
  children: React.ReactNode;
  initialItems?: CartContextStateItem[];
}

export const CartProvider = ({
  children,
  initialItems = [],
}: CartProviderProps) => {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: initialItems,
    status: "idle",
  });

  const addItem = (item: CartContextState["items"][number]) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (item: CartContextState["items"][number]) => {
    dispatch({ type: "REMOVE_ITEM", payload: item });
  };

  const updateItemQuantity = (item: CartContextState["items"][number]) => {
    dispatch({
      type: "UPDATE_ITEM_QUANTITY",
      payload: item,
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateItemQuantity }}
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
