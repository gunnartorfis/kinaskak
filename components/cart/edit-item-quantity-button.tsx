"use client";

import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";
import { useActionState } from "react";
import { updateItemQuantity } from "./actions";
import { useCart } from "./cart-context";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

interface EditItemQuantityButtonProps {
  type: "plus" | "minus";
  product: DbProduct;
  variant: DbProductVariant;
  quantity: number;
}

export const EditItemQuantityButton = ({
  type,
  product,
  variant,
  quantity,
}: EditItemQuantityButtonProps) => {
  const { updateItemQuantity: updateLocalQuantity } = useCart();
  const [message, formAction] = useActionState(
    updateItemQuantity,
    "Villa að uppfæra magn"
  );

  const handleClick = async () => {
    const newQuantity = type === "plus" ? quantity + 1 : quantity - 1;

    if (variant.id) {
      updateLocalQuantity({
        product,
        variant,
        quantity: newQuantity,
      });
      await updateItemQuantity(variant.id, newQuantity);
    }
  };

  return (
    <>
      <Button
        aria-label={
          type === "plus" ? "Increase item quantity" : "Reduce item quantity"
        }
        onClick={handleClick}
        variant="outline"
        size="icon"
      >
        {type === "plus" ? "+" : "-"}
      </Button>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </>
  );
};
