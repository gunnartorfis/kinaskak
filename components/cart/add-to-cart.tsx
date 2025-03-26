"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { PlusIcon } from "@heroicons/react/24/outline";
import { addItem } from "components/cart/actions";
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
  if (!availableForSale) {
    return <Button disabled>Vara uppseld</Button>;
  }

  if (!selectedVariantId) {
    return (
      <Button aria-label="Please select an option" disabled>
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Bæta í körfu
      </Button>
    );
  }

  return (
    <Button aria-label="Bæta í körfu" className="w-full">
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Bæta í körfu
    </Button>
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
  const [message, formAction] = useActionState(
    addItem,
    "Villa að bæta í körfu"
  );

  return (
    <form
      action={async () => {
        if (variant.id) {
          addCartItem({
            product,
            quantity: 1,
            variant,
          });
          await addItem(variant.id);
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
