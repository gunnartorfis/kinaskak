import CartSummary from "@/components/cart-summary";
import ShippingForm from "@/components/shipping-form";
import { getCartItems } from "@/serverFns/cart";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/$cartId/information")({
  component: RouteComponent,
  loader: ({ params }) => getCartItems({ data: { cartId: params.cartId } }),
});

function RouteComponent() {
  const { cartId } = useParams({ from: "/checkout/$cartId/information" });

  return (
    <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-0 pb-16 pt-8 lg:t-16 max-w-screen-lg mx-auto">
      <div className="flex-1">
        <ShippingForm cartId={cartId} />
      </div>
      <div className="flex-1">
        <CartSummary />
      </div>
    </div>
  );
}
