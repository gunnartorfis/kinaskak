"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { useActionState } from "react";
import { removeItem } from "./actions";
import { useCart } from "./cart-context";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

interface DeleteItemButtonProps {
  product: DbProduct;
  variant: DbProductVariant;
}

export const DeleteItemButton = ({
  product,
  variant,
}: DeleteItemButtonProps) => {
  const { removeItem: removeLocalItem } = useCart();
  const [message, formAction] = useActionState(
    removeItem,
    "Villa að eyða vöru"
  );

  const handleClick = async () => {
    if (variant.id) {
      removeLocalItem({
        product,
        variant,
        quantity: 0,
      });
      await removeItem(variant.id);
    }
  };

  return (
    <>
      <Button
        aria-label="Remove cart item"
        onClick={handleClick}
        variant="outline"
        size="icon"
      >
        X
      </Button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </>
  );
};
