import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../features/auth/auth.store';
import { useCart } from '../../features/cart/cart.hooks';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: cartData } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cartData?.data?.cart?.items?.length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setMobileOpen(false);
  };

  return (
    <nav style={{ backgroundColor: '#242424', borderBottom: '1px solid #3a3a3a', position: 'sticky', top: 0, zIndex: 50 }}>

      {/* ── Row 1: Logo | Nav links | Cart | User ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: 44, padding: '0 16px', gap: 16 }}>

        {/* Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" fill="#888" />
            <rect x="9" y="1" width="6" height="6" rx="1" fill="#888" />
            <rect x="1" y="9" width="6" height="6" rx="1" fill="#888" />
            <rect x="9" y="9" width="6" height="6" rx="1" fill="#888" />
          </svg>
          Book Worm
        </Link>

        {/* Divider — hidden on mobile */}
        <div className="hidden sm:block" style={{ width: 1, height: 18, backgroundColor: '#3a3a3a' }} />

        {/* Nav links — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-6">
          <NavLink to="/orders"   label="My Orders"   currentPath={location.pathname} />
          <NavLink to="/wishlist" label="My Wishlist"  currentPath={location.pathname} />
          <NavLink to="/profile"  label="My Writers"   currentPath={location.pathname} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Cart */}
        <Link to="/cart" style={{ position: 'relative', color: '#ccc', display: 'flex', textDecoration: 'none' }}>
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -8, right: -8,
              backgroundColor: '#ef4444', color: '#fff',
              fontSize: 10, fontWeight: 700, borderRadius: '50%',
              width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>

        {/* User — desktop */}
        <div className="hidden sm:block">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', padding: 0 }}
              >
                <User size={20} />
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: 32,
                  backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a',
                  borderRadius: 8, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  zIndex: 100,
                }}>
                  <div style={{ padding: '8px 16px', fontSize: 13, color: '#888', borderBottom: '1px solid #3a3a3a' }}>
                    {user.fullName}
                  </div>
                  <UserMenuItem to="/profile" label="Profile" onClick={() => setShowUserMenu(false)} />
                  <UserMenuItem to="/orders"  label="My Orders" onClick={() => setShowUserMenu(false)} />
                  <button
                    onClick={handleLogout}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                  >Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={{ color: '#ccc', display: 'flex', textDecoration: 'none' }}>
              <User size={20} />
            </Link>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="sm:hidden flex items-center justify-center"
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 0 }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div style={{ backgroundColor: '#242424', borderTop: '1px solid #3a3a3a', padding: '8px 16px 12px' }}>
          <MobileNavLink to="/orders"   label="My Orders"  onClick={() => setMobileOpen(false)} currentPath={location.pathname} />
          <MobileNavLink to="/wishlist" label="My Wishlist" onClick={() => setMobileOpen(false)} currentPath={location.pathname} />
          <MobileNavLink to="/profile"  label="My Writers"  onClick={() => setMobileOpen(false)} currentPath={location.pathname} />
          {user ? (
            <>
              <div style={{ borderTop: '1px solid #3a3a3a', margin: '8px 0', paddingTop: 8, fontSize: 12, color: '#888' }}>
                {user.fullName}
              </div>
              <button
                onClick={handleLogout}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 0', fontSize: 13, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
              >Sign Out</button>
            </>
          ) : (
            <MobileNavLink to="/login" label="Sign In" onClick={() => setMobileOpen(false)} currentPath={location.pathname} />
          )}
        </div>
      )}
    </nav>
  );
}

/* ── Sub-components ── */

function NavLink({ to, label, currentPath }) {
  const active = currentPath === to || currentPath.startsWith(to.split('?')[0]);
  return (
    <Link
      to={to}
      style={{
        fontSize: 13, color: active ? '#fff' : '#aaa',
        textDecoration: 'none', whiteSpace: 'nowrap',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#aaa'; }}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick, currentPath }) {
  const active = currentPath === to || currentPath.startsWith(to.split('?')[0]);
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'block', padding: '7px 0', fontSize: 14,
        color: active ? '#fff' : '#aaa', textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  );
}

function UserMenuItem({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: '#ccc', textDecoration: 'none' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#ccc'; }}
    >
      {label}
    </Link>
  );
}
