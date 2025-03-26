"use client";

import { redirectToCheckout } from "@/components/cart/redirect-to-checkout";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type ShippingFormData } from "@/lib/validations/shipping";
import React, { useActionState, useState, type FC } from "react";
import { toast } from "sonner";

interface ShippingFormProps {
  cartId: string;
}

const ShippingForm: FC<ShippingFormProps> = ({ cartId }) => {
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingFormData, string>>
  >({});
  const [state, formAction, pending] = useActionState(redirectToCheckout, null);

  React.useEffect(() => {
    console.log(state);
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);
  return (
    <form className="space-y-6" action={formAction}>
      <input type="hidden" name="cartId" value={cartId} />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tengiliður</h2>
        <div>
          <Label htmlFor="email">Netfang eða símanúmer</Label>
          <input
            type="text"
            id="email"
            name="email"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="marketingOptIn" name="marketingOptIn" />
          <Label htmlFor="marketingOptIn">Senda mér fréttir og tilboð</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Heimilisfang</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Fornafn</Label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Eftirnafn</Label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="kennitala">Kennitala</Label>
          <input
            type="text"
            id="kennitala"
            name="kennitala"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
          {errors.kennitala && (
            <p className="mt-1 text-sm text-red-500">{errors.kennitala}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Heimilisfang</Label>
          <input
            type="text"
            id="address"
            name="address"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
            required
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        <div>
          <Label htmlFor="apartment">Íbúð, hæð o.s.frv. (valfrjálst)</Label>
          <input
            type="text"
            id="apartment"
            name="apartment"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
          />
          {errors.apartment && (
            <p className="mt-1 text-sm text-red-500">{errors.apartment}</p>
          )}
        </div>

        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <Label htmlFor="city">Sveitarfélag</Label>
            <input
              type="text"
              id="city"
              name="city"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="saveInfo" name="saveInfo" />
          <Label htmlFor="saveInfo">Vista þessar upplýsingar fyrir næst</Label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Halda áfram í sendingu
      </button>
    </form>
  );
};

export default ShippingForm;
