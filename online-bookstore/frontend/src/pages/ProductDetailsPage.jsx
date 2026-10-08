import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useProduct, useFeaturedProducts } from '../features/products/products.hooks';
import { useAddToCart } from '../features/cart/cart.hooks';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../features/wishlist/wishlist.hooks';
import { useAuth } from '../features/auth/auth.store';
import { formatDeliveryDate, getDiscountedPrice } from '../lib/utils';
import Spinner from '../components/common/Spinner';
import { BookCoverArt } from '../components/product/ProductCard';
import ProductCard from '../components/product/ProductCard';
import { Heart, Share2, Star } from 'lucide-react';

/* ── star row helper ── */
function StarRow({ value = 0, max = 5, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || value) : value;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.round(display)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-bw-border fill-transparent'
          }
          style={interactive ? { cursor: 'pointer' } : {}}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useProduct(id);
  const { data: featuredData } = useFeaturedProducts();
  const addToCart = useAddToCart();

  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlistData } = useWishlist();

  const [cartMsg, setCartMsg] = useState('');
  const [wishlistMsg, setWishlistMsg] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(0);

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>;
  if (error || !data) return <div className="text-center pt-20 text-bw-muted">Product not found.</div>;

  const product = data.data.product;
  const price = getDiscountedPrice(product.price, product.discountPercent);
  const deliveryDate = formatDeliveryDate(product.tentativeDeliveryDate);
  const format = product.format || 'Paperback';

  // genre tags
  const genreTags = [];
  if (product.category) genreTags.push({ label: product.category.name, slug: product.category.slug });
  const secondaryMap = {
    'self-help': 'Self Help', 'fiction': 'Novel', 'thriller': 'Thriller',
    'romance': 'Love', 'science': 'Non-fiction', 'business': 'Management',
    'technology': 'Programming', 'history': 'Biography',
    "children's": 'Children', 'non-fiction': 'Self Help',
  };
  const secondaryLabel = secondaryMap[product.category?.slug];
  if (secondaryLabel && secondaryLabel !== product.category?.name) {
    genreTags.push({ label: secondaryLabel, slug: null });
  }

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
    setCartMsg('Added!');
    setTimeout(() => setCartMsg(''), 1800);
  };

  const wishlistItems = wishlistData?.data?.wishlist?.items || [];
  const isInWishlist = wishlistItems.some(i => i.productId === product.id);

  const handleAddToWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (isInWishlist) {
        await removeFromWishlist.mutateAsync(product.id);
        setWishlistMsg('Removed');
      } else {
        await addToWishlist.mutateAsync(product.id);
        setWishlistMsg('Saved!');
      }
      setTimeout(() => setWishlistMsg(''), 1800);
    } catch (err) {
      setWishlistMsg(err.response?.data?.message || 'Error');
      setTimeout(() => setWishlistMsg(''), 2000);
    }
  };

  // Related reads — featured products excluding this one, first 3
  const related = (featuredData?.data?.products || [])
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-bw-bg">
      <div className="w-full px-6 py-5">

        {/* Breadcrumb */}
        <nav className="text-[12px] mb-4 flex flex-wrap items-center gap-1.5">
          <Link to="/" className="text-blue-400 hover:underline">Home</Link>
          <span className="text-bw-muted">/</span>
          {product.category && (
            <>
              <Link to={`/categories/${product.category.slug}`} className="text-blue-400 hover:underline">
                {product.category.name}
              </Link>
              <span className="text-bw-muted">/</span>
            </>
          )}
          <span className="text-white">{product.title}</span>
        </nav>

        {/* ── 3-column main grid ── */}
        <div className="grid grid-cols-[auto_1fr_280px] gap-6 items-start">

          {/* ── Col 1: Cover ── */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <BookCoverArt product={product} width={200} height={270} />
              {/* Quote overlay */}
              <div className="absolute top-3 right-[-60px] w-[130px] bg-bw-bg/80 rounded px-2 py-1.5 text-[9px] text-bw-muted italic leading-snug pointer-events-none">
                "A refreshing path to clarity<br />in a cluttered world."
              </div>
            </div>

            {/* Barcode / publisher area below cover */}
            <div className="w-[200px] bg-bw-card rounded px-3 py-2 flex items-center justify-center">
              {/* Simple SVG barcode representation */}
              <svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {[0,3,5,7,9,12,14,17,20,23,25,27,30,32,35,38,40,43,46,49,51,54,56,58,61,64,66,68,71,73,76,79,82,84,87,89,92,95,97,100,102,105,108,110,113,115,118].map((x, i) => (
                  <rect key={i} x={x} y="4" width={i % 3 === 0 ? 2 : 1} height="26" fill="#888" opacity="0.7" />
                ))}
                <text x="60" y="38" textAnchor="middle" fontSize="6" fill="#666">9781234567890</text>
              </svg>
            </div>
          </div>

          {/* ── Col 2: Book info ── */}
          <div className="flex flex-col gap-2 min-w-0 pt-1">

            {/* Title */}
            <h1 className="text-[22px] font-semibold text-white leading-tight">{product.title}</h1>

            {/* Author */}
            <p className="text-[13px] text-white">
              by{' '}
              <span className="text-blue-400 underline cursor-pointer">{product.author}</span>
            </p>

            {/* Description */}
            <p className="text-[12px] text-bw-muted leading-relaxed mt-1">
              {product.description}
            </p>

            {/* Extended description (mock) */}
            <p className="text-[12px] text-bw-muted leading-relaxed">
              In <em>{product.title}</em>, {product.author} guides you through practical strategies
              to declutter your mind, space, and schedule. Whether you're overwhelmed, over-committed,
              or just over it—this book offers a calm, mindful approach to building a simpler,
              more fulfilling life.
            </p>

            {/* Published by */}
            <p className="text-[12px] text-bw-muted mt-1">
              Published by:{' '}
              {product.brand ? (
                <Link to={`/brands/${product.brand.slug}`} className="text-blue-400 underline">
                  {product.brand.name}
                </Link>
              ) : (
                <span className="text-blue-400">Unknown Publisher</span>
              )}
            </p>

            {/* Format */}
            <p className="text-[12px] text-bw-muted">{format}</p>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-0.5 text-[12px]">
              {genreTags.map((tag, i) => (
                <React.Fragment key={tag.label}>
                  {i > 0 && <span className="text-bw-dim">, </span>}
                  <span
                    className="text-blue-400 cursor-pointer hover:underline"
                    onClick={() => tag.slug && navigate(`/categories/${tag.slug}`)}
                  >
                    {tag.label}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[26px] font-bold text-white">₹{Math.round(price)}</span>
              {Number(product.discountPercent) > 0 && (
                <span className="text-[13px] text-bw-subtle line-through">₹{Math.round(Number(product.price))}</span>
              )}
            </div>

            {/* Delivery */}
            {deliveryDate && (
              <p className="text-[12px] text-bw-muted">
                Delivery by <span className="text-white font-semibold">{deliveryDate}</span>
              </p>
            )}

            {/* CTA buttons */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex items-center gap-2 bg-bw-card border border-bw-border hover:bg-bw-hover text-white text-[13px] font-medium px-5 py-2 rounded transition-colors"
              >
                Add to Cart
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
              <button
                onClick={handleAddToWishlist}
                disabled={addToWishlist.isPending || removeFromWishlist.isPending}
                className={`flex items-center gap-2 border text-[13px] font-medium px-5 py-2 rounded transition-colors disabled:opacity-60
                  ${isInWishlist
                    ? 'bg-red-500/15 border-red-500/40 hover:bg-red-500/25 text-red-400'
                    : 'bg-bw-card border-bw-border hover:bg-bw-hover text-white'}`}
              >
                {isInWishlist ? 'Wishlisted' : 'Add to Wishlist'}
                <Heart size={16} className={isInWishlist ? 'fill-red-400 text-red-400' : ''} />
              </button>
              {cartMsg && <span className="text-green-400 text-[12px]">{cartMsg}</span>}
              {wishlistMsg && <span className="text-[12px] text-pink-400">{wishlistMsg}</span>}
            </div>

            {/* Stats row: Language | Rating | Sells */}
            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-bw-border">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-bw-muted uppercase tracking-wide">Language</span>
                <span className="text-[12px] text-blue-400 underline cursor-pointer">English</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-bw-muted uppercase tracking-wide">Rating</span>
                <StarRow value={Number(product.rating)} size={13} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-bw-muted uppercase tracking-wide">$ Sells</span>
                <span className="text-[12px] text-white">{product.reviewCount} copies sold</span>
              </div>
            </div>
          </div>

          {/* ── Col 3: Related Reads ── */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold text-white">Related Reads</h2>
            {related.length === 0 ? (
              <p className="text-[12px] text-bw-muted">No related books found.</p>
            ) : (
              related.map(p => (
                <Link key={p.id} to={`/products/${p.id}`} className="flex gap-3 no-underline group">
                  <div className="shrink-0">
                    <BookCoverArt product={p} width={70} height={95} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="text-[12px] font-semibold text-white group-hover:text-blue-300 leading-tight line-clamp-2">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-blue-400">by {p.author}</p>
                    <p className="text-[11px] text-bw-muted line-clamp-2 leading-snug">{p.description}</p>
                    <p className="text-[11px] text-bw-muted">{p.format || 'Paperback'}</p>
                    <div className="flex flex-wrap gap-0.5 text-[11px]">
                      {p.category && (
                        <span className="text-blue-400">{p.category.name}</span>
                      )}
                    </div>
                    <p className="text-[13px] font-bold text-white mt-0.5">
                      ₹{Math.round(getDiscountedPrice(p.price, p.discountPercent))}
                    </p>
                    <p className="text-[11px] text-bw-muted">
                      Delivery by <span className="text-white font-semibold">{formatDeliveryDate(p.tentativeDeliveryDate)}</span>
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>

        {/* ── About the writer ── */}
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-white mb-4">About the writer</h2>
          <div className="flex gap-4 items-start">
            {/* Avatar */}
            <div className="shrink-0 w-14 h-14 rounded-full bg-bw-card border border-bw-border overflow-hidden flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="#666"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-white mb-1">{product.author}</p>
              <p className="text-[12px] text-bw-muted leading-relaxed">
                {product.author} is a writer, minimalist, and productivity coach based in San Francisco.
                With a passion for intentional living, {product.author} has dedicated his career to
                helping individuals simplify their lives — one habit, and one thought at a time.
                He is the author of <em>{product.title}</em>, an acclaimed guide to decluttering both
                physically and mentally. His other works include Less, But Better and The Focus Reset,
                which have helped thousands rethink consumerism, prioritize what truly matters, and
                build sustainable systems for personal growth.
              </p>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-8">
          <h2 className="text-[15px] font-semibold text-white mb-4">Reviews</h2>
          <div className="grid grid-cols-2 gap-6">

            {/* Leave a review */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] text-bw-muted">Leave Your Review</label>
                <span className="text-[11px] text-bw-dim">{reviewText.length}/100</span>
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value.slice(0, 100))}
                placeholder="Placeholder text"
                rows={4}
                className="w-full bg-bw-surface border border-bw-border rounded px-3 py-2 text-[12px] text-white placeholder-bw-dim resize-none focus:outline-none focus:border-blue-500"
              />
              {/* Star selector */}
              <div className="mt-1">
                <StarRow value={reviewStars} size={18} interactive onChange={setReviewStars} />
              </div>
              <div className="flex justify-end mt-1">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors">
                  Submit
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Sample review */}
            <div className="flex flex-col gap-2">
              <p className="text-[14px] font-semibold text-white">John Smith</p>
              <p className="text-[12px] text-bw-muted leading-relaxed">
                The accordion component delivers large amounts of content in a small space through
                progressive disclosure. The user gets key details about the underlying content and
                can choose to expand that content within the constraints of the accordion.
              </p>
              <StarRow value={4} size={16} />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
