"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";

type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const EditItemQuantityButton = ({
  variant,
  quantity,
  onClick,
  type,
}: {
  variant: DbProductVariant;
  quantity: number;
  onClick: () => void;
  type: "plus" | "minus";
}) => {
  return (
    <Button
      aria-label={
        type === "plus" ? "Increase item quantity" : "Reduce item quantity"
      }
      onClick={onClick}
      variant="outline"
      size="icon"
    >
      {type === "plus" ? "+" : "-"}
    </Button>
  );
};
