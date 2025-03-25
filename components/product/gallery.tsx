"use client";

import { Database } from "@/database.types";
import Image from "next/image";

type DbProduct = Database["public"]["Tables"]["products"]["Row"];

export const Gallery = ({ product }: { product: DbProduct }) => {
  return (
    <div className="h-full">
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        <Image
          className="h-full w-full object-contain"
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          alt={product.name}
          src={product.image_url}
          priority={true}
        />
      </div>
    </div>
  );
};
