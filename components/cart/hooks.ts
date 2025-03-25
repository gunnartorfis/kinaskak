import { Database } from "@/database.types";
import { useCart } from "./cart-context";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

interface CartTotals {
  subtotalAmount: {
    amount: string;
    currencyCode: string;
  };
  totalAmount: {
    amount: string;
    currencyCode: string;
  };
  totalTaxAmount: {
    amount: string;
    currencyCode: string;
  };
  totalQuantity: number;
}

const VAT_RATE = 0.24;
const VAT_MULTIPLIER = 1 + VAT_RATE;

const calculateClientCartTotals = (
  items: {
    product_id: string | null;
    variant_id: string | null;
    quantity: number;
  }[],
  products: Record<string, DbProduct>,
  variants: Record<string, DbProductVariant>
): CartTotals => {
  let totalQuantity = 0;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const productId = item.product_id;
    const variantId = item.variant_id;
    if (!productId || !variantId) return sum;

    const product = products[productId];
    const variant = variants[variantId];
    if (!product) return sum;

    const price = variant?.price_adjustment ?? product.base_price;
    const itemTotal = price * item.quantity;
    totalQuantity += item.quantity;
    return sum + itemTotal;
  }, 0);

  const subtotalAmount = subtotal.toFixed(2);
  const taxAmount = (subtotal - subtotal / VAT_MULTIPLIER).toFixed(2);
  const totalAmount = subtotalAmount;

  return {
    subtotalAmount: {
      amount: subtotalAmount,
      currencyCode: "ISK",
    },
    totalAmount: {
      amount: totalAmount,
      currencyCode: "ISK",
    },
    totalTaxAmount: {
      amount: taxAmount,
      currencyCode: "ISK",
    },
    totalQuantity,
  };
};

export const useCartTotals = (
  products: Record<string, DbProduct>,
  variants: Record<string, DbProductVariant>
) => {
  const { cart } = useCart();
  return calculateClientCartTotals(cart.items, products, variants);
};
