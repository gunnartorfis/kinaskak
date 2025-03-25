"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";

type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const VariantSelector = ({
  variants,
  selectedVariant,
  setSelectedVariant,
}: {
  variants: DbProductVariant[];
  selectedVariant: DbProductVariant | null;
  setSelectedVariant: (variant: DbProductVariant) => void;
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-row gap-2">
        {variants.map((variant) => (
          <Button
            key={variant.id}
            onClick={() => setSelectedVariant(variant)}
            variant={selectedVariant?.id === variant.id ? "default" : "outline"}
          >
            {variant.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
