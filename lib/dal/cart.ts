import { CartState } from "@/components/cart/cart-context";
import { createClient } from "@/db/supabase/server";
import { getProductById, getProductsByIds } from "@/lib/store/products";

const VAT_RATE = 0.24;
const VAT_MULTIPLIER = 1 + VAT_RATE;

export const getOrCreateCart = async (userId?: string) => {
  const supabase = await createClient();

  // If user is logged in, try to find their cart
  if (userId) {
    const { data: existingCart } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingCart) {
      return existingCart;
    }
  }

  // Create a new cart
  const { data: newCart, error } = await supabase
    .from("carts")
    .insert([{ user_id: userId }])
    .select()
    .single();

  if (error) throw error;
  return newCart;
};

export const getCartItems = async (cartId: string) => {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId);

  const productIds: string[] = items?.map((item) => item.product_id!) ?? [];
  const products = await getProductsByIds({ ids: productIds });

  const cartItemsWithProducts = items?.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      ...item,
      product,
    };
  });

  return cartItemsWithProducts || [];
};

export const addToCart = async ({
  cartId,
  productId,
  variantId,
  quantity = 1,
}: {
  cartId: string;
  productId: string;
  variantId: string;
  quantity?: number;
}) => {
  const supabase = await createClient();

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .eq("variant_id", variantId)
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);

    if (error) throw error;
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert([
      {
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      },
    ]);

    if (error) throw error;
  }
};

export const updateCartItemQuantity = async ({
  cartId,
  variantId,
  quantity,
}: {
  cartId: string;
  variantId: string;
  quantity: number;
}) => {
  const supabase = await createClient();

  if (quantity <= 0) {
    // Remove item
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId)
      .eq("variant_id", variantId);

    if (error) throw error;
  } else {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("cart_id", cartId)
      .eq("variant_id", variantId);

    if (error) throw error;
  }
};

export const removeFromCart = async ({
  cartId,
  variantId,
}: {
  cartId: string;
  variantId: string;
}) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId)
    .eq("variant_id", variantId);

  if (error) throw error;
};

export const calculateCartTotals = async (
  cartId: string
): Promise<CartState> => {
  const items = await getCartItems(cartId);
  const cartLines = [];
  let totalQuantity = 0;

  // Fetch products and build cart lines
  for (const item of items) {
    if (!item.product_id) continue;
    const product = await getProductById({ id: item.product_id });
    if (product) {
      const variant = product.variants.find((v) => v.id === item.variant_id);
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
