import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useCategoryProducts, useCategories } from '../features/products/products.hooks';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import Footer from '../components/layout/Footer';
import { Search, ChevronDown, SlidersHorizontal, X as XIcon } from 'lucide-react';

const SIDEBAR_CATEGORIES = [
  { label: 'All',                     slug: null },
  { label: 'Romance',                 slug: 'romance' },
  { label: 'Mystery',                 slug: 'mystery' },
  { label: 'Science Fiction',         slug: 'science-fiction' },
  { label: 'Fantasy',                 slug: 'fantasy' },
  { label: 'Historical',              slug: 'history' },
  { label: 'Biography',               slug: 'biography' },
  { label: 'Self-help',               slug: 'self-help' },
  { label: 'Memoir',                  slug: 'memoir' },
  { label: 'Travel',                  slug: 'travel' },
  { label: 'Cooking',                 slug: 'cooking' },
  { label: "Children's",              slug: 'children' },
  { label: 'Young Adult',             slug: 'young-adult' },
  { label: 'Comics & Graphic Novels', slug: 'comics' },
  { label: 'Poetry',                  slug: 'poetry' },
  { label: 'Drama',                   slug: 'drama' },
  { label: 'Science',                 slug: 'science' },
  { label: 'Philosophy',              slug: 'philosophy' },
  { label: 'Religion',                slug: 'religion' },
  { label: 'Language Learning',       slug: 'language-learning' },
];

/* ── filter dropdown — two-row label+value style ── */
function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col items-start bg-bw-surface border border-bw-border rounded px-2 h-[36px] justify-center cursor-pointer min-w-[90px]"
      >
        <span className="text-[9px] text-bw-muted leading-none whitespace-nowrap">{label}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] text-bw-text leading-none">{value}</span>
          <ChevronDown size={9} className="text-bw-muted" />
        </div>
      </button>
      {open && (
        <div
          className="absolute top-[40px] left-0 z-50 bg-bw-card border border-bw-border rounded shadow-lg py-1 min-w-[150px]"
          onMouseLeave={() => setOpen(false)}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full text-left px-4 py-1.5 text-[12px] hover:bg-bw-hover transition-colors
                ${value === opt.label ? 'text-white font-medium' : 'text-bw-muted'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sort     = searchParams.get('sort')     || '';
  const format   = searchParams.get('format')   || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const search   = searchParams.get('search')   || '';
  const page     = Number(searchParams.get('page')) || 1;

  const { data: catData } = useCategories();
  const { data, isLoading, error } = useCategoryProducts(slug, {
    sort: sort || undefined,
    format: format || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    search: search || undefined,
    page,
    limit: 12,
  });

  const products   = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  const catFromAPI  = catData?.data?.categories?.find(c => c.slug === slug);
  const sidebarItem = SIDEBAR_CATEGORIES.find(c => c.slug === slug);
  const catName     = catFromAPI?.name || sidebarItem?.label || slug?.replace(/-/g, ' ');

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', localSearch.trim());
  };

  const handlePriceRange = (val) => {
    const next = new URLSearchParams(searchParams);
    next.delete('minPrice'); next.delete('maxPrice'); next.delete('page');
    if (val === 'under200')       next.set('maxPrice', '200');
    else if (val === '200-500')  { next.set('minPrice', '200'); next.set('maxPrice', '500'); }
    else if (val === '500-1000') { next.set('minPrice', '500'); next.set('maxPrice', '1000'); }
    else if (val === 'above1000') next.set('minPrice', '1000');
    setSearchParams(next);
  };

  const priceLabel = () => {
    if (maxPrice === '200' && !minPrice)           return 'Under ₹200';
    if (minPrice === '200' && maxPrice === '500')  return '₹200–₹500';
    if (minPrice === '500' && maxPrice === '1000') return '₹500–₹1000';
    if (minPrice === '1000' && !maxPrice)          return 'Above ₹1000';
    return 'All';
  };

  const sortLabel = () => {
    if (sort === 'price_asc')  return 'Price: Low–High';
    if (sort === 'price_desc') return 'Price: High–Low';
    if (sort === 'rating')     return 'Top Rated';
    return 'Relevance';
  };

  const hasFilters = !!(search || format || minPrice || maxPrice || sort);

  return (
    <div className="flex min-h-[calc(100vh-44px)] bg-bw-bg relative">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-[44px] left-0 h-[calc(100vh-44px)] z-50 md:static md:z-auto
        w-[200px] min-w-[200px] border-r border-bw-border bg-bw-bg pt-1 overflow-y-auto shrink-0
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Close button — mobile only */}
        <div className="flex items-center justify-between px-4 py-2 md:hidden border-b border-bw-border mb-1">
          <span className="text-[12px] text-bw-muted">Categories</span>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <XIcon size={16} />
          </button>
        </div>
        {SIDEBAR_CATEGORIES.map(item => {
          const active = item.slug === slug;
          return (
            <button
              key={item.label}
              onClick={() => {
                setSidebarOpen(false);
                item.slug ? navigate(`/categories/${item.slug}`) : navigate('/');
              }}
              className={`block w-full text-left px-4 py-1.5 text-[13px] cursor-pointer border-none transition-colors
                ${active
                  ? 'bg-bw-card text-white border-l-2 border-blue-500'
                  : 'bg-transparent text-bw-text hover:bg-bw-surface hover:text-white border-l-2 border-transparent'
                }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-bw-border bg-bw-bg shrink-0 flex-wrap">

          {/* Mobile: categories toggle button */}
          <button
            className="md:hidden flex items-center gap-1.5 bg-bw-surface border border-bw-border rounded px-2 h-[36px] text-[11px] text-bw-text shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <SlidersHorizontal size={12} />
            Categories
          </button>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-bw-bg border border-bw-border rounded px-2 h-[36px] gap-2 flex-1 min-w-[120px]"
          >
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[9px] text-bw-muted leading-none hidden sm:block">Search you want to read here</span>
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search books..."
                className="bg-transparent border-none outline-none text-[11px] text-bw-text placeholder-bw-dim leading-none mt-0.5 w-full"
              />
            </div>
            <button type="submit" className="text-bw-muted hover:text-white flex shrink-0">
              <Search size={11} />
            </button>
          </form>

          {/* Filter dropdowns — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <FilterDropdown
              label="Language"
              value={searchParams.get('language') || 'All'}
              options={[
                { label: 'All', value: '' },
                { label: 'English', value: 'english' },
                { label: 'Hindi', value: 'hindi' },
                { label: 'Tamil', value: 'tamil' },
              ]}
              onChange={v => setParam('language', v)}
            />

            <FilterDropdown
              label="Format"
              value={format || 'All'}
              options={[
                { label: 'All', value: '' },
                { label: 'Paperback', value: 'Paperback' },
                { label: 'eBook', value: 'eBook' },
                { label: 'Hardcover', value: 'Hardcover' },
                { label: 'Hard Cover', value: 'Hard Cover' },
              ]}
              onChange={v => setParam('format', v)}
            />

            <FilterDropdown
              label="Price Range"
              value={priceLabel()}
              options={[
                { label: 'All', value: '' },
                { label: 'Under ₹200', value: 'under200' },
                { label: '₹200–₹500', value: '200-500' },
                { label: '₹500–₹1000', value: '500-1000' },
                { label: 'Above ₹1000', value: 'above1000' },
              ]}
              onChange={handlePriceRange}
            />

            <FilterDropdown
              label="Sort by"
              value={sortLabel()}
              options={[
                { label: 'Relevance', value: '' },
                { label: 'Price: Low–High', value: 'price_asc' },
                { label: 'Price: High–Low', value: 'price_desc' },
                { label: 'Top Rated', value: 'rating' },
              ]}
              onChange={v => setParam('sort', v)}
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => { setLocalSearch(''); setSearchParams({}); }}
              className="text-[11px] text-bw-muted hover:text-white transition-colors ml-1 shrink-0"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 px-4 sm:px-6 py-4">

            {/* Category heading */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h1 className="text-lg font-bold text-white capitalize">{catName}</h1>
              {pagination && (
                <span className="text-xs text-bw-muted">{pagination.total} books</span>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-[13px] mb-3">
                No books found for "{catName}". Try browsing the catalogue.
              </p>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center pt-16">
                <p className="text-bw-muted text-sm">No books in this category yet.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-3 text-blue-400 bg-transparent border-none cursor-pointer text-[13px] hover:underline"
                >
                  Browse all books →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 flex-wrap">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(i + 1));
                      setSearchParams(next);
                    }}
                    className={`w-8 h-8 rounded text-[13px] border-none cursor-pointer text-white
                      ${pagination.page === i + 1 ? 'bg-blue-600' : 'bg-bw-card hover:bg-bw-hover'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
