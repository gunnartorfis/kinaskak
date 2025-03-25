"use client";

import { Database } from "@/database.types";
import { createContext, useContext, useReducer } from "react";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

type CartItem = {
  merchandise: DbProductVariant & {
    product: DbProduct;
  };
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  status: "idle" | "loading" | "error";
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

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { merchandiseId: string } }
  | {
      type: "UPDATE_ITEM_QUANTITY";
      payload: { merchandiseId: string; quantity: number };
    }
  | { type: "SET_STATUS"; payload: CartState["status"] }
  | { type: "UPDATE_COST"; payload: CartState["cost"] };

const CartContext = createContext<
  | {
      cart: CartState;
      addItem: (item: CartItem) => void;
      removeItem: (merchandiseId: string) => void;
      updateItemQuantity: (merchandiseId: string, quantity: number) => void;
      updateCartItem: (merchandiseId: string, quantity: number) => void;
    }
  | undefined
>(undefined);

const calculateTotalQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

const calculateCost = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (total, item) =>
      total + (item.merchandise.price_adjustment || 0) * item.quantity,
    0
  );

  return {
    subtotalAmount: {
      amount: subtotal.toString(),
      currencyCode: "ISK",
    },
    totalAmount: {
      amount: subtotal.toString(),
      currencyCode: "ISK",
    },
    totalTaxAmount: {
      amount: "0",
      currencyCode: "ISK",
    },
  };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.merchandise.id === action.payload.merchandise.id
      );

      const newItems = existingItem
        ? state.items.map((item) =>
            item.merchandise.id === action.payload.merchandise.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.items, action.payload];

      return {
        ...state,
        items: newItems,
        totalQuantity: calculateTotalQuantity(newItems),
        cost: calculateCost(newItems),
      };
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.merchandise.id !== action.payload.merchandiseId
      );
      return {
        ...state,
        items: newItems,
        totalQuantity: calculateTotalQuantity(newItems),
        cost: calculateCost(newItems),
      };
    }
    case "UPDATE_ITEM_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.merchandise.id === action.payload.merchandiseId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: newItems,
        totalQuantity: calculateTotalQuantity(newItems),
        cost: calculateCost(newItems),
      };
    }
    case "SET_STATUS":
      return {
        ...state,
        status: action.payload,
      };
    case "UPDATE_COST":
      return {
        ...state,
        cost: action.payload,
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    status: "idle",
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
  });

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (merchandiseId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { merchandiseId } });
  };

  const updateItemQuantity = (merchandiseId: string, quantity: number) => {
    dispatch({
      type: "UPDATE_ITEM_QUANTITY",
      payload: { merchandiseId, quantity },
    });
  };

  const updateCartItem = updateItemQuantity;

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateItemQuantity, updateCartItem }}
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
