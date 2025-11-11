'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from './useDarkMode';
import SkeletonLoader from './SkeletonLoader';

interface OrderData {
  item: string;
  quantity: number;
  name: string;
  address: string;
  phone: string;
  specialInstructions?: string;
}

interface OrderHistory {
  id: string;
  orderData: OrderData;
  total: number;
  timestamp: Date;
  status: 'confirmed' | 'preparing' | 'delivered';
}

export default function Home() {
  const [theme, toggleTheme] = useDarkMode();
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    item: '',
    quantity: 1,
    name: '',
    address: '',
    phone: '',
    specialInstructions: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Load order history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('orderHistory');
    if (savedHistory) {
      setOrderHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Simulate order status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderHistory(prevHistory => {
        const updatedHistory = prevHistory.map(order => {
          if (order.status === 'confirmed') {
            return { ...order, status: 'preparing' };
          } else if (order.status === 'preparing') {
            return { ...order, status: 'delivered' };
          }
          return order;
        });
        localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }, 30000); // Update status every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    validateForm();
  }, [orderData]);

  const menuItems = [
    { name: 'Pizza', price: 12.99, emoji: '🍕', category: 'Italian', description: 'Classic cheese pizza with tomato sauce' },
    { name: 'Burger', price: 8.99, emoji: '🍔', category: 'American', description: 'Juicy beef burger with lettuce and tomato' },
    { name: 'Pasta', price: 10.99, emoji: '🍝', category: 'Italian', description: 'Creamy Alfredo pasta with parmesan' },
    { name: 'Salad', price: 7.99, emoji: '🥗', category: 'Healthy', description: 'Fresh garden salad with vinaigrette' },
    { name: 'Sandwich', price: 6.99, emoji: '🥪', category: 'American', description: 'Turkey and cheese sandwich' },
    { name: 'Sushi', price: 15.99, emoji: '🍣', category: 'Japanese', description: 'Fresh salmon and tuna rolls' },
    { name: 'Taco', price: 9.99, emoji: '🌮', category: 'Mexican', description: 'Beef tacos with salsa and cheese' },
    { name: 'Ramen', price: 11.99, emoji: '🍜', category: 'Japanese', description: 'Hot ramen noodles with broth' }
  ];

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemSelect = (item: string) => {
    setOrderData({ ...orderData, item });
    setStep(2);
  };

  const handleQuantityChange = (quantity: number) => {
    if (quantity >= 1 && quantity <= 20) {
      setOrderData({ ...orderData, quantity });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData({ ...orderData, [name]: value });
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!orderData.name.trim()) {
      errors.name = 'Name is required';
    } else if (orderData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!orderData.address.trim()) {
      errors.address = 'Address is required';
    } else if (orderData.address.trim().length < 10) {
      errors.address = 'Please enter a complete address';
    }
    
    if (!orderData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(orderData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to order history
    const newOrder: OrderHistory = {
      id: Date.now().toString(),
      orderData: { ...orderData },
      total: (menuItems.find(item => item.name === orderData.item)?.price || 0) * orderData.quantity,
      timestamp: new Date(),
      status: 'confirmed'
    };
    
    const updatedHistory = [newOrder, ...orderHistory.slice(0, 9)]; // Keep only last 10 orders
    setOrderHistory(updatedHistory);
    localStorage.setItem('orderHistory', JSON.stringify(updatedHistory));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleClearHistory = () => {
    setOrderHistory([]);
    localStorage.removeItem('orderHistory');
  };

  const handleReorder = (order: OrderHistory) => {
    setOrderData({
      item: order.orderData.item,
      quantity: order.orderData.quantity,
      name: order.orderData.name,
      address: order.orderData.address,
      phone: order.orderData.phone,
      specialInstructions: order.orderData.specialInstructions
    });
    setShowHistory(false);
    setStep(2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
        <div className="min-h-screen animated-gradient p-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <SkeletonLoader />
            </div>
        </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center p-4 sm:p-6">
        <div className="glass-card bg-white/70 dark:bg-black/50 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center animate-fade-in">
          <div className="text-5xl sm:text-6xl mb-4 animate-bounce">✅</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">Thank you for your order, {orderData.name}!</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl sm:text-4xl mr-3">{menuItems.find(item => item.name === orderData.item)?.emoji}</span>
              <div>
                <p className="font-bold text-base sm:text-lg">{orderData.quantity}x {orderData.item}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency((menuItems.find(item => item.name === orderData.item)?.price || 0) * orderData.quantity)}
                </p>
              </div>
            </div>
            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-gray-600 mb-1">Delivery to:</p>
              <p className="font-medium">{orderData.address}</p>
              <p className="text-sm text-gray-500 mt-1">Estimated delivery: 25-35 minutes</p>
            </div>
            {orderData.specialInstructions && (
              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-600">Special instructions:</p>
                <p className="text-sm italic">{orderData.specialInstructions}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setStep(1);
                setOrderData({ item: '', quantity: 1, name: '', address: '', phone: '', specialInstructions: '' });
                setFormErrors({});
              }}
              className="w-full sm:flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold"
            >
              New Order
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="w-full sm:flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200 font-semibold"
            >
              Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen animated-gradient p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card bg-white/70 dark:bg-black/50 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Order History</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleClearHistory}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear History
                </button>
              </div>
            </div>
            
            {orderHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">No orders yet. Start ordering!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">
                          {menuItems.find(item => item.name === order.orderData.item)?.emoji}
                        </span>
                        <div>
                          <h3 className="font-bold text-lg">{order.orderData.quantity}x {order.orderData.item}</h3>
                          <p className="text-sm text-gray-600">{formatDate(order.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl">{formatCurrency(order.total)}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Customer:</strong> {order.orderData.name}</p>
                      <p><strong>Delivery to:</strong> {order.orderData.address}</p>
                      <p><strong>Phone:</strong> {order.orderData.phone}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleReorder(order)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Re-order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quick Order
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Fast & Simple Food Ordering</p>
          
          {/* Dark Mode Toggle */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={toggleTheme}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
            >
              {theme === 'light' ? '🌙' : '☀️'}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            
            {orderHistory.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors font-medium"
              >
                📋 View Order History ({orderHistory.length})
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step === 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="ml-3 font-medium">Choose Food</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-6 rounded"></div>
          <div className={`flex items-center ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 2 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-3 font-medium">Delivery Info</span>
          </div>
        </div>

        {/* Search Bar */}
        {step === 1 && (
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search food or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <div className="absolute left-4 top-3.5 text-gray-400">
                🔍
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 1: What to Order */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">What would you like to order?</h2>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl sm:text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">No items found. Try a different search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleItemSelect(item.name)}
                    className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 text-center group hover:shadow-lg hover:scale-105 transform menu-item-lift"
                  >
                    <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform">{item.emoji}</div>
                    <div className="font-bold text-lg sm:text-xl text-gray-800 mb-1">{item.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{item.category}</div>
                    <div className="text-sm text-gray-500 mb-3">{item.description}</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(item.price)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Delivery Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Delivery Details</h2>
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors self-start sm:self-center"
              >
                ← Back to Menu
              </button>
            </div>

            {/* Selected Item Summary */}
            <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <span className="text-3xl sm:text-4xl mr-4">{menuItems.find(item => item.name === orderData.item)?.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800">{orderData.item}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{menuItems.find(item => item.name === orderData.item)?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {formatCurrency((menuItems.find(item => item.name === orderData.item)?.price || 0) * orderData.quantity)}
                  </p>
                  <div className="flex items-center justify-end mt-2">
                    <button
                      onClick={() => handleQuantityChange(Math.max(1, orderData.quantity - 1))}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors font-bold"
                    >
                      −
                    </button>
                    <span className="mx-3 sm:mx-4 font-bold text-lg sm:text-xl min-w-12 text-center">{orderData.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(orderData.quantity + 1)}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleDeliverySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={orderData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={orderData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      formErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="(555) 123-4567"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address *</label>
                <textarea
                  required
                  name="address"
                  value={orderData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="123 Main Street, City, State ZIP"
                  rows={3}
                />
                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea
                  name="specialInstructions"
                  value={orderData.specialInstructions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Any special requests for your order..."
                  rows={2}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Item:</span>
                    <span className="font-medium">{orderData.quantity}x {orderData.item}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Price:</span>
                    <span className="font-medium">
                      {formatCurrency(menuItems.find(item => item.name === orderData.item)?.price || 0)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency((menuItems.find(item => item.name === orderData.item)?.price || 0) * orderData.quantity)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>💳 Cash on Delivery</p>
                    <p>🚚 Estimated delivery: 25-35 minutes</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shimmer-btn"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing Order...
                  </>
                ) : (
                  '🚀 Place Order Now'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
