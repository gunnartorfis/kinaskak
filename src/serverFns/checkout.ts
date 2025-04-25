import { Database, Json } from "@/database/database.types";
import { makeRequest } from "@/lib/rapyd/make-rapyd-request";
import { getSupabaseServerClient } from "@/lib/supabase";
import {
  ShippingFormData,
  shippingFormSchema,
} from "@/lib/validations/shipping";
import { getCartItems } from "@/serverFns/cart";
import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import { z } from "zod";

const Redirect = z.object({
  redirectUrl: z.string(),
});

export const handleCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    shippingFormSchema.extend({ cartId: z.string() }).parse(data)
  )
  .handler(async ({ data: { cartId, ...shippingDetails } }) => {
    const cartItems = await getCartItems({
      data: {
        cartId,
      },
    });

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
      shippingDetails,
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
      shippingDetails,
    });

    console.log("checkout redirect", checkout.redirect_url);

    return {
      redirectUrl: `${checkout.redirect_url}?checkoutId=${checkoutRecord.id}`,
    };

    // try {
    //   await notifyAdminViaEmail({
    //     data: {
    //       ...orderDetails,
    //       checkoutId: checkout.id,
    //     },
    //   });
    // } catch (error) {
    //   console.error(error);
    // }
  });

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

interface CreateCheckoutRecordParams {
  cartId: string;
  merchantReferenceId: string;
  checkoutId: string;
  amount: number;
  shippingDetails: ShippingFormData;
  metadata?: Json;
}

type CheckoutRecord = Database["public"]["Tables"]["checkouts"]["Row"];

const createCheckoutRecord = async ({
  cartId,
  merchantReferenceId,
  checkoutId,
  amount,
  shippingDetails,
  metadata,
}: CreateCheckoutRecordParams): Promise<CheckoutRecord> => {
  const supabase = await getSupabaseServerClient();

  const { data: checkout, error } = await supabase
    .from("checkouts")
    .insert({
      cart_id: cartId,
      merchant_reference_id: merchantReferenceId,
      checkout_id: checkoutId,
      amount,
      email: shippingDetails.email,
      first_name: shippingDetails.firstName,
      last_name: shippingDetails.lastName,
      kennitala: shippingDetails.kennitala,
      address: shippingDetails.address,
      apartment: shippingDetails.apartment,
      city: shippingDetails.city,
      save_info: shippingDetails.saveInfo,
      marketing_opt_in: shippingDetails.marketingOptIn,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create checkout record");
  }

  return checkout;
};

// Icelandic card payment methods
const ICELANDIC_PAYMENT_METHODS = [
  "is_visa_card",
  "is_mastercard_card",
] as const;

interface CheckoutResponse {
  id: string;
  redirect_url: string;
  status: string;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

interface CreateCheckoutParams {
  amount: number;
  merchantReferenceId: string;
  completeCheckoutUrl: string;
  cancelCheckoutUrl: string;
  description?: string;
  metadata?: Json;
}

const DEFAULT_CHECKOUT_CONFIG = {
  country: "IS",
  currency: "ISK",
} as const;

const createCheckout = async ({
  amount,
  merchantReferenceId,
  completeCheckoutUrl,
  cancelCheckoutUrl,
  description,
  metadata,
}: CreateCheckoutParams): Promise<CheckoutResponse> => {
  const checkoutBody = {
    amount,
    merchant_reference_id: merchantReferenceId,
    complete_checkout_url: completeCheckoutUrl,
    cancel_checkout_url: cancelCheckoutUrl,
    country: DEFAULT_CHECKOUT_CONFIG.country,
    currency: DEFAULT_CHECKOUT_CONFIG.currency,
    payment_method_types_include: ICELANDIC_PAYMENT_METHODS,
    custom_elements: {
      billing_address_collect: true,
    },
    metadata,
    ...(description && { description }),
  };

  const response = await makeRequest({
    method: "post",
    urlPath: "/v1/checkout",
    body: checkoutBody,
  });

  return response.body.data as unknown as CheckoutResponse;
};

const NotifyAdmin = z.object({
  checkoutId: z.string(),
  totalAmount: z.number(),
  shippingDetails: shippingFormSchema,
  merchantReferenceId: z.string(),
  items: z.array(z.any()),
});

const notifyAdminViaEmail = createServerFn()
  .validator((data: unknown) => NotifyAdmin.parse(data))
  .handler(async ({ data: orderDetails }) => {
    const emailUser = process.env.EMAIL_USER;
    const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailAppPassword) {
      throw new Error("Email configuration is missing");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailAppPassword,
      },
    });

    const itemsList = orderDetails.items
      .map(
        (item) =>
          `${item.product.name} - ${item.variant.name} x${item.quantity} - ${
            item.variant.price_adjustment ?? item.product.base_price
          } ISK`
      )
      .join("\n");

    const mailOptions = {
      from: emailUser,
      to: emailUser,
      subject: `New Order #${orderDetails.merchantReferenceId}`,
      html: `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderDetails.merchantReferenceId}</p>
      <p><strong>Checkout ID:</strong> ${orderDetails.checkoutId}</p>
      <p><strong>Total Amount:</strong> ${orderDetails.totalAmount} ISK</p>
      
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${orderDetails.shippingDetails.firstName} ${orderDetails.shippingDetails.lastName}</p>
      <p><strong>Email:</strong> ${orderDetails.shippingDetails.email}</p>
      <p><strong>Kennitala:</strong> ${orderDetails.shippingDetails.kennitala}</p>
      <p><strong>Address:</strong> ${orderDetails.shippingDetails.address}</p>
      <p><strong>Apartment:</strong> ${orderDetails.shippingDetails.apartment}</p>
      <p><strong>City:</strong> ${orderDetails.shippingDetails.city}</p>
      
      <h3>Order Items</h3>
      <pre>${itemsList}</pre>
    `,
    };

    await transporter.sendMail(mailOptions);
  });

export type { CheckoutResponse, CreateCheckoutParams };
