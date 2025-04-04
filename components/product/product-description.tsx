"use client";

import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import Prose from "components/prose";
import { Product, ProductVariant } from "lib/store/types";
import { useProduct } from "./product-context";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: Product }) {
  const { updateOption } = useProduct();

  const handleVariantChange = (variant: ProductVariant) => {
    variant.selectedOptions.forEach(({ name, value }) => {
      updateOption(name, value);
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>
      {product.variants.length > 1 ? (
        <VariantSelector
          options={product.options}
          variants={product.variants}
          selectedVariant={product.variants[0]!}
          onVariantChange={handleVariantChange}
        />
      ) : null}
      {product.descriptionHtml ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.descriptionHtml}
        />
      ) : null}
      <AddToCart product={product} />
    </>
  );
}
