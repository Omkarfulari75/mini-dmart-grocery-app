import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY'); // HOME_DELIVERY | STORE_PICKUP
  const [pickupBranch, setPickupBranch] = useState('Mini D-Mart Express (Andheri East Branch)');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledSlot, setScheduledSlot] = useState('10:00 AM - 12:00 PM');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Sunshine Heights, MG Road, Mumbai');
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  useEffect(() => {
    localStorage.setItem('dmart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock_quantity) {
          alert(`Cannot add more than ${product.stock_quantity} units available in inventory.`);
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (quantity > product.stock_quantity) {
          alert(`Cannot add more than ${product.stock_quantity} units available in inventory.`);
          return prev;
        }
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          original_price: product.price,
          unit: product.unit,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
          is_pickup_eligible: product.is_pickup_eligible,
          quantity
        }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.stock_quantity) {
            alert(`Stock limit reached (${item.stock_quantity} units max).`);
            return item;
          }
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const applyPromo = (code) => {
    if (code.toUpperCase() === 'DMART10') {
      setIsPromoApplied(true);
      setPromoCode('DMART10');
      return { success: true, message: '10% promotional discount applied!' };
    } else {
      setIsPromoApplied(false);
      return { success: false, message: 'Invalid promo code. Try DMART10' };
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round((subtotal * 0.05) * 100) / 100;
  const deliveryFee = fulfillmentType === 'HOME_DELIVERY' ? (subtotal > 500 || subtotal === 0 ? 0 : 40) : 0;
  const pickupDiscount = fulfillmentType === 'STORE_PICKUP' && subtotal > 0 ? 20 : 0;
  const promoDiscount = isPromoApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal + tax + deliveryFee - pickupDiscount - promoDiscount);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItemCount,
      subtotal,
      tax,
      deliveryFee,
      pickupDiscount,
      promoDiscount,
      grandTotal,
      fulfillmentType,
      setFulfillmentType,
      pickupBranch,
      setPickupBranch,
      scheduledDate,
      setScheduledDate,
      scheduledSlot,
      setScheduledSlot,
      deliveryAddress,
      setDeliveryAddress,
      promoCode,
      applyPromo,
      isPromoApplied
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
