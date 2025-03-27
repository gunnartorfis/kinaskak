import { z } from "zod";

export const shippingFormSchema = z.object({
  email: z.string().email("Vinsamlegast sláðu inn gilt netfang"),
  firstName: z.string().min(1, "Fornafn er nauðsynlegt"),
  lastName: z.string().min(1, "Eftirnafn er nauðsynlegt"),
  kennitala: z
    .string()
    .length(10, "Kennitala verður að vera 10 tölustafir")
    .regex(/^\d+$/, "Kennitala verður að vera tölustafir eingöngu"),
  address: z.string().min(1, "Heimilisfang er nauðsynlegt"),
  apartment: z.string().optional(),
  city: z.string().min(1, "Sveitarfélag er nauðsynlegt"),
  saveInfo: z.boolean().default(false),
  marketingOptIn: z.boolean().default(false),
});

export type ShippingFormData = z.infer<typeof shippingFormSchema>;
