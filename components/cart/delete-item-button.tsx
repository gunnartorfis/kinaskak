"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";

type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const DeleteItemButton = ({
  variant,
  onClick,
}: {
  variant: DbProductVariant;
  onClick: () => void;
}) => {
  return (
    <Button
      aria-label="Remove cart item"
      onClick={onClick}
      variant="outline"
      size="icon"
    >
      X
    </Button>
  );
};
