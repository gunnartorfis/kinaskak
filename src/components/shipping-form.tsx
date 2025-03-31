import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { redirectToCheckout } from "@/serverFns/checkout";
import { useNavigate } from "@tanstack/react-router";
import { useState, type FC } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

interface ShippingFormProps {
  cartId: string;
}

const ShippingForm: FC<ShippingFormProps> = ({ cartId }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nav = useNavigate();

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        try {
          const { marketingOptIn, ...rest } = Object.fromEntries(formData);
          const { redirectUrl } = await redirectToCheckout({
            data: {
              cartId,
              marketingOptIn: marketingOptIn === "on",
              ...rest,
            },
          });

          nav({
            href: redirectUrl,
            reloadDocument: true,
          });
        } catch (error) {
          const errors: Record<string, string> = {};
          const allErrors = Object.values(error as ZodError)[0] as {
            path: string;
            message: string;
          }[];

          if (allErrors.length > 0) {
            allErrors.forEach((error) => {
              errors[error.path] = error.message;
            });

            const firstError = Object.values(errors)[0];
            toast.error(firstError);
          }

          setErrors(errors);
        }
      }}
    >
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

        <div className="grid grid-cols-2 gap-4">
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
          <div>
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
      </div>

      <Button type="submit" className="w-full">
        Halda áfram í sendingu
      </Button>
    </form>
  );
};

export default ShippingForm;
