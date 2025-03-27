import { ProductDescription } from "@/components/product/product-description";
import { fetchProduct } from "@/serverFns/products";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/$handle")({
  component: RouteComponent,
  loader: async ({ params }) =>
    fetchProduct({
      data: params.handle,
    }),
});

function RouteComponent() {
  const { product, variants } = Route.useLoaderData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: product.base_price,
      priceCurrency: "ISK",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <div className="h-full">
              <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
                <img
                  className="h-full w-full object-contain"
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  alt={product.name}
                  src={product.image_url}
                />
              </div>
            </div>
          </div>

          <div className="basis-full lg:basis-2/6">
            <ProductDescription product={product} variant={variants?.[0]} />
          </div>
        </div>
      </div>
    </div>
  );
}
