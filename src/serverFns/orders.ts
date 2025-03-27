import { getSupabaseServerClient } from "@/lib/supabase";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const fetchOrder = createServerFn({ method: "GET" })
  .validator((d: string) => d)
  .handler(async ({ data: postId }) => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", postId)
      .single();

    if (!data) {
      throw notFound();
    }

    return data;
  });

export const fetchOrders = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.from("orders").select("*");

    if (!data) {
      throw notFound();
    }

    return data;
  }
);
