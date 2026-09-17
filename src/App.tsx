import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Search, 
  AlertCircle 
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ClickitAIAssistant } from './components/ClickitAIAssistant';
import { StoreManagerView } from './components/StoreManagerView';
import { DeliveryPartnerView } from './components/DeliveryPartnerView';
import { AdminIntelligenceCenter } from './components/AdminIntelligenceCenter';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OrdersListModal } from './components/OrdersListModal';
import { 
  UserRole, 
  Product, 
  Category, 
  Store, 
  Coupon, 
  CartItem, 
  Order, 
  OrderStatus, 
  DemandForecast, 
  AnomalySignal, 
  AgentTrace 
} from './types';

export default function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('CUSTOMER');
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalySignal[]>([]);
  const [agentTraces, setAgentTraces] = useState<AgentTrace[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (Local + Verified against backend)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [isOrdersListOpen, setIsOrdersListOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Loading & Telemetry
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  const fetchAllData = async () => {
    try {
      const [
        storesRes,
        categoriesRes,
        productsRes,
        couponsRes,
        ordersRes,
        forecastsRes,
        anomaliesRes,
        tracesRes,
      ] = await Promise.all([
        fetch('/api/v1/stores'),
        fetch('/api/v1/categories'),
        fetch('/api/v1/products'),
        fetch('/api/v1/coupons'),
        fetch('/api/v1/orders'),
        fetch('/api/v1/intelligence/forecasts'),
        fetch('/api/v1/intelligence/anomalies'),
        fetch('/api/v1/agents/traces'),
      ]);

      const [
        storesData,
        categoriesData,
        productsData,
        couponsData,
        ordersData,
        forecastsData,
        anomaliesData,
        tracesData,
      ] = await Promise.all([
        storesRes.json(),
        categoriesRes.json(),
        productsRes.json(),
        couponsRes.json(),
        ordersRes.json(),
        forecastsRes.json(),
        anomaliesRes.json(),
        tracesRes.json(),
      ]);

      if (storesData.success && storesData.data.length > 0) {
        setStores(storesData.data);
        if (!activeStore) {
          setActiveStore(storesData.data[0]);
        }
      }
      if (categoriesData.success) setCategories(categoriesData.data);
      if (productsData.success) setProducts(productsData.data);
      if (couponsData.success) setCoupons(couponsData.data);
      if (ordersData.success) setOrders(ordersData.data);
      if (forecastsData.success) setForecasts(forecastsData.data);
      if (anomaliesData.success) setAnomalies(anomaliesData.data);
      if (tracesData.success) setAgentTraces(tracesData.data);
    } catch (err) {
      console.error('Initial data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update products when activeStore changes
  useEffect(() => {
    if (!activeStore) return;
    const fetchStoreProducts = async () => {
      try {
        const res = await fetch(`/api/v1/products?storeId=${activeStore.id}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error('Failed to load store products:', err);
      }
    };
    fetchStoreProducts();
  }, [activeStore?.id]);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const handleAddAllToCart = (suggestedProducts: Product[]) => {
    setCartItems((prev) => {
      const newItems = [...prev];
      for (const p of suggestedProducts) {
        const idx = newItems.findIndex((item) => item.product.id === p.id);
        if (idx >= 0) {
          newItems[idx] = { ...newItems[idx], quantity: newItems[idx].quantity + 1 };
        } else {
          newItems.push({ product: p, quantity: 1 });
        }
      }
      return newItems;
    });
    setIsCartOpen(true);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Cart Totals
  const cartItemCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.product.sellingPrice * it.quantity, 0),
    [cartItems]
  );

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const c = coupons.find((x) => x.code.toUpperCase() === appliedCoupon.toUpperCase());
    if (!c || cartSubtotal < c.minOrderValue) return 0;
    return c.discountType === 'FLAT' ? c.value : Math.round((cartSubtotal * c.value) / 100);
  }, [appliedCoupon, coupons, cartSubtotal]);

  const deliveryFee = cartSubtotal === 0 || cartSubtotal > 199 || appliedCoupon === 'FREEDEL' ? 0 : 25;
  const handlingFee = cartSubtotal > 0 ? 4 : 0;
  const cartGrandTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryFee + handlingFee);

  // Filtered Products for Customer Storefront
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryId === 'all' || p.category === selectedCategoryId;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Order Lifecycle Management
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
    setTrackingOrder(newOrder);
    fetchAllData(); // Refresh product inventories immediately
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data : o)));
        if (trackingOrder && trackingOrder.id === orderId) {
          setTrackingOrder(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'CANCELLED');
    fetchAllData();
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      const res = await fetch(`/api/v1/intelligence/anomalies/${anomalyId}/resolve`, {
        method: 'POST',
      });
      if (res.ok) {
        setAnomalies((prev) =>
          prev.map((a) => (a.id === anomalyId ? { ...a, resolved: true } : a))
        );
      }
    } catch (err) {
      console.error('Failed to resolve anomaly:', err);
    }
  };

  const activeCustomerOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col selection:bg-[#0C831F] selection:text-white font-sans text-[#1a1a2e]">
      {/* Universal Navigation */}
      {activeStore && (
        <Navbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          stores={stores}
          activeStore={activeStore}
          onSelectStore={setActiveStore}
          cartCount={cartItemCount}
          cartTotal={cartGrandTotal}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAI={() => {
            setAiInitialPrompt('');
            setIsAIOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenOrders={() => setIsOrdersListOpen(true)}
          activeOrdersCount={activeCustomerOrders.length}
        />
      )}

      {/* Main Role-Based Views */}
      <main className="flex-1 pb-24 sm:pb-12">
        {/* 1. CUSTOMER STOREFRONT VIEW */}
        {currentRole === 'CUSTOMER' && activeStore && (
          <div>
            {/* Category Navigation Bar */}
            <CategoryBar
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            {/* Quick-Commerce Hero Promotional Banner */}
            {!searchQuery && selectedCategoryId === 'all' && (
              <HeroBanner
                onOpenAI={(prompt) => {
                  setAiInitialPrompt(prompt || '');
                  setIsAIOpen(true);
                }}
                onApplyPromo={(code) => {
                  setAppliedCoupon(code);
                  setIsCartOpen(true);
                }}
              />
            )}

            {/* Products Grid Section */}
            <div className="max-w-7xl mx-auto px-4 pt-5 pb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#1a1a2e] flex items-center space-x-2">
                    <span>
                      {selectedCategoryId === 'all'
                        ? searchQuery
                          ? `Results for "${searchQuery}"`
                          : 'Buy it again & more'
                        : categories.find((c) => c.id === selectedCategoryId)?.name || 'Category'}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      ({filteredProducts.length})
                    </span>
                  </h2>
                  <p className="text-[11px] text-gray-400 font-medium">
                    ⚡ {activeStore.etaMinutes}-minute delivery from {activeStore.name}
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-[#0C831F] hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-base font-bold text-gray-800 mb-1">No items found</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    We couldn't find items matching your search. Try searching for milk, bread, snacks, or coffee!
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategoryId('all');
                    }}
                    className="px-5 py-2.5 bg-[#0C831F] text-white font-bold text-xs rounded-xl hover:bg-[#0a7119] transition-colors"
                  >
                    View All Items
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filteredProducts.map((product) => {
                    const cartItem = cartItems.find((ci) => ci.product.id === product.id);
                    const qty = cartItem ? cartItem.quantity : 0;

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        quantityInCart={qty}
                        onAddToCart={handleAddToCart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onSelectProduct={(p) => setSelectedProductForDetail(p)}
                        storeEtaMinutes={activeStore.etaMinutes}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. STORE MANAGER VIEW */}
        {currentRole === 'STORE_MANAGER' && activeStore && (
          <StoreManagerView
            stores={stores}
            activeStore={activeStore}
            onSelectStore={setActiveStore}
            orders={orders}
            products={products}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshData={fetchAllData}
          />
        )}

        {/* 3. DELIVERY PARTNER RIDER VIEW */}
        {currentRole === 'DELIVERY_PARTNER' && (
          <DeliveryPartnerView
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshData={fetchAllData}
          />
        )}

        {/* 4. ADMIN AUTONOMOUS INTELLIGENCE VIEW */}
        {currentRole === 'ADMIN' && (
          <AdminIntelligenceCenter
            orders={orders}
            stores={stores}
            products={products}
            forecasts={forecasts}
            anomalies={anomalies}
            agentTraces={agentTraces}
            onResolveAnomaly={handleResolveAnomaly}
            onRefreshData={fetchAllData}
          />
        )}
      </main>

      {/* Floating Bottom Bar for Mobile Cart */}
      {currentRole === 'CUSTOMER' && cartItemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 sm:hidden z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-[#0C831F] active:bg-[#0a7119] text-white rounded-2xl shadow-xl shadow-green-900/30 flex items-center justify-between font-extrabold text-sm transition-colors"
          >
            <div className="text-left">
              <div className="text-[11px] text-white/80 font-semibold">{cartItemCount} items</div>
              <div className="text-sm font-black">₹{cartGrandTotal}</div>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/20 px-4 py-2 rounded-xl text-xs font-bold">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(code) => setAppliedCoupon(code)}
        onRemoveCoupon={() => setAppliedCoupon(null)}
        availableCoupons={coupons}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      {activeStore && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          activeStore={activeStore}
          totalAmount={cartGrandTotal}
          itemCount={cartItemCount}
          onOrderPlaced={handleOrderPlaced}
          items={cartItems.map((ci) => ({ productId: ci.product.id, quantity: ci.quantity }))}
          couponCode={appliedCoupon}
        />
      )}

      {/* Order Tracking Modal */}
      {trackingOrder && (
        <OrderTrackingModal
          order={trackingOrder}
          isOpen={!!trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onAdvanceStatus={handleUpdateOrderStatus}
          onCancelOrder={handleCancelOrder}
        />
      )}

      {/* Clickit AI Assistant Modal */}
      {activeStore && (
        <ClickitAIAssistant
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          activeStore={activeStore}
          cartCount={cartItemCount}
          onAddToCart={handleAddToCart}
          onAddAllToCart={handleAddAllToCart}
          initialPrompt={aiInitialPrompt}
        />
      )}

      {/* Product Detail Modal */}
      {activeStore && (
        <ProductDetailModal
          product={selectedProductForDetail}
          isOpen={!!selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
          quantityInCart={
            selectedProductForDetail
              ? cartItems.find((ci) => ci.product.id === selectedProductForDetail.id)?.quantity || 0
              : 0
          }
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          stores={stores}
          activeStore={activeStore}
        />
      )}

      {/* Customer Orders List Modal */}
      <OrdersListModal
        isOpen={isOrdersListOpen}
        onClose={() => setIsOrdersListOpen(false)}
        orders={orders}
        onSelectOrder={(ord) => setTrackingOrder(ord)}
      />
    </div>
  );
}
