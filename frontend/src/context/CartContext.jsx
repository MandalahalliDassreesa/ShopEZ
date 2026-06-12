import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [saveForLaterItems, setSaveForLaterItems] = useState(() => {
    const saved = localStorage.getItem('saveForLaterItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('appliedCoupon');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('saveForLaterItems', JSON.stringify(saveForLaterItems));
  }, [saveForLaterItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  // Add Item to Cart
  const addToCart = (product, qty, variant) => {
    setCartItems((prev) => {
      // Find if item with same ID and matching variant already exists
      const existingIndex = prev.findIndex((item) => {
        const idMatch = item.product === product._id;
        const sizeMatch = !variant.size || item.variant.size === variant.size;
        const colorMatch = !variant.color || item.variant.color === variant.color;
        const storageMatch = !variant.storage || item.variant.storage === variant.storage;
        const weightMatch = !variant.weight || item.variant.weight === variant.weight;
        return idMatch && sizeMatch && colorMatch && storageMatch && weightMatch;
      });

      // Find variant details for stock check
      let availableStock = product.variants[0]?.stockQuantity || 0;
      let variantPrice = product.price;
      
      const matchedVariant = product.variants.find((v) => {
        const sizeMatch = !variant.size || v.size === variant.size;
        const colorMatch = !variant.color || v.color === variant.color;
        const storageMatch = !variant.storage || v.storage === variant.storage;
        const weightMatch = !variant.weight || v.weight === variant.weight;
        return sizeMatch && colorMatch && storageMatch && weightMatch;
      });

      if (matchedVariant) {
        availableStock = matchedVariant.stockQuantity;
        variantPrice = product.price + (matchedVariant.priceAdjustment || 0);
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].qty + qty, availableStock);
        updated[existingIndex].qty = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            product: product._id,
            name: product.name,
            image: product.images[0],
            price: variantPrice,
            qty: Math.min(qty, availableStock),
            variant,
            isBOGO: product.isBOGO,
            brand: product.brand,
            category: product.category,
            maxStock: availableStock
          }
        ];
      }
    });
  };

  // Remove Item
  const removeFromCart = (productId, variant) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const idMatch = item.product === productId;
        const sizeMatch = !variant.size || item.variant.size === variant.size;
        const colorMatch = !variant.color || item.variant.color === variant.color;
        const storageMatch = !variant.storage || item.variant.storage === variant.storage;
        const weightMatch = !variant.weight || item.variant.weight === variant.weight;
        return !(idMatch && sizeMatch && colorMatch && storageMatch && weightMatch);
      })
    );
  };

  // Update Cart Quantity
  const updateCartQty = (productId, variant, qty) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const idMatch = item.product === productId;
        const sizeMatch = !variant.size || item.variant.size === variant.size;
        const colorMatch = !variant.color || item.variant.color === variant.color;
        const storageMatch = !variant.storage || item.variant.storage === variant.storage;
        const weightMatch = !variant.weight || item.variant.weight === variant.weight;

        if (idMatch && sizeMatch && colorMatch && storageMatch && weightMatch) {
          return { ...item, qty: Math.min(qty, item.maxStock) };
        }
        return item;
      })
    );
  };

  // Clear Cart
  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Save for Later
  const saveForLater = (cartItem) => {
    removeFromCart(cartItem.product, cartItem.variant);
    setSaveForLaterItems((prev) => {
      // Avoid duplicate saves
      const exists = prev.some((item) => item.product === cartItem.product);
      if (exists) return prev;
      return [...prev, cartItem];
    });
  };

  // Move back to Cart
  const moveToCart = (saveItem) => {
    setSaveForLaterItems((prev) =>
      prev.filter((item) => item.product !== saveItem.product)
    );
    setCartItems((prev) => [...prev, saveItem]);
  };

  // Remove from Save for Later
  const removeSaveForLater = (productId) => {
    setSaveForLaterItems((prev) => prev.filter((item) => item.product !== productId));
  };

  // Apply Coupon
  const applyCouponCode = async (code) => {
    try {
      const subtotal = getSubtotal();
      const { data } = await axios.post(`${API_BASE_URL}/coupons/apply`, {
        code,
        cartSubtotal: subtotal
      });
      setAppliedCoupon(data);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error applying coupon'
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // CALCULATIONS

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  // BOGO Discount: Buy One Get One Free on selected products
  const getBogoDiscount = () => {
    let discount = 0;
    cartItems.forEach((item) => {
      if (item.isBOGO && item.qty >= 2) {
        // Number of free items
        const freeItems = Math.floor(item.qty / 2);
        discount += freeItems * item.price;
      }
    });
    return discount;
  };

  const getTotals = () => {
    const itemsPrice = getSubtotal();
    const bogoDiscount = getBogoDiscount();
    
    // Apply coupon discount on top of subtotal
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        couponDiscount = ((itemsPrice - bogoDiscount) * appliedCoupon.discountValue) / 100;
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
      couponDiscount = Math.min(couponDiscount, itemsPrice - bogoDiscount);
    }

    const discountAmount = bogoDiscount + couponDiscount;
    const netItemsPrice = Math.max(0, itemsPrice - discountAmount);
    
    const taxPrice = netItemsPrice * 0.08; // 8% sales tax
    const shippingPrice = netItemsPrice > 150 || netItemsPrice === 0 ? 0 : 10; // Free shipping above $150
    const totalPrice = netItemsPrice + taxPrice + shippingPrice;

    // Delivery estimation range
    const today = new Date();
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 3);
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 5);

    const deliveryEstimate = {
      min: minDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      max: maxDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
    };

    return {
      itemsPrice,
      bogoDiscount,
      couponDiscount,
      discountAmount,
      taxPrice,
      shippingPrice,
      totalPrice,
      deliveryEstimate
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        saveForLaterItems,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        saveForLater,
        moveToCart,
        removeSaveForLater,
        applyCouponCode,
        removeCoupon,
        getSubtotal,
        getTotals
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
