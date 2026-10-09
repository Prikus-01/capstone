import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../features/orders/orders.hooks';
import { formatDeliveryDate, getDiscountedPrice } from '../lib/utils';
import Spinner from '../components/common/Spinner';
import { BookCoverArt } from '../components/product/ProductCard';

/* ── same floating books background as the payment page ── */
function FloatingBooks() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 840 540"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(80,60) rotate(-15)">
        <rect x="0" y="0" width="110" height="80" rx="4" fill="#c8722a"/>
        <rect x="5" y="5" width="100" height="70" rx="3" fill="#d4853a"/>
        <rect x="50" y="0" width="4" height="80" fill="#b06020" opacity="0.6"/>
        <rect x="12" y="18" width="8" height="6" rx="1" fill="#a04010" opacity="0.5"/>
      </g>
      <g transform="translate(670,30) rotate(10)">
        <rect x="0" y="0" width="55" height="90" rx="3" fill="#2a7a8a"/>
        <rect x="0" y="0" width="8" height="90" rx="2" fill="#1a5a6a"/>
        <rect x="12" y="20" width="30" height="3" rx="1" fill="#4aabbb" opacity="0.6"/>
        <rect x="12" y="28" width="22" height="3" rx="1" fill="#4aabbb" opacity="0.4"/>
      </g>
      <circle cx="820" cy="100" r="40" fill="#c8622a" opacity="0.85"/>
      <g transform="translate(30,400)">
        <rect x="0" y="30" width="130" height="22" rx="3" fill="#c8722a"/>
        <rect x="5" y="12" width="120" height="22" rx="3" fill="#2a7a8a"/>
        <rect x="10" y="0"  width="110" height="16" rx="3" fill="#d4a030"/>
      </g>
      <g transform="translate(440,420) rotate(5)">
        <path d="M0,0 Q60,-15 120,0 L120,70 Q60,55 0,70 Z" fill="#e8d8b0"/>
        <path d="M0,0 Q60,-15 120,0" stroke="#ccc" strokeWidth="1" fill="none"/>
        <line x1="60" y1="-15" x2="60" y2="70" stroke="#bba" strokeWidth="1.5"/>
        <rect x="10" y="15" width="40" height="2" rx="1" fill="#aaa" opacity="0.5"/>
        <rect x="10" y="22" width="35" height="2" rx="1" fill="#aaa" opacity="0.4"/>
        <rect x="70" y="15" width="40" height="2" rx="1" fill="#aaa" opacity="0.5"/>
      </g>
      <rect x="420" y="60"  width="14" height="14" rx="2" fill="#d4a030" transform="rotate(45 427 67)"/>
      <rect x="200" y="340" width="10" height="10" rx="1" fill="#c85030" transform="rotate(45 205 345)"/>
      <rect x="620" y="280" width="10" height="10" rx="1" fill="#d4a030" transform="rotate(45 625 285)"/>
      <rect x="100" y="230" width="8"  height="8"  rx="1" fill="#c85030" transform="rotate(45 104 234)"/>
      <rect x="750" y="380" width="10" height="10" rx="1" fill="#d4a030" transform="rotate(45 755 385)"/>
      <path d="M300,310 Q340,290 380,310 Q420,330 460,310" stroke="#d4a030" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M540,400 Q580,380 620,400 Q660,420 700,400" stroke="#d4a030" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  );
}

/* ── single purchased book card ── */
function PurchasedBookCard({ item }) {
  const deliveryDate = formatDeliveryDate(item.product?.tentativeDeliveryDate);
  const price = item.product
    ? getDiscountedPrice(item.product.price, item.product.discountPercent)
    : Number(item.unitPrice);

  const genreTags = [];
  if (item.product?.category) genreTags.push(item.product.category.name);
  const secondaryMap = {
    'self-help': 'Self Help', 'fiction': 'Novel', 'thriller': 'Thriller',
    'romance': 'Love', 'science': 'Non-fiction', 'business': 'Management',
    'technology': 'Programming', 'history': 'Biography',
    "children's": 'Children', 'non-fiction': 'Self Help',
  };
  const sec = secondaryMap[item.product?.category?.slug];
  if (sec && sec !== item.product?.category?.name) genreTags.push(sec);

  return (
    <div className="flex gap-4">
      {/* Large portrait cover */}
      <div className="shrink-0">
        {item.product
          ? <BookCoverArt product={item.product} width={120} height={160} />
          : (
            <div className="w-[120px] h-[160px] bg-bw-card rounded flex items-center justify-center text-[11px] text-bw-muted text-center px-2">
              {item.productTitle}
            </div>
          )
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5 pt-1">
        <p className="text-[15px] font-medium text-white leading-tight">{item.productTitle}</p>
        {item.product?.author && (
          <p className="text-[12px] text-white">
            by <span className="text-blue-400 underline cursor-pointer">{item.product.author}</span>
          </p>
        )}
        {item.product?.description && (
          <p className="text-[11px] text-bw-muted leading-snug line-clamp-2 mt-0.5">
            {item.product.description}
          </p>
        )}
        <p className="text-[11px] text-bw-muted mt-0.5">{item.product?.format || 'Paperback'}</p>
        <div className="flex flex-wrap gap-0.5 text-[11px] mt-0.5">
          {genreTags.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="text-bw-dim">, </span>}
              <span className="text-blue-400 cursor-pointer hover:underline">{tag}</span>
            </React.Fragment>
          ))}
        </div>
        <p className="text-[16px] font-bold text-white mt-1">₹{Math.round(price)}</p>
        {deliveryDate && (
          <p className="text-[11px] text-bw-muted">
            Delivery by <span className="text-white font-semibold">{deliveryDate}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useOrder(id);

  if (isLoading) return (
    <div className="min-h-screen relative flex items-center justify-center" style={{ backgroundColor: '#173a5e' }}>
      <FloatingBooks />
      <div className="relative z-10"><Spinner /></div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen relative flex items-center justify-center" style={{ backgroundColor: '#173a5e' }}>
      <FloatingBooks />
      <p className="relative z-10 text-bw-muted">Order not found.</p>
    </div>
  );

  const order = data.data.order;

  return (
    /* ── same dark-blue background with floating books ── */
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-10 px-4"
         style={{ backgroundColor: '#173a5e' }}>

      <FloatingBooks />

      {/* ── modal card ── */}
      <div className="relative z-10 w-full max-w-[640px] rounded-lg shadow-2xl px-4 sm:px-8 py-8 flex flex-col items-center"
           style={{ backgroundColor: '#2a2a2a' }}>

        {/* Green check circle */}
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-lg">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        {/* Heading */}
        <p className="text-[16px] text-white text-center leading-snug mb-6">
          Your purchase of the<br />following reads is successful
        </p>

        {/* Books grid — 1 col mobile, 2 cols sm+ */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mb-7">
          {order.items.map(item => (
            <PurchasedBookCard key={item.id} item={item} />
          ))}
        </div>

        {/* Continue Shopping button */}
        <button
          onClick={() => navigate('/catalogue')}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold pl-6 pr-2 py-2.5 rounded transition-colors"
        >
          Continue your Shopping
          <span className="bg-blue-800 rounded px-2 py-1 flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </span>
        </button>

      </div>
    </div>
  );
}
