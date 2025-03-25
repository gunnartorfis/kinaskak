import { Database } from "@/database.types";
import { createClient } from "@/lib/supabase/client";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

export const getProduct = async (handle: string): Promise<DbProduct | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select()
    .eq("handle", handle)
    .single();

  return data;
};

export const getProductVariants = async (
  productId: string
): Promise<DbProductVariant[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("product_variants")
    .select()
    .eq("product_id", productId);

  return data || [];
};

export const getProducts = async (): Promise<DbProduct[]> => {
  const supabase = createClient();
  const { data } = await supabase.from("products").select();

  return data || [];
};
