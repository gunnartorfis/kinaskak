import { CartContextStateItem, useCart } from "./cart-context";

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
  items: CartContextStateItem[]
): CartTotals => {
  let totalQuantity = 0;
  // Calculate totals
  const subtotal = items.reduce((sum, { product, variant, quantity }) => {
    if (!product) return sum;

    const price = variant?.price_adjustment ?? product.base_price;
    const itemTotal = price * quantity;
    totalQuantity += quantity;

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

export const useCartTotals = () => {
  const { cart } = useCart();
  return calculateClientCartTotals(cart.items);
};
