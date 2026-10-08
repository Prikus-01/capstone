import React from 'react';
import { useParams } from 'react-router-dom';
import { useBrandProducts } from '../features/products/products.hooks';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import Footer from '../components/layout/Footer';

export default function BrandPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useBrandProducts(slug);
  const products = data?.data?.products || [];

  return (
    <div className="min-h-screen bg-[#1a1a1a] px-6 py-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-white capitalize mb-6">{slug?.replace(/-/g, ' ')}</h1>
      {error && <p className="text-red-400 text-sm">Failed to load.</p>}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-400 text-sm">No books for this publisher.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
      <Footer />
    </div>
  );
}
