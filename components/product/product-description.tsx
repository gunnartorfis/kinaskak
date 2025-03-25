"use client";

import { Badge } from "@/components/ui/badge";
import { Database } from "@/database.types";
import { useState } from "react";
import { AddToCart } from "../cart/add-to-cart";
import { VariantSelector } from "./variant-selector";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const ProductDescription = ({
  product,
  variants,
}: {
  product: DbProduct;
  variants: DbProductVariant[];
}) => {
  const [selectedVariant, setSelectedVariant] =
    useState<DbProductVariant | null>(variants[0] || null);

  return (
    <div className="mb-6 flex flex-col">
      <div className="mb-6">
        <h1 className="mb-2 text-5xl font-medium">{product.name}</h1>
        <Badge suppressHydrationWarning>
          {(
            selectedVariant?.price_adjustment ?? product.base_price
          ).toLocaleString("is-IS", {
            style: "currency",
            currency: "ISK",
          })}
        </Badge>
      </div>
      {variants.length > 1 ? (
        <VariantSelector
          variants={variants}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />
      ) : null}
      <p className="mb-6 text-sm font-normal leading-6 text-neutral-500 dark:text-neutral-400">
        {product.description}
      </p>
      {selectedVariant && (
        <AddToCart variant={selectedVariant} product={product} />
      )}
    </div>
  );
};
