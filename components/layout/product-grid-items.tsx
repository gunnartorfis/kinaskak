import { Database } from "@/database.types";
import { MainProductCard } from "../product/main-product-card";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];

const ProductGridItems = ({ products }: { products: DbProduct[] }) => {
  return (
    <>
      {products.map((product) => (
        <MainProductCard key={product.id} product={product} />
      ))}
    </>
  );
};

export default ProductGridItems;
