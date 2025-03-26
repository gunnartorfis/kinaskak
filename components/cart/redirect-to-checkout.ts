import { getCartItems } from "@/lib/dal/cart";
import { createCheckoutRecord } from "@/lib/dal/checkout";
import { createCheckout } from "@/lib/rapyd/checkout";
import {
  ShippingFormData,
  shippingFormSchema,
} from "@/lib/validations/shipping";
import { redirect } from "next/navigation";

export async function redirectToCheckout(_: any, formData: FormData) {
  // Store checkout data in database
  try {
    const data = {
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      kennitala: formData.get("kennitala"),
      address: formData.get("address"),
      apartment: formData.get("apartment"),
      city: formData.get("city"),
      saveInfo: formData.get("saveInfo") === "on",
      marketingOptIn: formData.get("marketingOptIn") === "on",
    };

    const cartId = formData.get("cartId") as string;

    const validationResult = shippingFormSchema.safeParse(data);

    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof ShippingFormData, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof ShippingFormData;
        fieldErrors[path] = issue.message;
      });
      return { errors: fieldErrors };
    }

    if (!validationResult.success) {
      return { error: "Villa í innslegnum upplýsingum" };
    }

    const cartItems = await getCartItems(cartId);

    const totalAmount = cartItems.reduce(
      (acc, item) =>
        acc +
        item.quantity *
          (item.variant.price_adjustment ?? item.product.base_price),
      0
    );

    const merchantReferenceId = crypto.randomUUID();

    const orderDetails = {
      items: cartItems,
      totalAmount,
      shippingDetails: validationResult.data,
      merchantReferenceId,
    };

    const checkout = await createCheckout({
      amount: totalAmount,
      description: "Cart",
      merchantReferenceId,
      completeCheckoutUrl: getBaseCheckoutRedirectUrl() + "/order-successful",
      cancelCheckoutUrl: getBaseCheckoutRedirectUrl() + "/order-error",
      metadata: {
        orderDetails,
      },
    });

    const checkoutRecord = await createCheckoutRecord({
      cartId,
      merchantReferenceId,
      checkoutId: checkout.id,
      amount: totalAmount,
      shippingDetails: validationResult.data,
    });

    redirect(`${checkout.redirect_url}?checkoutId=${checkoutRecord.id}`);
  } catch (error) {
    console.error("Failed to store checkout data:", error);
    return { error: "Villa kom upp við að vista pöntunarupplýsingar" };
  }
}

const getBaseCheckoutRedirectUrl = () => {
  const url = process.env.NEXT_PUBLIC_VERCEL_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_VERCEL_URL is not set");
  }

  if (!url.startsWith("https://")) {
    return "https://" + url;
  }

  return url;
};
