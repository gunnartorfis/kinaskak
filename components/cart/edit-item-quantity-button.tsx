"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { useCart } from "./cart-context";

type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const EditItemQuantityButton = ({
  variant,
  quantity,
}: {
  variant: DbProductVariant;
  quantity: number;
}) => {
  const { updateItemQuantity } = useCart();

  return (
    <div className="flex gap-2">
      <Button
        aria-label="Reduce item quantity"
        onClick={() =>
          updateItemQuantity(variant.id, Math.max(0, quantity - 1))
        }
        variant="outline"
        size="icon"
      >
        -
      </Button>
      <span className="w-8 text-center">{quantity}</span>
      <Button
        aria-label="Increase item quantity"
        onClick={() => updateItemQuantity(variant.id, quantity + 1)}
        variant="outline"
        size="icon"
      >
        +
      </Button>
    </div>
  );
};
