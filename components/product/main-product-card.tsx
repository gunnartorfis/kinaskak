import { DbProduct } from "@/lib/store/products";
import Image from "next/image";
import Link from "next/link";

export const MainProductCard = ({ product }: { product: DbProduct }) => {
  if (!product) {
    return null;
  }

  return (
    <Link
      className="group relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg hover:opacity-75"
      href={`/product/${product.handle}`}
    >
      <div className="relative h-full w-full">
        <Image
          className="relative h-full w-full object-contain"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          alt={product.name}
          src={product.image_url}
          priority={true}
        />
      </div>
      <div className="absolute bottom-0 left-0 flex w-full flex-col items-start justify-end gap-y-4 bg-gradient-to-t from-black to-transparent p-6 text-white">
        <h3 className="text-xl font-bold">{product.name}</h3>
        <p className="text-sm">
          {product.base_price.toLocaleString("is-IS", {
            style: "currency",
            currency: "ISK",
          })}
        </p>
      </div>
    </Link>
  );
};
