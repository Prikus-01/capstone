import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist } from '../features/wishlist/wishlist.hooks';
import { useAddToCart } from '../features/cart/cart.hooks';
import { getDiscountedPrice, formatDeliveryDate } from '../lib/utils';
import { BookCoverArt } from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

function WishlistItemCard({ item }) {
  const remove = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const product = item.product;
  const price = getDiscountedPrice(product.price, product.discountPercent);
  const deliveryDate = formatDeliveryDate(product.tentativeDeliveryDate);

  const handleMoveToCart = async () => {
    await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
    remove.mutate(product.id);
  };

  return (
    <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl p-4 flex gap-4">
      {/* Cover */}
      <Link to={`/products/${product.id}`} className="shrink-0">
        <BookCoverArt product={product} width={90} height={120} />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Link
          to={`/products/${product.id}`}
          className="text-[15px] font-semibold text-white hover:text-blue-300 transition-colors leading-tight line-clamp-2 no-underline"
        >
          {product.title}
        </Link>
        <p className="text-[13px] text-blue-400">by {product.author}</p>
        {product.category && (
          <p className="text-[11px] text-gray-500">{product.category.name}</p>
        )}
        <p className="text-[12px] text-gray-400 line-clamp-2 leading-snug">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[17px] font-bold text-white">₹{Math.round(price)}</span>
          {Number(product.discountPercent) > 0 && (
            <span className="text-[12px] text-gray-500 line-through">₹{Math.round(Number(product.price))}</span>
          )}
          {Number(product.discountPercent) > 0 && (
            <span className="text-[11px] text-green-400 font-semibold">{Math.round(product.discountPercent)}% off</span>
          )}
        </div>

        {deliveryDate && (
          <p className="text-[11px] text-gray-500">
            Delivery by <span className="text-white font-semibold">{deliveryDate}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-3">
          <button
            onClick={handleMoveToCart}
            disabled={addToCart.isPending || remove.isPending}
            className="flex items-center gap-1.5 text-[12px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-1.5 rounded transition-colors"
          >
            <ShoppingCart size={13} />
            Move to Cart
          </button>
          <button
            onClick={() => remove.mutate(product.id)}
            disabled={remove.isPending}
            className="flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
            aria-label="Remove from wishlist"
          >
            <Trash2 size={13} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const items = data?.data?.wishlist?.items || [];

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-red-400 fill-red-400" />
            <h1 className="text-xl font-bold text-white">My Wishlist</h1>
          </div>
          <span className="text-xs text-gray-500">
            {items.length} {items.length === 1 ? 'book' : 'books'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-6">Save books you'd like to read later.</p>
            <Link
              to="/catalogue"
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors no-underline"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <WishlistItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
