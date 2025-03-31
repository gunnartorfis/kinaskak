import { formatPrice } from "@/components/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Database } from "@/database/database.types";
import { upsertCartItem } from "@/serverFns/cart";
import { PlusIcon } from "lucide-react";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const ProductDescription = ({
  product,
  variant,
}: {
  product: DbProduct;
  variant: DbProductVariant;
}) => {
  const { addItem, cartId, setCartId } = useCart();

  return (
    <div className="mb-6 flex flex-col">
      <div className="mb-0">
        <h1 className="mb-2 text-4xl font-medium">{product.name}</h1>
      </div>
      <p className="mb-6 text-sm font-normal leading-6 text-neutral-500 dark:text-neutral-400">
        {product.description}
      </p>
      <Badge variant="outline" className="mb-4">
        {formatPrice(variant.price_adjustment ?? product.base_price, "ISK")}
      </Badge>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          addItem({
            product,
            variant,
            quantity: 1,
          });

          // we don't have variant selection yet
          const { cartId: newCartId } = await upsertCartItem({
            data: {
              cartId,
              productId: product.id,
              variantId: variant.id,
              quantityChange: 1,
            },
          });

          setCartId(newCartId);
        }}
      >
        <Button aria-label="Bæta í körfu" className="w-full">
          <div className="absolute left-0 ml-4">
            <PlusIcon className="size-5" />
          </div>
          Bæta í körfu
        </Button>
      </form>
    </div>
  );
};
