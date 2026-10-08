import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/common/Button';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('status') !== 'failed';
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {success ? (
          <>
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-400 text-sm mb-6">Your order has been confirmed.</p>
            {orderId && (
              <Button as={Link} to={`/orders/${orderId}/confirmation`} className="mb-3">
                View Order
              </Button>
            )}
            <div className="block"><Link to="/catalogue" className="text-sm text-blue-400 hover:underline">Continue Shopping</Link></div>
          </>
        ) : (
          <>
            <XCircle size={64} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
            <p className="text-gray-400 text-sm mb-6">Please try again or use a different payment method.</p>
            <Button onClick={() => window.history.back()}>Try Again</Button>
          </>
        )}
      </div>
    </div>
  );
}
