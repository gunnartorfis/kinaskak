import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { upsertCartItem } from "@/serverFns/cart";

interface EditItemQuantityButtonProps {
  type: "plus" | "minus";
  productId: string;
  variantId: string;
}

export const EditItemQuantityButton = ({
  type,
  productId,
  variantId,
}: EditItemQuantityButtonProps) => {
  const {
    cartId,
    setCartId,
    updateItemQuantity: updateLocalQuantity,
  } = useCart();

  const handleClick = async () => {
    const quantityChange = type === "plus" ? 1 : -1;
    updateLocalQuantity({
      productId,
      variantId,
      quantityChange,
    });
    const { cartId: newCartId } = await upsertCartItem({
      data: {
        cartId,
        productId,
        variantId,
        quantityChange,
      },
    });

    setCartId(newCartId);
  };

  return (
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
  );
};
