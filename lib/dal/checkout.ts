import { Database, Json } from "@/database.types";
import { createClient } from "@/db/supabase/server";
import { type ShippingFormData } from "@/lib/validations/shipping";
import "server-only";

interface CreateCheckoutParams {
  cartId: string;
  merchantReferenceId: string;
  checkoutId: string;
  amount: number;
  shippingDetails: ShippingFormData;
  metadata?: Json;
}

type CheckoutRecord = Database["public"]["Tables"]["checkouts"]["Row"];

export const createCheckoutRecord = async ({
  cartId,
  merchantReferenceId,
  checkoutId,
  amount,
  shippingDetails,
  metadata,
}: CreateCheckoutParams): Promise<CheckoutRecord> => {
  const supabase = await createClient();

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

export const updateCheckoutStatus = async (
  checkoutId: string,
  status: Database["public"]["Enums"]["checkout_status"]
) => {
  const supabase = await createClient();

  const { error } = await supabase
    .from("checkouts")
    .update({ status })
    .eq("checkout_id", checkoutId);

  if (error) {
    throw new Error("Failed to update checkout status");
  }
};
