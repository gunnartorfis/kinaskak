import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { removeCartItem } from "@/serverFns/cart";
import { X } from "lucide-react";

interface DeleteItemButtonProps {
  productId: string;
  variantId: string;
}

export const DeleteItemButton = ({
  productId,
  variantId,
}: DeleteItemButtonProps) => {
  const { removeItem } = useCart();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        removeItem({
          productId,
          variantId,
        });
        await removeCartItem({
          data: {
            productId,
            variantId,
          },
        });
      }}
    >
      <Button
        aria-label="Remove cart item"
        variant="outline"
        size="icon"
        className="size-6"
      >
        <X size={12} />
      </Button>
    </form>
  );
};
