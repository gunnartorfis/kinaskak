import { getProduct } from "@/lib/store/products";
import Footer from "components/layout/footer";
import { MainProductCard } from "components/product/main-product-card";

export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

export default async function HomePage() {
  const product = await getProduct({ handle: "main-product" });
  if (!product) return null;

  return (
    <>
      <MainProductCard product={product} />
      <Footer />
    </>
  );
}
