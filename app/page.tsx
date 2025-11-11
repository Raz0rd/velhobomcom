import { Product, ProductsResponse } from '@/types/product';
import ProductsGrid from '@/components/ProductsGrid';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';

async function getProducts(): Promise<Product[]> {
  const filePath = path.join(process.cwd(), 'products.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data: ProductsResponse = JSON.parse(fileContents);
  return data.items;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      {/* Banner Principal */}
      <div className="w-full mb-8">
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
          <Image
            src="/bannerInicial.png"
            alt="Obom Velhinho - Toda a loja com até 80% de desconto"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ProductsGrid products={products} />
      </div>
    </>
  );
}
