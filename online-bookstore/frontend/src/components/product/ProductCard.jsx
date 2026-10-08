import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDeliveryDate, getDiscountedPrice } from '../../lib/utils';
import { useAddToCart } from '../../features/cart/cart.hooks';
import { useAuth } from '../../features/auth/auth.store';

// Dynamic cover theme data — bg/textColor are runtime values, must stay as inline style
const COVER_THEMES = [
  { bg: '#f5f0e8', textColor: '#2c2c2c', accent: '#b03030' },
  { bg: '#e84c2b', textColor: '#ffffff', accent: '#ffee88' },
  { bg: '#1a3a5c', textColor: '#f0c060', accent: '#4a9eff' },
  { bg: '#1c2b3a', textColor: '#88ccee', accent: '#ff9944' },
  { bg: '#2d1b4e', textColor: '#e8c0ff', accent: '#cc88ff' },
  { bg: '#0a1628', textColor: '#4a9eff', accent: '#88ddff' },
  { bg: '#f5c518', textColor: '#1a1a1a', accent: '#333333' },
  { bg: '#1a2a1a', textColor: '#88ee88', accent: '#44aa44' },
  { bg: '#e87c2b', textColor: '#ffffff', accent: '#ffeeaa' },
  { bg: '#2c3e50', textColor: '#a0c8e0', accent: '#6aabcc' },
];

const ISBN_THEME_MAP = {
  '978-1000000001': 0,
  '978-1000000002': 1,
  '978-1000000003': 2,
  '978-1000000004': 3,
  '978-1000000005': 4,
  '978-1000000006': 5,
  '978-1000000007': 6,
  '978-1000000008': 7,
  '978-1000000009': 8,
};

export function BookCoverArt({ product, width = 90, height = 120 }) {
  let idx;
  if (product.isbn && ISBN_THEME_MAP[product.isbn] !== undefined) {
    idx = ISBN_THEME_MAP[product.isbn];
  } else {
    const hash = (product.title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    idx = hash % COVER_THEMES.length;
  }
  const theme = COVER_THEMES[idx];

  const words = (product.title || '').toUpperCase().split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2, 4).join(' ');
  const line3 = words.slice(4).join(' ');

  // backgroundColor and color are dynamic from theme data — inline style is the right tool here
  return (
    <div
      className="rounded flex flex-col items-center justify-between overflow-hidden p-1.5 box-border shrink-0"
      style={{ width, height, minWidth: width, backgroundColor: theme.bg, color: theme.textColor }}
    >
      <span className="text-[7px] font-bold opacity-60 tracking-widest uppercase text-center leading-tight">
        {product.category?.name || ''}
      </span>

      <div className="flex-1 flex flex-col items-center justify-center gap-px text-center">
        <span className={`font-black leading-tight tracking-tight ${line1.length > 8 ? 'text-[9px]' : 'text-[11px]'}`}>
          {line1}
        </span>
        {line2 && (
          <span className={`font-black leading-tight tracking-tight ${line2.length > 8 ? 'text-[9px]' : 'text-[11px]'}`}>
            {line2}
          </span>
        )}
        {line3 && (
          <span className="text-[8px] font-bold leading-tight opacity-85">{line3}</span>
        )}
      </div>

      <div
        className="w-3/5 opacity-50 my-px"
        style={{ height: 1, backgroundColor: theme.accent }}
      />

      <span className="text-[7px] font-semibold opacity-65 tracking-wide uppercase text-center leading-tight">
        {product.author?.split(' ').slice(-1)[0] || ''}
      </span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
  const deliveryDate = formatDeliveryDate(product.tentativeDeliveryDate);
  const format = product.format || 'Paperback';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {}
  };

  const genreTags = [];
  if (product.category) genreTags.push({ label: product.category.name, slug: product.category.slug });
  const secondaryMap = {
    'self-help': 'Self Help', 'fiction': 'Novel', 'thriller': 'Thriller',
    'romance': 'Love', 'science': 'Non-fiction', 'business': 'Management',
    'technology': 'Programming', 'history': 'Biography',
    "children's": 'Children', 'non-fiction': 'Self Help',
  };
  const secondaryLabel = secondaryMap[product.category?.slug] || product.brand?.name?.split(' ')[0];
  if (secondaryLabel && secondaryLabel !== product.category?.name) {
    genreTags.push({ label: secondaryLabel, slug: null });
  }

  return (
    <Link to={`/products/${product.id}`} className="flex gap-3 group no-underline">

      {/* Cover */}
      <div className="shrink-0">
        <BookCoverArt product={product} width={90} height={120} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Title */}
        <p className="text-[13px] font-semibold text-white leading-tight group-hover:text-blue-300 transition-colors mb-0.5 line-clamp-2">
          {product.title}
        </p>

        {/* Author */}
        <p className="text-[12px] text-blue-400 mb-1">by {product.author}</p>

        {/* Description — 2-line clamp via Tailwind */}
        <p className="text-[11px] text-bw-muted leading-snug mb-1 line-clamp-2">
          {product.description}
        </p>

        {/* Format */}
        <p className="text-[11px] text-bw-muted mb-0.5">{format}</p>

        {/* Genre tags */}
        <div className="flex flex-wrap items-center gap-0.5 text-[11px] mb-1">
          {genreTags.map((tag, i) => (
            <React.Fragment key={tag.label}>
              {i > 0 && <span className="text-bw-dim">, </span>}
              <span
                className="text-blue-400 hover:underline cursor-pointer"
                onClick={(e) => { e.preventDefault(); if (tag.slug) navigate(`/categories/${tag.slug}`); }}
              >
                {tag.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-[15px] font-bold text-white">₹{Math.round(discountedPrice)}</span>
          {Number(product.discountPercent) > 0 && (
            <span className="text-[11px] text-bw-subtle line-through">₹{Math.round(Number(product.price))}</span>
          )}
        </div>

        {/* Delivery */}
        {deliveryDate && (
          <p className="text-[11px] text-bw-muted">
            Delivery by <span className="text-bw-text font-semibold">{deliveryDate}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
