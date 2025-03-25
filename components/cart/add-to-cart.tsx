"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { useCart } from "./cart-context";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

const AddToCart = ({
  variant,
  product,
}: {
  variant: DbProductVariant;
  product: DbProduct;
}) => {
  const { addItem } = useCart();

  const addToCart = () => {
    addItem({
      merchandise: {
        ...variant,
        product,
      },
      quantity: 1,
    });
  };

  return (
    <Button aria-label="Add to cart" onClick={addToCart} className="w-full">
      Add to cart
    </Button>
  );
};

export default AddToCart;
