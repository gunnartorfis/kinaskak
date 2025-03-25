"use client";

import { Database } from "@/database.types";
import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { useProduct } from "components/product/product-context";
import { useActionState } from "react";
import { useCart } from "./cart-context";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

function SubmitButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Vara uppseld
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Bæta í körfu
      </button>
    );
  }

  return (
    <button
      aria-label="Bæta í körfu"
      className={clsx(buttonClasses, {
        "hover:opacity-90": true,
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Bæta í körfu
    </button>
  );
}

export function AddToCart({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant;
}) {
  const { is_available: availableForSale } = product;
  const { addItem: addCartItem } = useCart();
  const { state } = useProduct();
  const [message, formAction] = useActionState(
    addItem,
    "Villa að bæta í körfu"
  );

  return (
    <form
      action={async () => {
        if (variant.id) {
          await addItem(variant.id);
          addCartItem({
            product_id: product.id,
            quantity: 1,
            variant_id: variant.id,
          });
        }
      }}
    >
      <SubmitButton
        availableForSale={availableForSale ?? false}
        selectedVariantId={variant.id}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
