import React, { useState } from 'react';
import { ShoppingBag, Sparkles, MapPin, ChevronDown, Store as StoreIcon, ShieldCheck, Bike, PackageCheck, Search, X, Mic } from 'lucide-react';
import { UserRole, Store } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  stores: Store[];
  activeStore: Store;
  onSelectStore: (store: Store) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAI: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenOrders: () => void;
  activeOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  stores,
  activeStore,
  onSelectStore,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAI,
  searchQuery,
  onSearchChange,
  onOpenOrders,
  activeOrdersCount,
}) => {
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Role Switcher Bar — Compact top strip */}
      <div className="bg-[#1a1a2e] text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#F8CB46] tracking-wide">⚡ CLICKIT</span>
            <span className="text-white/50 hidden sm:inline">|</span>
            <span className="text-white/60 font-medium hidden sm:inline">
              AI-powered quick commerce platform
            </span>
          </div>

          {/* Role Switcher Pills */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onRoleChange('CUSTOMER')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                currentRole === 'CUSTOMER'
                  ? 'bg-[#0C831F] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => onRoleChange('STORE_MANAGER')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-all flex items-center space-x-1 ${
                currentRole === 'STORE_MANAGER'
                  ? 'bg-amber-500 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <PackageCheck className="w-3 h-3" />
              <span>Store</span>
            </button>
            <button
              onClick={() => onRoleChange('DELIVERY_PARTNER')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-all flex items-center space-x-1 ${
                currentRole === 'DELIVERY_PARTNER'
                  ? 'bg-blue-500 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Rider</span>
            </button>
            <button
              onClick={() => onRoleChange('ADMIN')}
              className={`px-2.5 py-0.5 rounded-full font-semibold transition-all flex items-center space-x-1 ${
                currentRole === 'ADMIN'
                  ? 'bg-purple-500 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden md:inline">Intelligence</span>
              <span className="md:hidden">AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Green Header — Blinkit Style */}
      <div className="bg-[#0C831F] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 md:gap-5">
            {/* Logo + Location */}
            <div className="flex items-center space-x-3 shrink-0">
              {/* Logo */}
              <div
                onClick={() => onRoleChange('CUSTOMER')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <span className="text-[#0C831F] font-black text-lg">C</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-black tracking-tight leading-none">
                    Click<span className="text-[#F8CB46]">it</span>
                  </div>
                  <div className="text-[9px] font-medium text-white/60 tracking-widest uppercase leading-none mt-0.5">
                    GROCERIES IN MINUTES
                  </div>
                </div>
              </div>

              {/* Delivery Location — Blinkit style */}
              <div className="relative border-l border-white/20 pl-3">
                <button
                  onClick={() => setStoreMenuOpen(!storeMenuOpen)}
                  className="text-left flex items-center space-x-1.5 hover:opacity-90 transition-opacity"
                >
                  <MapPin className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center space-x-1">
                      <span>Delivery in {activeStore.etaMinutes} minutes</span>
                      <ChevronDown className="w-3 h-3 text-white/70" />
                    </div>
                    <div className="text-[11px] text-white/70 truncate max-w-[150px] sm:max-w-[220px] leading-tight">
                      {activeStore.address}
                    </div>
                  </div>
                </button>

                {/* Store Modal */}
                {storeMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setStoreMenuOpen(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-50 text-gray-900 animate-fade-in-up overflow-hidden">
                      <div className="p-5 sm:p-6">
                        <div className="flex justify-between items-center mb-5">
                          <h2 className="text-lg font-bold text-gray-800">Change Location</h2>
                          <button onClick={() => setStoreMenuOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex items-start space-x-3 sm:space-x-4 mb-6">
                          <div className="bg-gray-100 p-2 sm:p-3 rounded-full shrink-0">
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                          </div>
                          <p className="text-sm text-gray-600 leading-snug pt-1">
                            Please provide your delivery location to see products at nearby store
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-2">
                          <button 
                            onClick={() => {
                              if (!navigator.geolocation) {
                                alert('Geolocation is not supported by your browser.');
                                return;
                              }
                              
                              const btn = document.getElementById('detect-btn-text');
                              if (btn) btn.innerText = 'Detecting...';

                              navigator.geolocation.getCurrentPosition(async (position) => {
                                try {
                                  const { latitude, longitude } = position.coords;
                                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                  const data = await res.json();
                                  
                                  const detectedAddress = data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                                  
                                  const customStore: Store = {
                                    id: 'detected-' + Date.now(),
                                    name: 'My Location',
                                    zone: data.address?.city || data.address?.state || 'Detected Area',
                                    address: detectedAddress,
                                    etaMinutes: 10,
                                    code: 'DETECTED',
                                    isActive: true,
                                    coordinates: { lat: latitude, lng: longitude },
                                    operationalHours: '24/7',
                                  };
                                  
                                  onSelectStore(customStore);
                                  setStoreMenuOpen(false);
                                } catch (err) {
                                  console.error(err);
                                  // Fallback
                                  if (stores.length > 0) {
                                    onSelectStore(stores[0]);
                                    setStoreMenuOpen(false);
                                  }
                                } finally {
                                  if (btn) btn.innerText = 'Detect my location';
                                }
                              }, (error) => {
                                console.error(error);
                                alert('Unable to retrieve your location. Please check browser permissions.');
                                if (btn) btn.innerText = 'Detect my location';
                              });
                            }}
                            className="w-full sm:w-auto bg-[#0C831F] hover:bg-[#0a6c19] text-white font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center whitespace-nowrap text-sm shadow-sm"
                          >
                            <span id="detect-btn-text">Detect my location</span>
                          </button>
                          
                          <div className="w-full sm:w-auto flex items-center justify-center relative py-2 sm:py-0">
                            <div className="border-t border-gray-200 w-full sm:hidden absolute top-1/2"></div>
                            <span className="bg-white px-2 text-[10px] text-gray-400 font-bold uppercase relative z-10 border border-gray-200 sm:border-none rounded-full sm:rounded-none py-1 sm:py-0">OR</span>
                          </div>
                          
                          <div className="relative w-full">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                              type="text" 
                              placeholder="search delivery location" 
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0C831F] focus:ring-1 focus:ring-[#0C831F] text-sm bg-gray-50/50 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Available Stores */}
                      <div className="bg-gray-50/80 border-t border-gray-100 px-5 sm:px-6 py-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-wider">Available Dark Stores</div>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                           {stores.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  onSelectStore(s);
                                  setStoreMenuOpen(false);
                                }}
                                className={`w-full p-2.5 text-left text-sm rounded-xl flex items-center justify-between transition-all border ${
                                  s.id === activeStore.id
                                    ? 'bg-green-50/80 border-green-200 ring-1 ring-[#0C831F]/20'
                                    : 'bg-white border-gray-100 hover:border-green-200 hover:shadow-sm'
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                                  <div className="text-[11px] text-gray-500 mt-0.5">{s.zone}</div>
                                </div>
                                <span className="text-[10px] bg-green-100 text-[#0C831F] font-black px-2 py-1 rounded-lg">
                                  {s.etaMinutes} MIN
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Blinkit Yellow Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="w-4 h-4 text-[#0C831F]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder='Search "milk", "bread", "eggs", "coffee"...'
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-[#F8CB46] hover:bg-[#f5c63e] focus:bg-[#F8CB46] text-[#1a1a2e] text-sm font-medium pl-10 pr-10 py-2.5 rounded-xl border-2 border-[#e5b93a]/50 focus:border-[#e5b93a] focus:outline-none focus:ring-2 focus:ring-[#F8CB46]/30 transition-all placeholder:text-[#1a1a2e]/50"
                />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a2e]/50 hover:text-[#1a1a2e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Mic className="w-4 h-4 text-[#1a1a2e]/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* AI Assistant */}
              <button
                onClick={onOpenAI}
                className="relative px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold text-xs flex items-center space-x-1.5 transition-all border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F8CB46]" />
                <span className="hidden sm:inline">Clickit AI</span>
                <span className="sm:hidden">AI</span>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F8CB46] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F8CB46]"></span>
                </span>
              </button>

              {/* Orders */}
              <button
                onClick={onOpenOrders}
                className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors border border-white/15"
                title="Track Orders"
              >
                <PackageCheck className="w-4 h-4" />
                <span className="hidden md:inline">Orders</span>
                {activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F8CB46] text-[#1a1a2e] text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={onOpenCart}
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#2a9d3a] hover:bg-[#228f32] active:bg-[#1c7a2a] text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-black/10 transition-all"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#F8CB46] text-[#1a1a2e] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#2a9d3a]">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] opacity-80 leading-tight">{cartCount} items</div>
                  <div className="text-xs font-black leading-tight">₹{cartTotal}</div>
                </div>
                <div className="text-xs font-bold sm:hidden">₹{cartTotal}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
