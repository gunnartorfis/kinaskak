import { MainProductCard } from "@/components/product/main-product-card";
import { Database } from "@/database.types";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];

const ThreeItemsGrid = ({ products }: { products: DbProduct[] }) => {
  if (products.length < 1) return null;

  // Since we check length above, we know first exists
  const first = products[0] as DbProduct;
  const rest = products.slice(1);

  return (
    <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2">
      <div className="md:col-span-4 md:row-span-2">
        <MainProductCard product={first} />
      </div>
      {rest[0] && (
        <div className="md:col-span-2 md:row-span-1">
          <MainProductCard product={rest[0]} />
        </div>
      )}
      {rest[1] && (
        <div className="md:col-span-2 md:row-span-1">
          <MainProductCard product={rest[1]} />
        </div>
      )}
    </section>
  );
};

export default ThreeItemsGrid;
