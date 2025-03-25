import { Database } from "@/database.types";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];

export const VAT_RATE = 0.24; // 24% VAT rate for physical products in Iceland
export const VAT_MULTIPLIER = 1 + VAT_RATE; // 1.24 for calculating tax-inclusive amounts

interface CartTotals {
  subtotalAmount: number;
  totalAmount: number;
  taxAmount: number;
  totalQuantity: number;
  currencyCode: string;
}

export const calculateCartTotals = (
  items: DbCartItem[],
  products: Record<string, DbProduct>,
  variants: Record<string, DbProductVariant>
): CartTotals => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalAmount = items.reduce((sum, item) => {
    const variant = variants[item.variant_id ?? ""];
    const product = products[item.product_id ?? ""];
    const price = variant?.price_adjustment ?? product?.base_price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  // Calculate tax from the subtotal (tax is included in the price)
  // For a 24% VAT rate, we divide by 1.24 to get the pre-tax amount
  const taxAmount = subtotalAmount - subtotalAmount / VAT_MULTIPLIER;

  return {
    subtotalAmount,
    totalAmount: subtotalAmount, // Total is same as subtotal since tax is included
    taxAmount,
    totalQuantity,
    currencyCode: "ISK",
  };
};

export const formatPrice = (amount: number): string => {
  return amount.toFixed(2);
};

export const formatCartTotals = (totals: CartTotals) => {
  return {
    subtotalAmount: {
      amount: formatPrice(totals.subtotalAmount),
      currencyCode: totals.currencyCode,
    },
    totalAmount: {
      amount: formatPrice(totals.totalAmount),
      currencyCode: totals.currencyCode,
    },
    totalTaxAmount: {
      amount: formatPrice(totals.taxAmount),
      currencyCode: totals.currencyCode,
    },
    totalQuantity: totals.totalQuantity,
  };
};
