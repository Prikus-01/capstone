import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../features/cart/cart.hooks';
import { formatPrice, formatDeliveryDate, getDiscountedPrice } from '../lib/utils';
import Spinner from '../components/common/Spinner';
import { ShoppingCart, ChevronDown, CreditCard } from 'lucide-react';
import { BookCoverArt } from '../components/product/ProductCard';

/* ---------- shared style tokens ---------- */
const labelCls = 'block text-[11px] text-bw-muted mb-1.5';
const inputCls =
  'w-full h-10 bg-bw-surface border border-bw-border rounded-sm px-3 text-[13px] text-white ' +
  'placeholder-bw-dim focus:outline-none focus:border-blue-500';

function SelectField({ children, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={`${inputCls} appearance-none pr-8`}>
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bw-muted"
      />
    </div>
  );
}

/* ---------- decorative illustration for Grand Total ---------- */
function BooksIllustration() {
  return (
    <svg
      viewBox="0 0 100 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="100" height="200" fill="#1d4d8f" />
      {/* swirls */}
      <path d="M-5 30 C 25 10, 45 50, 75 25 S 105 20 110 30" stroke="#e8923a" strokeWidth="1.5" fill="none" />
      <path d="M-5 120 C 20 100, 40 140, 70 115 S 100 110 110 125" stroke="#e8923a" strokeWidth="1.5" fill="none" />
      <path d="M-5 175 C 30 160, 50 190, 110 165" stroke="#2f7fd1" strokeWidth="2" fill="none" />
      {/* books */}
      <rect x="62" y="48" width="30" height="40" rx="2" fill="#2f9fd1" />
      <rect x="62" y="48" width="6" height="40" fill="#1b6f9c" />
      <rect x="6" y="88" width="46" height="14" rx="2" fill="#c0482b" />
      <rect x="10" y="102" width="40" height="12" rx="2" fill="#e8923a" />
      <rect x="4" y="150" width="60" height="22" rx="2" fill="#f2e6c9" />
      <rect x="64" y="150" width="30" height="22" rx="2" fill="#e8d7ae" />
      {/* sparkles */}
      <rect x="20" y="40" width="4" height="4" fill="#f5b840" transform="rotate(45 22 42)" />
      <rect x="84" y="110" width="4" height="4" fill="#f5b840" transform="rotate(45 86 112)" />
      <rect x="48" y="130" width="3" height="3" fill="#f5b840" transform="rotate(45 49.5 131.5)" />
      <circle cx="80" cy="20" r="2" fill="#f5b840" />
    </svg>
  );
}

/* ---------- cart item ---------- */
function CartItemCard({ item }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const price = getDiscountedPrice(item.product.price, item.product.discountPercent);
  const deliveryDate = formatDeliveryDate(item.product.tentativeDeliveryDate);
  const format = item.product.format || 'Paperback';

  const genreTags = [];
  if (item.product.category) genreTags.push(item.product.category.name);
  const secondaryMap = {
    'self-help': 'Self Help', 'fiction': 'Novel', 'thriller': 'Thriller',
    'romance': 'Love', 'science': 'Non-fiction', 'business': 'Management',
    'technology': 'Programming', 'history': 'Biography',
    "children's": 'Children', 'non-fiction': 'Self Help',
  };
  const secondaryLabel = secondaryMap[item.product.category?.slug] || item.product.brand?.name?.split(' ')[0];
  if (secondaryLabel && secondaryLabel !== item.product.category?.name) {
    genreTags.push(secondaryLabel);
  }

  return (
    <div className="flex gap-3 sm:gap-5">
      {/* Portrait cover (2:3) — smaller on mobile */}
      <div className="shrink-0">
        <BookCoverArt product={item.product} width={100} height={150} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Link
          to={`/products/${item.productId}`}
          className="text-[18px] font-normal text-white hover:text-blue-300 transition-colors leading-tight line-clamp-2 no-underline"
        >
          {item.product.title}
        </Link>
        <p className="text-[13px] text-white">
          by <span className="text-blue-400 underline cursor-pointer">{item.product.author}</span>
        </p>
        <p className="text-[12px] text-bw-muted leading-snug line-clamp-2">
          {item.product.description}
        </p>

        <p className="text-[12px] text-white mt-2">{format}</p>
        <div className="flex flex-wrap text-[12px]">
          {genreTags.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="text-bw-muted mr-1">,</span>}
              <span className="text-blue-400 cursor-pointer underline">{tag}</span>
            </React.Fragment>
          ))}
        </div>

        <p className="text-[18px] font-bold text-white mt-2">₹{Math.round(price)}</p>
        {deliveryDate && (
          <p className="text-[12px] text-bw-muted">
            Delivery by <span className="text-white font-semibold">{deliveryDate}</span>
          </p>
        )}

        {/* Quantity controls + Remove button, pinned to the bottom */}
        <div className="mt-auto pt-3 flex items-center gap-4">
          <div className="inline-flex items-center border-b border-bw-border">
            <span className="text-[13px] text-white w-10">{item.quantity}</span>
            <button
              onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
              disabled={update.isPending || item.quantity <= 1}
              className="px-3 py-1.5 text-white text-sm hover:bg-bw-hover disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <button
              onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
              disabled={update.isPending}
              className="px-3 py-1.5 text-white text-sm hover:bg-bw-hover transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={() => remove.mutate(item.id)}
            disabled={remove.isPending}
            className="text-[12px] text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
export default function CartPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCart();
  const cart = data?.data?.cart;
  const items = cart?.items || [];
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bw-bg flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={48} className="text-bw-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Your cart is empty</h2>
          <p className="text-sm text-bw-muted mb-6">Add some books to get started!</p>
          <button
            onClick={() => navigate('/catalogue')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    return sum + getDiscountedPrice(item.product.price, item.product.discountPercent) * item.quantity;
  }, 0);
  const tax = Math.round(subtotal * 0.12);
  const total = Math.round(subtotal) + tax - discount;

  const firstItem = items[0];
  const categoryName = firstItem?.product?.category?.name || 'Books';
  const categorySlug = firstItem?.product?.category?.slug || 'catalogue';

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'SAVE100') setDiscount(100);
  };

  return (
    <div className="min-h-screen bg-bw-bg">
      <div className="w-full px-3 sm:px-4 py-4">

        {/* Breadcrumb */}
        <nav className="text-[12px] mb-4 flex flex-wrap items-center gap-1.5">
          <Link to="/" className="hover:underline text-blue-400">Home</Link>
          <span className="text-white">/</span>
          <Link to={`/categories/${categorySlug}`} className="hover:underline text-blue-400">{categoryName}</Link>
          <span className="text-white">/</span>
          <Link to={`/products/${firstItem?.productId}`} className="hover:underline text-blue-400">{firstItem?.product?.title}</Link>
          <span className="text-white">/</span>
          <span className="text-white">Checkout</span>
          <span className="text-white">/</span>
        </nav>

        <h1 className="text-[16px] font-normal text-white mb-3">Shopping Cart</h1>

        {/* One panel holds all cart items */}
        <div className="bg-bw-card rounded-lg p-4 sm:p-6 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
            {items.map(item => <CartItemCard key={item.id} item={item} />)}
          </div>
        </div>

        {/* Bottom: Address + Grand Total */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-3">

          {/* Address */}
          <div className="bg-bw-card rounded-lg p-4 sm:p-6">
            <h2 className="text-[16px] font-normal text-white mb-4">Address</h2>
            <label className="flex items-center gap-2 text-[13px] text-bw-muted mb-5 cursor-pointer w-fit">
              <input
                type="checkbox"
                className="appearance-none w-4 h-4 rounded-sm border border-bw-border bg-bw-surface checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
              />
              Use Saved Address
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input placeholder="First Name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input placeholder="Last Name" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Address</label>
                <input placeholder="Address Line 2" className={inputCls} />
              </div>

              <div className="col-span-2">
                <label className={labelCls}>e-mail</label>
                <input type="email" placeholder="e-mail" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input placeholder="City" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Pin</label>
                <input placeholder="000000" className={inputCls} />
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Phone Number</label>
                <div className="flex gap-2">
                  <SelectField className="w-[88px] shrink-0" defaultValue="+91">
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </SelectField>
                  <input placeholder="12345678900" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input placeholder="State" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <SelectField defaultValue="India">
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </SelectField>
              </div>
            </div>
          </div>

          {/* Grand Total: illustration on the left, details on the right */}
          <div className="bg-bw-card rounded-lg p-4 flex gap-5">
            <div className="relative w-[100px] shrink-0 rounded-lg overflow-hidden">
              <BooksIllustration />
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              <h2 className="text-[16px] font-normal text-white mb-4 mt-1">Grand Total</h2>

              <div className="space-y-2.5 text-[12px] pb-4 border-b border-bw-border">
                <div className="flex justify-between text-white">
                  <span>Price ({items.length} items)</span>
                  <span>₹{Math.round(subtotal)}.00</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Tax</span>
                  <span>₹{tax}.00</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Delivery Charges</span>
                  <span>Free</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="flex items-end gap-2 mt-4 mb-4">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Apply Coupon"
                  className="flex-1 min-w-0 bg-bw-surface border-0 border-b border-bw-border px-3 py-2.5 text-[12px] text-white placeholder-bw-dim focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-sm text-[12px] font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[12px] text-white mb-3">
                  <span>Discount</span>
                  <span>₹{discount}</span>
                </div>
              )}

              <div className="border-t border-bw-border pt-3 flex justify-between text-[13px] font-bold text-white mb-4">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>

              <div className="flex justify-end mt-auto">
                <button
                  onClick={() => navigate('/checkout/payment')}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white pl-5 pr-2 py-1.5 rounded-sm text-[13px] font-semibold transition-colors"
                >
                  Pay Now
                  <span className="bg-white/20 rounded-sm p-1.5 flex">
                    <CreditCard size={14} />
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}