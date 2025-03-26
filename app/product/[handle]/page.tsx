import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Gallery } from "@/components/product/gallery";
import { ProductDescription } from "@/components/product/product-description";
import { Database } from "@/database.types";
import { getProduct, getProductVariants } from "@/lib/dal/products";
import { getProductRecommendations } from "@/lib/store/products";
import { GridTileImage } from "components/grid/tile";
import Footer from "components/layout/footer";
import { ProductProvider } from "components/product/product-context";
import { getImageUrl } from "lib/utils/image";
import Link from "next/link";
import { Suspense } from "react";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];

interface ProductWithSEO extends DbProduct {
  seo: {
    title: string;
    description: string;
  };
  featuredImage?: {
    source: string;
    width?: number;
    height?: number;
    altText?: string;
  };
}

const enrichProduct = (product: DbProduct): ProductWithSEO => ({
  ...product,
  seo: {
    title: product.name,
    description: product.description || "",
  },
  featuredImage: product.image_url
    ? {
        source: product.image_url,
      }
    : undefined,
});

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const dbProduct = await getProduct(params.handle);

  if (!dbProduct) return notFound();

  const product = enrichProduct(dbProduct);
  const { source, width, height, altText: alt } = product.featuredImage || {};
  const indexable = product.is_available ?? false;

  return {
    title: product.seo.title || product.name,
    description: product.seo.description || product.description || "",
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: source
      ? {
          images: [
            {
              url: getImageUrl(source),
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export const runtime = "edge";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const handle = (await params).handle;
  const dbProduct = await getProduct(handle);
  const variants = await getProductVariants(dbProduct?.id || "");

  if (!dbProduct) {
    return notFound();
  }

  const product = enrichProduct(dbProduct);
  const indexable = product.is_available ?? false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      "@type": "Offer",
      availability: indexable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: product.base_price,
      priceCurrency: "ISK",
    },
  };

  return (
    <Suspense>
      <ProductProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
            <div className="h-full w-full basis-full lg:basis-4/6">
              <Gallery product={product} />
            </div>

            <div className="basis-full lg:basis-2/6">
              <ProductDescription product={product} variants={variants} />
            </div>
          </div>
          <RelatedProducts id={product.id} />
        </div>
        <Footer />
      </ProductProvider>
    </Suspense>
  );
}

interface RelatedProduct extends DbProduct {
  title: string;
  priceRange: {
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    source: string;
  };
}

const enrichRelatedProduct = (product: DbProduct): RelatedProduct => ({
  ...product,
  title: product.name,
  priceRange: {
    maxVariantPrice: {
      amount: product.base_price.toString(),
      currencyCode: "ISK",
    },
  },
  featuredImage: product.image_url
    ? {
        source: product.image_url,
      }
    : undefined,
});

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations({ productId: id });

  if (!relatedProducts.length) return null;

  const enrichedProducts = relatedProducts.map(enrichRelatedProduct);

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {enrichedProducts.map((product) => (
          <li
            key={product.handle}
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                }}
                src={
                  product.featuredImage
                    ? getImageUrl(product.featuredImage.source)
                    : ""
                }
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
