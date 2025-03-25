"use server";

import { CartState } from "@/components/cart/cart-context";
import { getProductById } from "@/lib/store/products";

const VAT_RATE = 0.24; // 24% VAT rate for physical products in Iceland
const VAT_MULTIPLIER = 1 + VAT_RATE; // 1.24 for calculating tax-inclusive amounts

type StorageCartItem = {
  variantId: string;
  productId: string;
  quantity: number;
};

export const calculateCartTotals = async (
  items: StorageCartItem[]
): Promise<CartState> => {
  const cartLines = [];
  let totalQuantity = 0;

  // Fetch products and build cart lines
  for (const item of items) {
    const product = await getProductById({ id: item.productId });
    if (product) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant) {
        cartLines.push({
          merchandise: {
            ...variant,
            product,
          },
          quantity: item.quantity,
        });
        totalQuantity += item.quantity;
      }
    }
  }

  // Calculate totals
  const subtotalAmount = cartLines
    .reduce(
      (sum, item) =>
        sum + parseFloat(item.merchandise.price.amount) * item.quantity,
      0
    )
    .toFixed(2);

  // Calculate tax from the subtotal (tax is now included in the price)
  // For a 24% VAT rate, we divide by 1.24 to get the pre-tax amount
  const taxAmount = (
    parseFloat(subtotalAmount) -
    parseFloat(subtotalAmount) / VAT_MULTIPLIER
  ).toFixed(2);
  const totalAmount = subtotalAmount;

  return {
    lines: cartLines,
    totalQuantity,
    cost: {
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
    },
  };
};
