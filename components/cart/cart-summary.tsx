import { calculateCartTotals, getCartItems } from "@/lib/dal/cart";
import Image from "next/image";

interface CartSummaryProps {
  cartId: string;
}

const CartSummary = async ({ cartId }: CartSummaryProps) => {
  const [items, totals] = await Promise.all([
    getCartItems(cartId),
    calculateCartTotals(cartId),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative h-16 w-16 flex-none rounded-lg bg-muted">
              <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {item.quantity}
              </div>
              <Image
                src={item.product.image_url}
                alt={item.product.name}
                className="h-full w-full object-cover rounded-lg"
                width={64}
                height={64}
              />
            </div>
            <div className="flex flex-1 justify-between">
              <div>
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.variant.name}
                </p>
              </div>
              <p className="font-medium">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "ISK",
                  currencyDisplay: "narrowSymbol",
                }).format(
                  item.variant.price_adjustment ?? item.product.base_price
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Samtals · {totals.totalQuantity} vörur</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "ISK",
              currencyDisplay: "narrowSymbol",
            }).format(parseFloat(totals.subtotalAmount.amount))}
          </span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Sending</span>
          <span>Reiknað í næsta skrefi</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Þar af VSK</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "ISK",
              currencyDisplay: "narrowSymbol",
            }).format(parseFloat(totals.totalTaxAmount.amount))}
          </span>
        </div>
      </div>

      <div className="flex justify-between border-t pt-4">
        <span className="text-base font-medium">Samtals</span>
        <div className="text-right">
          <span className="text-lg font-medium">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: "ISK",
              currencyDisplay: "narrowSymbol",
            }).format(parseFloat(totals.totalAmount.amount))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
