import { CartContextStateItem } from "@/context/cart-context";
import {
  deleteCartIdServer,
  getCartIdServer,
  setCartIdServer,
} from "@/context/use-cart-id";
import { Database } from "@/database/database.types";
import { getSupabaseServerClient } from "@/lib/supabase";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AddToCartSchema = z.object({
  cartId: z.string().optional(),
  productId: z.string(),
  variantId: z.string(),
  quantityChange: z.number(),
});

// product_id and variant_id are unique together so we can query by them
// if those don't exist, we can insert them with quantity 1, otherwise we can update the quantity
// if the cart item does not exist, we must also create a cart
export const upsertCartItem = createServerFn({ method: "POST" })
  .validator((d: unknown) => AddToCartSchema.parse(d))
  .handler(async ({ data }) => {
    const { productId, variantId, quantityChange } = data;

    const existingCartId = await getCartIdServer();

    const supabase = await getSupabaseServerClient();

    const { data: existingCartItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", existingCartId)
      .eq("product_id", productId)
      .eq("variant_id", variantId)
      .single();

    let cartId: string;
    if (!existingCartItem) {
      const { data: cart } = await supabase
        .from("carts")
        .insert({})
        .select()
        .single();

      if (!cart) {
        throw new Error("Cart not found");
      }

      cartId = cart.id;
    } else if (!existingCartItem.cart_id) {
      throw new Error("Cart item does not have a cart");
    } else {
      cartId = existingCartItem.cart_id;
    }

    setCartIdServer({ data: { cartId } });

    const newQuantity = (existingCartItem?.quantity ?? 0) + quantityChange;

    if (existingCartItem) {
      if (newQuantity <= 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("id", existingCartItem.id);

        return {
          cartId,
        };
      } else {
        const { data: cartItem } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingCartItem.id)
          .select()
          .single();

        return { cartItem, cartId };
      }
    }

    const { data: cartItem } = await supabase
      .from("cart_items")
      .insert({
        product_id: productId,
        variant_id: variantId,
        cart_id: cartId,
        quantity: newQuantity,
      })
      .select()
      .single();
    return { cartItem, cartId };
  });

const RemoveCartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
});

export const removeCartItem = createServerFn({ method: "POST" })
  .validator((d: unknown) => RemoveCartItemSchema.parse(d))
  .handler(async ({ data }) => {
    const { productId, variantId } = data;

    const supabase = await getSupabaseServerClient();

    const { data: cartItem } = await supabase
      .from("cart_items")
      .delete()
      .eq("product_id", productId)
      .eq("variant_id", variantId);

    return cartItem;
  });

export type ExpandedCartItem =
  Database["public"]["Tables"]["cart_items"]["Row"] & {
    product: Database["public"]["Tables"]["products"]["Row"];
    variant: Database["public"]["Tables"]["product_variants"]["Row"];
  };

export const getCartItems = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ cartId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    let { cartId } = data;

    const supabase = await getSupabaseServerClient();

    const { data: cart } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .single();

    if (!cart) {
      deleteCartIdServer();
      return [];
    }

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId);

    if (!cartItems) {
      throw new Error("Cart items not found");
    }

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in(
        "id",
        cartItems.map((item) => item.product_id)
      );

    const { data: variants } = await supabase
      .from("product_variants")
      .select("*")
      .in(
        "id",
        cartItems.map((item) => item.variant_id)
      );

    if (!products || !variants) {
      throw new Error("Products or variants not found");
    }

    const items: ExpandedCartItem[] = cartItems.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.product_id),
      variant: variants.find((variant) => variant.id === item.variant_id),
    }));

    return items;
  });
