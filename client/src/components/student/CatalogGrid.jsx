import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  MapPin,
  Tag,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function CatalogGrid({ onAddToBasket, onOpenCart }) {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, searchQuery]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      let url = '/api/inventory?';
      if (selectedCategory !== 'ALL') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    'ALL',
    'Microcontrollers',
    'Sensors',
    'Actuators',
    'Displays',
    'Tools & Passives',
    'E-Waste Refurbished'
  ];

  return (
    <div className="space-y-8">
      {/* Category Filter Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryOptions.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#1e293b] text-slate-100 border border-slate-600 font-semibold shadow-sm'
                    : 'bg-[#151b28] text-slate-400 border border-hairline hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ESP32, Uno, Gyro, Servo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="corporate-input pl-10 py-2 text-xs w-full"
          />
        </div>
      </div>

      {/* Component Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isAvailable = item.stock > 0;
          return (
            <div
              key={item.id}
              className="corporate-card corporate-card-hover rounded-2xl p-6 border border-hairline flex flex-col justify-between"
            >
              <div>
                {/* Badge & Category */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-[#0f1420] border border-hairline text-slate-300">
                    {item.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium uppercase tracking-wider ${
                    isAvailable ? 'status-pill-success' : 'status-pill-danger'
                  }`}>
                    {isAvailable ? `${item.stock} Available` : 'Out of Stock'}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-semibold text-base text-slate-100 mb-2 leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Shelf & Condition Details */}
                <div className="bg-[#0f1420] rounded-xl p-3.5 mb-4 space-y-1.5 font-mono text-xs border border-hairline">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                      Location:
                    </span>
                    <span className="text-slate-200">{item.shelf_location || 'Lab 302'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Condition:</span>
                    <span className="text-[#34d399] font-medium">{item.condition || 'Tested'}</span>
                  </div>
                </div>

                {/* Tags */}
                {item.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] text-slate-400 border border-hairline">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing & Mixed Basket Actions */}
              <div className="pt-4 border-t border-hairline space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rental Rate</div>
                    <div className="text-lg font-bold font-mono text-slate-100 tabular-nums">
                      ₹{item.daily_rate}<span className="text-xs font-normal text-slate-400">/day</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Security Deposit</div>
                    <div className="text-xs font-mono text-[#34d399] tabular-nums font-semibold">
                      +₹{item.security_deposit} (Refundable)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={!isAvailable}
                    onClick={() => onAddToBasket({ ...item, type: 'RENT' })}
                    className="py-2.5 px-4 rounded-xl btn-primary text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Rent
                  </button>

                  <button
                    disabled={!isAvailable}
                    onClick={() => onAddToBasket({ ...item, type: 'BUY' })}
                    className="py-2.5 px-4 rounded-xl btn-secondary text-xs font-medium flex items-center justify-center gap-1.5 tabular-nums disabled:opacity-40"
                    title={`Purchase outright for ₹${item.purchase_price}`}
                  >
                    Buy ₹{item.purchase_price}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-20 corporate-card rounded-2xl border border-hairline">
          <p className="text-sm text-slate-400">No components found matching your search query.</p>
        </div>
      )}
    </div>
  );
}
