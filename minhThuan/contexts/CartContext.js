import axios from 'axios';
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const [totalCartPrice, setTotalCartPrice] = useState(0);

  
  const addToCart = (newItem) => {
    setCartItems(prevCartItems => {
      const existingItemIndex = prevCartItems.findIndex(cartItem =>
        cartItem.name === newItem.name &&
        cartItem.size === newItem.size &&
        JSON.stringify(cartItem.toppings) === JSON.stringify(newItem.toppings) &&
        cartItem.specialNote === newItem.specialNote &&
        cartItem.spiciness === newItem.spiciness
      );
  
      if (existingItemIndex !== -1) {
        // Nếu sản phẩm đã tồn tại, cập nhật số lượng và giá trị tổng
        return prevCartItems.map((cartItem, index) =>
          index === existingItemIndex
            ? {
                ...cartItem,
                quantity: cartItem.quantity + newItem.quantity,
                totalprice: (cartItem.price * (cartItem.quantity + newItem.quantity)).toFixed(2)
              }
            : cartItem
        );
      } else {
        // Thêm sản phẩm mới vào giỏ hàng nếu chưa có
        return [...prevCartItems, { ...newItem, quantity: newItem.quantity, totalprice: (newItem.price * newItem.quantity).toFixed(2) }];
      }
    });
  };
  
  

  const incrementQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    const newTotalPrice = ((parseFloat(item.price)) * newQuantity).toFixed(2);
  
    // Gửi yêu cầu PUT để cập nhật cơ sở dữ liệu
    axios.put(`http://192.168.1.67:7777/cart/${item.id}`, {
      ...item,
      quantity: newQuantity,
      total_price: newTotalPrice,
    })
    .then(response => {
      console.log('Cập nhật thành công', response.data);
    })
    .catch(error => {
      console.error('Lỗi khi cập nhật giỏ hàng:', error);
    });
  
    // Cập nhật giỏ hàng trong Context
    setCartItems(prevCartItems =>
      prevCartItems.map(cartItem =>
        cartItem.id === item.id &&
        cartItem.name === item.name &&
        cartItem.size === item.size &&
        JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings) &&
        cartItem.spiciness === item.spiciness &&
        cartItem.specialNote === item.specialNote
          ? {
              ...cartItem,
              quantity: newQuantity,
              price: newTotalPrice
            }
          : cartItem
      )
    );
  };
  
  const decrementQuantity = (item) => {
    const newQuantity = Math.max(1, item.quantity - 1);
    const newTotalPrice = ((parseFloat(item.price)) * newQuantity).toFixed(2);
  
    // Gửi yêu cầu PUT để cập nhật cơ sở dữ liệu
    axios.put(`http://192.168.1.67:7777/cart/${item.id}`, {
      ...item,
      quantity: newQuantity,
      total_price: newTotalPrice,
    })
    .then(response => {
      console.log('Cập nhật thành công', response.data);
    })
    .catch(error => {
      console.error('Lỗi khi cập nhật giỏ hàng:', error);
    });
  
    // Cập nhật giỏ hàng trong Context
    setCartItems(prevCartItems =>
      prevCartItems.map(cartItem =>
        cartItem.id === item.id &&
        cartItem.name === item.name &&
        cartItem.size === item.size &&
        JSON.stringify(cartItem.toppings) === JSON.stringify(item.toppings) &&
        cartItem.spiciness === item.spiciness &&
        cartItem.specialNote === item.specialNote
          ? {
              ...cartItem,
              quantity: newQuantity,
              price: newTotalPrice
            }
          : cartItem
      )
    );
  };
  
  
  const clearCart = () => {
    setCartItems([]);
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  
  const removeFromCart = (itemToRemove) => {
    setCartItems(prevItems =>
      prevItems.filter(cartItem =>
        !(
          cartItem.name === itemToRemove.name &&
          cartItem.selectedSize === itemToRemove.selectedSize &&
          JSON.stringify(cartItem.selectedToppings) === JSON.stringify(itemToRemove.selectedToppings) &&
          cartItem.specialNote === itemToRemove.specialNote &&
          cartItem.selectedSpiciness === itemToRemove.selectedSpiciness // Chỉnh đúng điều kiện này
        )
      )
    );
  };
  

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };
  const calculateTotalCartPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice * item.quantity, 0);
  };

  const calculateTotalCartPrice01 = () => {
    // Kiểm tra xem giỏ hàng có trống không
    if (!cartItems || cartItems.length === 0) return 0;
  
    // Sử dụng reduce để tính tổng giá của tất cả sản phẩm trong giỏ hàng
    return cartItems.reduce((total, item) => {
      // Tính tổng dựa trên thuộc tính `total_price` của mỗi item
      return total + (parseFloat(item.totalprice) || 0);
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, setCartItems, totalCartPrice,
        setTotalCartPrice, addToCart, getTotalQuantity, calculateTotalCartPrice, calculateTotalCartPrice01, clearCart, calculateTotalPrice, incrementQuantity, decrementQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
