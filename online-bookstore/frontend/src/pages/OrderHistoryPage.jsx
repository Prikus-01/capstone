import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders, useCancelOrder, useBuyAgain } from '../features/orders/orders.hooks';
import { formatPrice, canCancelOrder, getStatusColor } from '../lib/utils';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import {
  Package, RotateCcw, X, ChevronDown, ChevronUp,
  Clock, CheckCircle2, Truck, MapPin, ShoppingBag,
  Calendar, Hash, CreditCard,
} from 'lucide-react';

/* ── Status pipeline ─────────────────────────────────────── */
const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const STATUS_META = {
  PENDING:    { icon: Clock,         label: 'Pending',    bg: 'bg-yellow-500/15', ring: 'ring-yellow-500/40', dot: 'bg-yellow-400' },
  CONFIRMED:  { icon: CheckCircle2,  label: 'Confirmed',  bg: 'bg-blue-500/15',   ring: 'ring-blue-500/40',   dot: 'bg-blue-400'   },
  PROCESSING: { icon: Package,       label: 'Processing', bg: 'bg-blue-500/15',   ring: 'ring-blue-500/40',   dot: 'bg-blue-400'   },
  SHIPPED:    { icon: Truck,         label: 'Shipped',    bg: 'bg-purple-500/15', ring: 'ring-purple-500/40', dot: 'bg-purple-400' },
  DELIVERED:  { icon: MapPin,        label: 'Delivered',  bg: 'bg-green-500/15',  ring: 'ring-green-500/40',  dot: 'bg-green-400'  },
  CANCELLED:  { icon: X,            label: 'Cancelled',  bg: 'bg-red-500/15',    ring: 'ring-red-500/40',    dot: 'bg-red-400'    },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META['PENDING'];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${meta.bg} ${meta.ring} ${getStatusColor(status)}`}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function ProgressBar({ status }) {
  if (status === 'CANCELLED') return null;
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4 mb-1">
      {STATUS_STEPS.map((step, i) => {
        const done  = i <= current;
        const active = i === current;
        const meta  = STATUS_META[step];
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-2 transition-all
                ${done ? `${meta.dot} ring-offset-[#242424] ring-offset-2 ring-current` : 'bg-[#3a3a3a] ring-[#3a3a3a]'}
                ${active ? 'scale-110' : ''}`}
              >
                {done && <CheckCircle2 size={13} className="text-[#1a1a1a]" />}
              </div>
              <span className={`text-[9px] whitespace-nowrap ${done ? 'text-gray-300' : 'text-gray-600'}`}>{meta.label}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-[2px] mb-4 mx-1 rounded-full ${i < current ? 'bg-blue-500' : 'bg-[#3a3a3a]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Single order card ───────────────────────────────────── */
function OrderCard({ order }) {
  const navigate   = useNavigate();
  const cancel     = useCancelOrder();
  const buyAgain   = useBuyAgain();
  const [expanded, setExpanded] = useState(false);
  const [error, setError]       = useState('');

  const placedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const placedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  /* simple subtotal from items */
  const subtotal = order.items?.reduce((s, i) => s + Number(i.lineTotal || 0), 0) ?? 0;
  const tax      = Math.round(subtotal * 0.12);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try { await cancel.mutateAsync(order.id); }
    catch (err) { setError(err.response?.data?.message || 'Cannot cancel this order.'); }
  };

  const handleBuyAgain = async () => {
    try {
      const res = await buyAgain.mutateAsync(order.id);
      if (res.data.unavailable?.length > 0)
        alert(`Added to cart. Unavailable: ${res.data.unavailable.join(', ')}`);
      navigate('/cart');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add items to cart.');
    }
  };

  return (
    <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl overflow-hidden">

      {/* ── Top colour strip by status ── */}
      <div className={`h-1 w-full ${STATUS_META[order.status]?.dot ?? 'bg-gray-600'}`} />

      <div className="p-5">
        {/* ── Row 1: meta chips ── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
          <StatusBadge status={order.status} />

          <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Hash size={11} />
            {order.id.slice(-8).toUpperCase()}
          </span>

          <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Calendar size={11} />
            {placedDate} · {placedTime}
          </span>

          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 ml-auto">
            <ShoppingBag size={11} />
            {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Progress tracker ── */}
        <ProgressBar status={order.status} />

        {/* ── First-item preview (collapsed) ── */}
        {!expanded && order.items?.[0] && (
          <p className="text-sm text-gray-300 mt-3 truncate">
            {order.items[0].productTitle}
            {order.items.length > 1 && (
              <span className="text-gray-500 ml-1">+{order.items.length - 1} more</span>
            )}
          </p>
        )}

        {/* ── Expanded item list ── */}
        {expanded && (
          <div className="mt-3 border border-[#3a3a3a] rounded-lg overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2 bg-[#1e1e1e] border-b border-[#3a3a3a]">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Book</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 text-center">Qty</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 text-right">Price</span>
            </div>

            {/* Item rows */}
            {order.items?.map((item, idx) => (
              <div
                key={item.id}
                className={`grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-3 items-center
                  ${idx % 2 === 0 ? 'bg-[#242424]' : 'bg-[#262626]'}
                  ${idx !== order.items.length - 1 ? 'border-b border-[#3a3a3a]' : ''}`}
              >
                <span className="text-[13px] text-gray-200 truncate">{item.productTitle}</span>
                <span className="text-[12px] text-gray-400 text-center px-2 py-0.5 bg-[#333] rounded-md w-8 text-center">
                  ×{item.quantity}
                </span>
                <span className="text-[13px] font-semibold text-white text-right">
                  {formatPrice(item.lineTotal)}
                </span>
              </div>
            ))}

            {/* Price breakdown footer */}
            <div className="px-4 py-3 bg-[#1e1e1e] border-t border-[#3a3a3a] space-y-1.5">
              <div className="flex justify-between text-[12px] text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-gray-400">
                <span>Tax (12%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-gray-400">
                <span>Delivery</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-white pt-1.5 border-t border-[#3a3a3a]">
                <span className="flex items-center gap-1.5"><CreditCard size={12} /> Total Paid</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

        {/* ── Action bar ── */}
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-[#3a3a3a]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Collapse' : 'Show Details'}
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleBuyAgain}
            loading={buyAgain.isPending}
            className="flex items-center gap-1.5 text-xs"
          >
            <RotateCcw size={12} />
            Buy Again
          </Button>

          {canCancelOrder(order) && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              loading={cancel.isPending}
              className="flex items-center gap-1.5 text-xs"
            >
              <X size={12} />
              Cancel
            </Button>
          )}

          <Link
            to={`/orders/${order.id}/confirmation`}
            className="ml-auto text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Full Receipt →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function OrderHistoryPage() {
  const { data, isLoading, error } = useOrders();
  const orders = data?.data?.orders || [];

  /* summary counts */
  const pending   = orders.filter(o => ['PENDING','CONFIRMED','PROCESSING'].includes(o.status)).length;
  const shipped   = orders.filter(o => o.status === 'SHIPPED').length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-white">My Orders</h1>
          <span className="text-xs text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Summary pills */}
        {orders.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {pending > 0 && (
              <span className="text-[11px] px-3 py-1 rounded-full bg-yellow-500/10 ring-1 ring-yellow-500/30 text-yellow-400">
                {pending} Active
              </span>
            )}
            {shipped > 0 && (
              <span className="text-[11px] px-3 py-1 rounded-full bg-purple-500/10 ring-1 ring-purple-500/30 text-purple-400">
                {shipped} Shipped
              </span>
            )}
            {delivered > 0 && (
              <span className="text-[11px] px-3 py-1 rounded-full bg-green-500/10 ring-1 ring-green-500/30 text-green-400">
                {delivered} Delivered
              </span>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">Failed to load orders.</p>}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">You haven't placed any orders yet.</p>
            <Link to="/catalogue" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}

      </div>
    </div>
  );
}
