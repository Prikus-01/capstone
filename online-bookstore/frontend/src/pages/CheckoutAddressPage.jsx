import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAddresses, useAddAddress } from '../features/checkout/checkout.hooks';
import { useAuth } from '../features/auth/auth.store';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { MapPin, Plus, Check } from 'lucide-react';

function AddressCard({ address, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(address.id)}
      className={`border rounded-xl p-4 cursor-pointer transition-all ${selected ? 'border-blue-500 bg-[#1a2640]' : 'border-[#3a3a3a] bg-[#242424] hover:border-[#555]'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{address.recipientName}</span>
            <span className="text-xs bg-[#333] text-gray-400 px-2 py-0.5 rounded">{address.label}</span>
            {address.isDefault && <span className="text-xs text-blue-400">Default</span>}
          </div>
          <p className="text-xs text-gray-400">{address.phone}</p>
          <p className="text-xs text-gray-400 mt-1">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
          <p className="text-xs text-gray-400">{address.city}, {address.state} — {address.postalCode}</p>
        </div>
        {selected && <Check size={16} className="text-blue-400 shrink-0 mt-1" />}
      </div>
    </div>
  );
}

export default function CheckoutAddressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, refetch } = useAddresses();
  const addAddress = useAddAddress(() => refetch());
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const addresses = data?.data?.addresses || [];

  // Auto-select default address
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedId) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedId(def.id);
    }
  }, [addresses]);

  const onAddAddress = async (formData) => {
    await addAddress.mutateAsync({ ...formData, isDefault: addresses.length === 0 });
    reset();
    setShowForm(false);
  };

  const handleContinue = () => {
    if (!selectedId) return;
    // Pass addressId via sessionStorage (simple approach)
    sessionStorage.setItem('checkout_address_id', selectedId);
    navigate('/checkout/payment');
  };

  if (isLoading) return <div className="flex justify-center pt-20"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-[#1a1a1a] max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Stepper */}
      <div className="flex items-center gap-2 sm:gap-4 mb-8 text-sm flex-wrap">
        <div className="flex items-center gap-2 text-blue-400 font-medium"><div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</div>Address</div>
        <div className="flex-1 h-px bg-[#3a3a3a]" />
        <div className="flex items-center gap-2 text-gray-500"><div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-xs">2</div>Payment</div>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Select Delivery Address</h1>

      {addresses.length === 0 && !showForm && (
        <p className="text-gray-400 text-sm mb-4">No saved addresses. Add one below.</p>
      )}

      <div className="space-y-3 mb-6">
        {addresses.map(addr => (
          <AddressCard key={addr.id} address={addr} selected={selectedId === addr.id} onSelect={setSelectedId} />
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-6"
        >
          <Plus size={14} /> Add a new address
        </button>
      ) : (
        <form onSubmit={handleSubmit(onAddAddress)} className="bg-[#242424] border border-[#3a3a3a] rounded-xl p-5 mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-2">New Address</h3>
          {[
            { name: 'recipientName', label: 'Full Name', placeholder: 'John Doe' },
            { name: 'phone', label: 'Phone', placeholder: '+91 9000000000' },
            { name: 'line1', label: 'Address Line 1', placeholder: '123 Main Street' },
            { name: 'line2', label: 'Address Line 2 (optional)', placeholder: 'Apt 4B', required: false },
            { name: 'city', label: 'City', placeholder: 'Bengaluru' },
            { name: 'state', label: 'State', placeholder: 'Karnataka' },
            { name: 'postalCode', label: 'Postal Code', placeholder: '560001' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-xs text-gray-400 mb-1">{field.label}</label>
              <input
                {...register(field.name, field.required !== false ? { required: `${field.label} is required` } : {})}
                placeholder={field.placeholder}
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              {errors[field.name] && <p className="text-xs text-red-400 mt-1">{errors[field.name].message}</p>}
            </div>
          ))}
          <div className="flex gap-3 mt-2">
            <Button type="submit" size="sm" loading={isSubmitting}>Save Address</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <Button
        onClick={handleContinue}
        disabled={!selectedId}
        className="w-full"
      >
        Continue to Payment
      </Button>
    </div>
  );
}
