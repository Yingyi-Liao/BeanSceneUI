import React, { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orderItems, setOrderItems] = useState([]);

  const addItem = (item, qty = 1) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);

      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + qty } : i
        );
      }

      return [...prev, { ...item, qty }];
    });
  };

  const updateQty = (id, qty) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  const removeItem = (id) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearOrder = () => setOrderItems([]);

  return (
    <OrderContext.Provider
      value={{ orderItems, addItem, updateQty, removeItem, clearOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
