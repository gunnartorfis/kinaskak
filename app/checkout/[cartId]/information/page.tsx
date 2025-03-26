import CartSummary from "@/components/cart/cart-summary";
import ShippingForm from "@/components/checkout/shipping-form";
import { type FC } from "react";

interface CheckoutInformationPageProps {
  params: Promise<{
    cartId: string;
  }>;
}

const CheckoutInformationPage: FC<CheckoutInformationPageProps> = async ({
  params,
}) => {
  const { cartId } = await params;
  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-16 pt-8  lg:t-16 max-w-screen-lg mx-auto">
      <div className="flex-1">
        <ShippingForm cartId={cartId} />
      </div>
      <div className="flex-1">
        <CartSummary cartId={cartId} />
      </div>
    </div>
  );
};

export default CheckoutInformationPage;
