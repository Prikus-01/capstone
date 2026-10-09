import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFeaturedProducts, useCategories, useProducts } from '../features/products/products.hooks';
import { useRecommendations } from '../features/products/products.hooks';
import { useAuth } from '../features/auth/auth.store';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import Footer from '../components/layout/Footer';
import { Search, ChevronDown, SlidersHorizontal, X as XIcon } from 'lucide-react';

const SIDEBAR_CATEGORIES = [
  { label: 'All',                    slug: null },
  { label: 'Romance',                slug: 'romance' },
  { label: 'Mystery',                slug: 'mystery' },
  { label: 'Science Fiction',        slug: 'science-fiction' },
  { label: 'Fantasy',                slug: 'fantasy' },
  { label: 'Historical',             slug: 'history' },
  { label: 'Biography',              slug: 'biography' },
  { label: 'Self-help',              slug: 'self-help' },
  { label: 'Memoir',                 slug: 'memoir' },
  { label: 'Travel',                 slug: 'travel' },
  { label: 'Cooking',                slug: 'cooking' },
  { label: "Children's",             slug: 'children' },
  { label: 'Young Adult',            slug: 'young-adult' },
  { label: 'Comics & Graphic Novels', slug: 'comics' },
  { label: 'Poetry',                 slug: 'poetry' },
  { label: 'Drama',                  slug: 'drama' },
  { label: 'Science',                slug: 'science' },
  { label: 'Philosophy',             slug: 'philosophy' },
  { label: 'Religion',               slug: 'religion' },
  { label: 'Language Learning',      slug: 'language-learning' },
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

function SectionRow({ title, products, loading }) {
  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-white mb-3">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {[0, 1, 2].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }
  if (!products || products.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="text-[15px] font-semibold text-white mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* filter values */
  const search   = searchParams.get('search')   || '';
  const format   = searchParams.get('format')   || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort     = searchParams.get('sort')     || '';
  const page     = searchParams.get('page')     || 1;

  const hasFilters = !!(search || format || minPrice || maxPrice || sort);

  /* filtered query */
  const { data: filteredData, isLoading: filteredLoading, error: filteredError } = useProducts(
    hasFilters
      ? { search: search || undefined, format: format || undefined,
          minPrice: minPrice || undefined, maxPrice: maxPrice || undefined,
          sort: sort || undefined, page, limit: 12 }
      : { limit: 0, page: 1 }
  );

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: recData } = useRecommendations(!!user);
  const { data: catData } = useCategories();

  const featured    = featuredData?.data?.products || [];
  const recommended = recData?.data?.products      || [];
  const filtered    = filteredData?.data?.products || [];
  const pagination  = filteredData?.data?.pagination;
  const categories  = catData?.data?.categories    || [];

  const recommendedBooks = (user && recommended.length > 0) ? recommended.slice(0, 3) : featured.slice(0, 3);
  const bestsellers      = featured.slice(3, 6);
  const newLaunches      = featured.slice(6, 9);

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

  const handleCategoryClick = (item) => {
    setActiveCategory(item.label);
    setSidebarOpen(false);
    if (!item.slug) { navigate('/catalogue'); return; }
    const found = categories.find(c => c.slug === item.slug || c.name.toLowerCase() === item.label.toLowerCase());
    navigate(found ? `/categories/${found.slug}` : `/categories/${item.slug}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-44px)] bg-bw-bg relative">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left sidebar ── */}
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
          const active = activeCategory === item.label;
          return (
            <button
              key={item.label}
              onClick={() => handleCategoryClick(item)}
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

      {/* ── Right column: filter bar + content ── */}
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

          {/* Filter dropdowns — hidden on very small screens, visible from sm */}
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

            {/* Filtered results */}
            {hasFilters && (
              <>
                {pagination && (
                  <p className="text-[12px] text-bw-subtle mb-3">{pagination.total} books found</p>
                )}
                {filteredError && (
                  <p className="text-red-400 text-[13px] mb-3">Failed to load books.</p>
                )}
                {filteredLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center pt-16">
                    <p className="text-bw-muted text-sm">No books found.</p>
                    <button
                      onClick={() => { setLocalSearch(''); setSearchParams({}); }}
                      className="mt-3 text-blue-400 text-[13px] bg-transparent border-none cursor-pointer hover:underline"
                    >
                      Clear filters →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </>
            )}

            {/* Default sections */}
            {!hasFilters && (
              <>
                <SectionRow title="Recommended for You"    products={recommendedBooks} loading={featuredLoading} />
                <SectionRow title="Bestsellers this Month" products={bestsellers}      loading={featuredLoading} />
                <SectionRow title="New Launches"           products={newLaunches}      loading={featuredLoading} />
              </>
            )}

          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
