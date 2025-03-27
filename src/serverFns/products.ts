import { getSupabaseServerClient } from "@/lib/supabase";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const fetchProduct = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: handle }) => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("handle", handle)
      .single();

    if (!data) {
      throw notFound();
    }
    const { data: variants } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", data.id);

    return {
      product: data,
      variants,
    };
  });

export const fetchProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.from("products").select("*");

    if (!data) {
      throw notFound();
    }

    return data;
  }
);
