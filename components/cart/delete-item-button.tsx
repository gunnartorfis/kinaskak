"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { useCart } from "./cart-context";

type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const DeleteItemButton = ({
  variant,
}: {
  variant: DbProductVariant;
}) => {
  const { removeItem } = useCart();

  return (
    <Button
      aria-label="Remove cart item"
      onClick={() => removeItem(variant.id)}
      variant="outline"
      size="icon"
    >
      X
    </Button>
  );
};
