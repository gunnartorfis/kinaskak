"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { CartModal } from "./modal";
import OpenCart from "./open-cart";

export const CartButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  return (
    <>
      <button onClick={() => setIsOpen(true)} aria-label="Open cart">
        <OpenCart quantity={cart.totalQuantity} />
      </button>
      <CartModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
