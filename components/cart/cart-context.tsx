"use client";

import { Database } from "@/database.types";
import { createContext, useContext, useReducer } from "react";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbCart = Database["public"]["Tables"]["carts"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];

type CartContextStateItem = Pick<
  DbCartItem,
  "product_id" | "quantity" | "variant_id"
>;

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
          item.product_id === action.payload.product_id &&
          item.variant_id === action.payload.variant_id
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
          item.product_id !== action.payload.product_id &&
          item.variant_id !== action.payload.variant_id
      );
      return {
        ...state,
        items: newItems,
      };
    }
    case "UPDATE_ITEM_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.product_id === action.payload.product_id &&
        item.variant_id === action.payload.variant_id
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

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
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
