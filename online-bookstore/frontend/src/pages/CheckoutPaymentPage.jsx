import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../features/cart/cart.hooks';
import { useCreateOrder } from '../features/checkout/checkout.hooks';
import { useAuth } from '../features/auth/auth.store';
import { getDiscountedPrice } from '../lib/utils';
import Spinner from '../components/common/Spinner';

const TABS = [
  { id: 'CARD',       label: 'Credit Card' },
  { id: 'DEBIT',      label: 'Debit card' },
  { id: 'UPI',        label: 'UPI' },
  { id: 'WALLET',     label: 'Wallet' },
];

/* ── floating book illustration SVG ── */
function FloatingBooks() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 840 540"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* top-left open book */}
      <g transform="translate(80,60) rotate(-15)">
        <rect x="0" y="0" width="110" height="80" rx="4" fill="#c8722a"/>
        <rect x="5" y="5" width="100" height="70" rx="3" fill="#d4853a"/>
        <rect x="50" y="0" width="4" height="80" fill="#b06020" opacity="0.6"/>
        <rect x="12" y="18" width="8" height="6" rx="1" fill="#a04010" opacity="0.5"/>
      </g>
      {/* top-right teal book standing */}
      <g transform="translate(670,30) rotate(10)">
        <rect x="0" y="0" width="55" height="90" rx="3" fill="#2a7a8a"/>
        <rect x="0" y="0" width="8" height="90" rx="2" fill="#1a5a6a"/>
        <rect x="12" y="20" width="30" height="3" rx="1" fill="#4aabbb" opacity="0.6"/>
        <rect x="12" y="28" width="22" height="3" rx="1" fill="#4aabbb" opacity="0.4"/>
      </g>
      {/* right orange circle accent */}
      <circle cx="820" cy="100" r="40" fill="#c8622a" opacity="0.85"/>
      {/* bottom-left stack of books */}
      <g transform="translate(30,400)">
        <rect x="0" y="30" width="130" height="22" rx="3" fill="#c8722a"/>
        <rect x="5" y="12" width="120" height="22" rx="3" fill="#2a7a8a"/>
        <rect x="10" y="0"  width="110" height="16" rx="3" fill="#d4a030"/>
      </g>
      {/* bottom-right open book */}
      <g transform="translate(440,420) rotate(5)">
        <path d="M0,0 Q60,-15 120,0 L120,70 Q60,55 0,70 Z" fill="#e8d8b0"/>
        <path d="M0,0 Q60,-15 120,0" stroke="#ccc" strokeWidth="1" fill="none"/>
        <line x1="60" y1="-15" x2="60" y2="70" stroke="#bba" strokeWidth="1.5"/>
        <rect x="10" y="15" width="40" height="2" rx="1" fill="#aaa" opacity="0.5"/>
        <rect x="10" y="22" width="35" height="2" rx="1" fill="#aaa" opacity="0.4"/>
        <rect x="70" y="15" width="40" height="2" rx="1" fill="#aaa" opacity="0.5"/>
      </g>
      {/* scattered diamond shapes */}
      <rect x="420" y="60"  width="14" height="14" rx="2" fill="#d4a030" transform="rotate(45 427 67)"/>
      <rect x="200" y="340" width="10" height="10" rx="1" fill="#c85030" transform="rotate(45 205 345)"/>
      <rect x="620" y="280" width="10" height="10" rx="1" fill="#d4a030" transform="rotate(45 625 285)"/>
      <rect x="100" y="230" width="8"  height="8"  rx="1" fill="#c85030" transform="rotate(45 104 234)"/>
      <rect x="750" y="380" width="10" height="10" rx="1" fill="#d4a030" transform="rotate(45 755 385)"/>
      {/* wavy lines */}
      <path d="M300,310 Q340,290 380,310 Q420,330 460,310" stroke="#d4a030" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M540,400 Q580,380 620,400 Q660,420 700,400" stroke="#d4a030" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  );
}

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: cartData } = useCart();
  const createOrder = useCreateOrder();

  const [activeTab, setActiveTab]   = useState('CARD');
  const [cardNum,   setCardNum]     = useState('');
  const [cardName,  setCardName]    = useState('');
  const [cvv,       setCvv]         = useState('');
  const [expiry,    setExpiry]      = useState('');
  const [error,     setError]       = useState('');

  const addressId = sessionStorage.getItem('checkout_address_id');

  if (!cartData) return <div className="flex justify-center pt-20"><Spinner /></div>;

  const cart  = cartData?.data?.cart;
  const items = cart?.items || [];

  const total = items.reduce((sum, item) =>
    sum + getDiscountedPrice(item.product.price, item.product.discountPercent) * item.quantity, 0
  );

  const handlePay = async () => {
    setError('');
    if (activeTab === 'CARD' || activeTab === 'DEBIT') {
      if (!cardNum || !cardName || !cvv || !expiry) {
        setError('Please fill in all card details.');
        return;
      }
    }
    try {
      const res = await createOrder.mutateAsync({
        addressId: addressId || undefined,
        giftPointsToUse: 0,
        paymentMethod: activeTab === 'DEBIT' ? 'CARD' : activeTab === 'WALLET' ? 'MOCK' : activeTab,
      });
      const orderId = res.data.order.id;
      sessionStorage.removeItem('checkout_address_id');
      navigate(`/orders/${orderId}/confirmation`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  /* card number formatter: XXXX-XXXX-XXXX-XXXX */
  const handleCardNum = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const fmt = raw.match(/.{1,4}/g)?.join('-') || raw;
    setCardNum(fmt);
  };

  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    const fmt = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setExpiry(fmt);
  };

  const inputCls =
    'w-full bg-bw-hover border-0 rounded px-3 py-2 text-[13px] text-white ' +
    'placeholder-bw-dim focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    /* ── full-page dark-blue background with floating books ── */
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden px-4 py-6"
         style={{ backgroundColor: '#173a5e' }}>

      <FloatingBooks />

      {/* ── modal card ── */}
      <div className="relative z-10 w-full max-w-[580px] rounded-lg overflow-hidden shadow-2xl"
           style={{ backgroundColor: '#2a2a2a' }}>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-bw-border">
          <span className="text-[15px] font-semibold text-white">Complete Payment</span>
          <span className="text-[15px] font-semibold text-white">
            Payable Amount: ₹{Math.round(total)}
          </span>
        </div>

        {/* Body: method tabs + form — stacks on mobile */}
        <div className="flex flex-col sm:flex-row" style={{ minHeight: 200 }}>

          {/* Left: method tabs — horizontal scroll on mobile */}
          <div className="sm:w-[130px] sm:shrink-0 border-b sm:border-b-0 sm:border-r border-bw-border py-2 flex sm:flex-col overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 text-[13px] transition-colors border-l-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 bg-bw-card text-white font-medium'
                    : 'border-transparent text-bw-muted hover:text-white hover:bg-bw-hover'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: form */}
          <div className="flex-1 px-4 sm:px-5 py-4 sm:py-5">

            {(activeTab === 'CARD' || activeTab === 'DEBIT') && (
              <div className="flex flex-col gap-3">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-bw-muted mb-1">Card Number</label>
                    <input
                      value={cardNum}
                      onChange={handleCardNum}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-bw-muted mb-1">Name on Card</label>
                    <input
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      placeholder="Name"
                      className={inputCls}
                    />
                  </div>
                </div>
                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-bw-muted mb-1">CVV</label>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="XXX"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-bw-muted mb-1">Date of Expiry</label>
                    <input
                      value={expiry}
                      onChange={handleExpiry}
                      placeholder="MM/YYYY"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'UPI' && (
              <div>
                <label className="block text-[11px] text-bw-muted mb-1">UPI ID</label>
                <input placeholder="yourname@upi" className={inputCls} />
              </div>
            )}

            {activeTab === 'WALLET' && (
              <div>
                <label className="block text-[11px] text-bw-muted mb-1">Wallet</label>
                <div className="flex flex-col gap-2">
                  {['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'].map(w => (
                    <label key={w} className="flex items-center gap-2 text-[13px] text-bw-muted cursor-pointer">
                      <input type="radio" name="wallet" className="accent-blue-500" />
                      {w}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-[12px] text-red-400 mt-2">{error}</p>
            )}

            {/* Pay Now button — bottom right */}
            <div className="flex justify-end mt-4">
              <button
                onClick={handlePay}
                disabled={createOrder.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-[13px] font-semibold pl-5 pr-2 py-2 rounded transition-colors"
              >
                {createOrder.isPending ? 'Processing…' : 'Pay Now'}
                <span className="bg-blue-800 rounded px-2 py-1 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
