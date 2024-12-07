import React, {useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../contexts/CartContext';
import { useVoucher } from '../contexts/VoucherContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const OrderReview = ({ navigation, route}) => {
  const isFocused = useIsFocused();

  const { cartItems, calculateTotalCartPrice, incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  const [totalCartPrice, setTotalCartPrice] = React.useState(calculateTotalCartPrice());
  const [deliveryAddress, setDeliveryAddress] = useState({
    id: 1,
    label: 'Nhà',
    address: 'Nhập Địa Chỉ Nhận Hàng',
    note: 'Ghi Chú Cho Tài Xế (Nếu Có)',
    name: 'Tên Khách Hàng',
    phone: 'Nhập SĐT Nhận Hàng',
  });
  const [promotion, setPromotion] = React.useState(0);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [deliveryTime, setDeliveryTime] = useState(`${formattedTime} - Hôm nay ${formattedDate}`);
  const { selectedVoucher, setSelectedVoucher } = useVoucher();
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  const [menuItems, setMenuItems] = useState(route.params?.menuItems || []);

  const [userId, setUserId] = useState(null);


  const deliveryFee = 2; // Phí giao hàng cố định

  useEffect(() => {
    if (route.params?.menuItems) {
      setMenuItems(route.params.menuItems);
    }
  }, [route.params?.menuItems]);
  
  useEffect(() => {
    // Update delivery time if available in navigation params
    if (route.params?.deliveryTime) {
      setDeliveryTime(route.params.deliveryTime);
    }
  }, [route.params?.deliveryTime]);

  useEffect(() => {
    if (isFocused) {
      fetchUserId();
    }
  }, [isFocused]);

  const fetchUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (!storedUserId) {
        Alert.alert('Error', 'User not found. Please log in again.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LoginScreen'),
          },
        ]);
        return;
      }
      setUserId(parseInt(storedUserId, 10)); // Convert to integer
    } catch (error) {
      console.error('Error fetching userId:', error);
    }
  };
  

  const handleOrderNow = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in. Please log in to proceed.');
      return;
    }
  
    if (!deliveryAddress.address) {
      Alert.alert('Error', 'Please provide a delivery address.');
      return;
    }
  
    try {
      const currentDate = new Date();
    const formattedDeliveryTime = currentDate.toISOString().slice(0, 19).replace('T', ' ');
      const orderData = {
        
        user_id: userId, // Ensure this is set correctly
        address_id: deliveryAddress.id || null, // Replace with a real address ID if available
        delivery_address: deliveryAddress.address, // Add delivery_address field
        delivery_name: deliveryAddress.name, // Add delivery_name field
        delivery_phone: deliveryAddress.phone, // Add delivery_phone field
        delivery_time: formattedDeliveryTime,
        payment_method_id: 4, // Assuming 1 is for "cash on delivery"
        voucher_id: selectedVoucher?.voucher_id || null,
        promotion: promotion,
        delivery_fee: deliveryFee,
        total_price: totalCartPrice - promotion + deliveryFee,
      };
  
      const response = await axios.post('http://192.168.1.67:7777/create-order', orderData);
      Alert.alert('Success', `Order created successfully! Order ID: ${response.data.order_id}`);
      navigation.navigate('LookingForDriver', { orderId: response.data.order_id, deliveryTime,
        deliveryAddress, });
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    }
  };
  
  
  const handleChangeDeliveryTime = () => {
    navigation.navigate('SelectDeliveryTime', {
      onSelectTime: (selectedTime) => {
        setDeliveryTime(selectedTime); // Cập nhật thời gian giao hàng
      },
    });
  };
  

  

   // Cập nhật totalCartPrice mỗi khi cartItems thay đổi
   useEffect(() => {
    const newTotal = calculateTotalCartPrice();
    setTotalCartPrice(newTotal);
    updatePromotion(newTotal);
  }, [cartItems, selectedVoucher]);

  
  useEffect(() => {
    // Nếu có địa chỉ mới từ navigation params, cập nhật deliveryAddress
    if (route.params?.selectedAddress) {
      setDeliveryAddress(route.params.selectedAddress);
    }
  }, [route.params?.selectedAddress]);

  useEffect(() => {
    // Nếu có phương thức thanh toán mới từ navigation params, cập nhật paymentMethod
    if (route.params?.paymentMethod) {
      setPaymentMethod(route.params.paymentMethod.name);
    }
  }, [route.params?.paymentMethod]);

  const handleSelectPaymentMethod = () => {
    navigation.navigate('PaymentMethodSelection');
  };


  // Hàm cập nhật giá trị giảm giá dựa trên voucher đã chọn và tổng giá trị giỏ hàng
  const updatePromotion = (subtotal) => {
    if (selectedVoucher) {
      const voucherName = selectedVoucher.name.toLowerCase();
      const voucherValue = selectedVoucher.value;
  
      // Percentage-based discount (e.g., -10%, -15%, etc.)
      if (voucherName.includes('%')) {
        const discountRate = voucherValue / 100;
  
        if (voucherName.toLowerCase().includes("bill over")) {
          // Update the regex to correctly capture the condition (e.g., $50)
          const conditionMatch = voucherName.match(/bill over \$?(\d+)/i);
          const conditionAmount = conditionMatch ? parseFloat(conditionMatch[1]) : 0;
        
          // Check if subtotal meets the condition
          if (subtotal >= conditionAmount) {
            setPromotion(subtotal * discountRate);
          } else {
            setPromotion(0); // No discount if condition not met
          }
        } else {
          // General percentage discount
          setPromotion(subtotal * discountRate);
        }
        
      }
      // Fixed amount discount (e.g., -$1 shipping fee, -$2 shipping fee)
      else if (voucherName.includes("shipping fee")) {
        setPromotion(1);
      }
      // Fixed amount discount without conditions (e.g., Freeship)
      else if (voucherName === "freeship") {
        setPromotion(2);
      }
      // Other cases with fixed amount discounts
      else if (!isNaN(voucherValue)) {
        // Handle fixed discounts for items like "Selected Items" or "Visa Card"
        if (voucherName.includes("for")) {
          // Example: -20% for first order or -5% for using Visa card
          setPromotion(voucherValue);
        } else {
          setPromotion(voucherValue);
        }
      } else {
        // Default fallback: no promotion
        setPromotion(0);
      }
    } else {
      // No voucher selected
      setPromotion(0);
    }
  };
  
  
  

  useEffect(() => {
    if (route.params?.selectedAddress) {
      setDeliveryAddress(route.params.selectedAddress);
    }
  }, [route.params?.selectedAddress]);

  
  // Hàm để thay đổi địa chỉ
  const handleChangeAddress = () => {
    navigation.navigate('DeliveryAddress', { menuItems });
  };

  const handleAddMoreItems = () => {
    navigation.navigate('RestaurantDetails', { category: 'Fast Food' }); // hoặc có thể thêm các params cần thiết
  };
  
  

  // Hàm tăng số lượng sản phẩm
  const handleIncreaseQuantity = (item) => {
    incrementQuantity(item);
  };

  // Hàm giảm số lượng sản phẩm, nếu số lượng là 1 và giảm nữa thì xóa sản phẩm khỏi giỏ hàng
  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      decrementQuantity(item);
    } else {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from the cart?',
         [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => removeFromCart(item) }, // Pass the full item object here
        ]
      );
    }
  };

  const handleSelectVoucher = () => {
    navigation.navigate('SelectOffers', {
      onSelectVoucher: (voucher) => {
        setSelectedVoucher(voucher);
      },
    });
  };

  // Tính toán tổng giá trị đơn hàng sau khi áp dụng khuyến mãi và phí giao hàng
  const totalPrice = totalCartPrice - promotion + deliveryFee;

  return (
    <FlatList
    data={cartItems}
    keyExtractor={(item, index) => index.toString()}
    contentContainerStyle={{ paddingBottom: -10 }}
    ListHeaderComponent={
      <>
        {/* Delivery Section */}
        <View style={styles.deliverySection}>
          <TouchableOpacity onPress={handleChangeAddress}>
            <View style={styles.deliveryInfo}>
                <Icon name="location-outline" size={18} color="#FF5722" />
                <View style={styles.deliveryDetails}>
                    <Text style={styles.deliveryLabel}>Địa chỉ giao hàng</Text>
                    <Text style={styles.deliveryText}>
                        {deliveryAddress.name} | {deliveryAddress.phone}
                    </Text>
                    <Text style={styles.deliveryText}>
                    {deliveryAddress.address}
                    </Text>
                    <Text style={styles.deliveryText}>
                    Note: {deliveryAddress.note}
                    </Text>
                </View>
            </View>
         </TouchableOpacity>

        {/* Hẹn giao */}
          <TouchableOpacity onPress={handleChangeDeliveryTime}>
            <View style={styles.deliveryInfo}>
                <Icon name="time-outline" size={18} color="#FF5722" />
                <View style={styles.deliveryDetails}>
                    <Text style={styles.deliveryLabel}>Hẹn giao</Text>
                    <Text style={styles.deliveryText}>{deliveryTime}</Text>
                </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Details Title */}
        <View style={styles.deliverySection}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.sectionTitle}>Order details</Text>
            <TouchableOpacity>
                {/* <Text style={styles.addMoreText}>Add more</Text> */}
            </TouchableOpacity>
          </View>
        </View>
      </>
    }
    renderItem={({ item }) => (
        <View style={styles.orderItem}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemOptions}>
              Size: {item.size} {'\n'}
              Topping: {item.toppings.join(', ')} {'\n'}
              Spiciness: {item.spiciness|| 'Not specified'}
            </Text>
            {item.specialNote ? (
              <Text style={styles.specialNote}>Note: {item.specialNote}</Text>
            ) : null}
            <Text style={styles.itemPrice}>{item.totalPrice}$</Text>
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <Icon name="create-outline" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <View style={styles.itemQuantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecreaseQuantity(item)}>
              <Icon name="remove" size={18} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncreaseQuantity(item)}>
              <Icon name="add" size={18} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
    ListFooterComponent={
      <>
        {/* Also Ordered Section */}
        <View style={styles.deliverySection}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.sectionTitle}>Also ordered</Text>
          </View>
        </View>
        <View style={styles.alsoOrderedContainer}>
        <FlatList
            data={menuItems}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
            <View style={styles.alsoOrderedItem}>
                <Image source={{ uri: item.image }} style={styles.alsoOrderedImage} />
                <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle} numberOfLines={1}>
                    {item.name}
                    </Text>
                    <Text style={styles.menuPrice}>{item.price}$</Text>
                </View>
                <TouchableOpacity
                      onPress={() => navigation.navigate('FoodDetails', { food: item })}
                      >
                        <Icon name="add-circle-outline" size={24} color="#333" />
                  </TouchableOpacity>
            </View>
            )}
        />
        </View>
                
        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment details</Text>

          {/* Tùy chọn thanh toán */}
          <View style={styles.paymentOptions}>
            <TouchableOpacity style={styles.optionRow} onPress={handleSelectPaymentMethod}>
                <Icon name="wallet-outline" size={20} color="#333" />
                <Text style={styles.optionText}>{paymentMethod}</Text>
                <Icon name="chevron-forward-outline" size={20} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionRow} onPress={handleSelectVoucher}>
                <Icon name="pricetag-outline" size={20} color="#333" />
                <Text style={styles.optionText}>{selectedVoucher.name || 'No voucher selected'}</Text>
                <Icon name="chevron-forward-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Chi tiết thanh toán */}
          <View style={styles.paymentDetails}>
            <View style={styles.detailRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>${totalCartPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.paymentLabel}>Delivery fee</Text>
                <Text style={styles.paymentValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.separator} />
                <View style={styles.detailRow}>
                    <Text style={styles.paymentLabel}>Promotion</Text>
                    <Text style={styles.paymentValue}>-${(promotion || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                    <Text style={styles.paymentLabel}>Payment method</Text>
                    <Text style={styles.paymentValue}>{paymentMethod}</Text>
                </View>
            </View>

        {/* Tổng (Total) */}
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
        </View>
        {/* Order Button */}
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
          <Text style={styles.orderButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
      </>
    }
  />
  );  
};
    
const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#FFF' },
    
    deliveryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    deliverySection: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
       
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
      },
      deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
      },
      deliveryDetails: {
        marginLeft: 10,
        flex: 1,
      },
      deliveryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
      },
      deliveryText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
      },
      changeText: {
        color: '#4A90E2',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
      },
    
    
    section: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 16 },

    alsoOrderedContainer: {
      marginTop: -15,
      paddingHorizontal: 16,
      backgroundColor: '#FFF',
    },
    alsoOrderedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 350,
      height: '90%',
      padding: 12,
      backgroundColor: '#FFF',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      alignSelf: 'center',
      marginRight: 20,
    },
    alsoOrderedImage: {
      width: 90,
      height: 90,
      borderRadius: 8,
      marginRight: 20,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    menuPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#777',
      marginTop: 4,
    },
    
    orderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF',
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      position: 'relative',
    },
    itemImage: { width: 60, height: 60, borderRadius: 8 },
    itemDetails: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    itemOptions: { color: '#888', fontSize: 14, marginVertical: 4 },
    specialNote: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
        fontStyle: 'italic',
      },
      
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
    itemQuantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      position: 'absolute',
      right: 10,
      bottom: 10,
    },
    quantityButton: {
      width: 32,
      height: 32,
      backgroundColor: '#E0E0E0',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 8 },
    editIcon: { position: 'absolute', right: 10, top: 10 },
    addMoreText: { color: '#4A90E2', fontSize: 14, fontWeight: '500' },
    section: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 8,
        marginVertical: 16,
        elevation: 2,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
      },
      paymentOptions: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        marginBottom: 16,
      },
      optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
      },
      optionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 10,
      },
      paymentDetailsContainer: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
      },
      paymentOptions: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        marginBottom: 16,
      },
      optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
      },
      optionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 10,
      },
      paymentDetails: {
        marginBottom: 16,
      },
      detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
      },
      paymentLabel: {
        fontSize: 16,
        color: '#666',
      },
      paymentValue: {
        fontSize: 16,
        color: '#333',
      },
      separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
      },
      totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
      },
      totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
      },
      totalValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
      },
      orderButton: {
        marginTop: 16,
        backgroundColor: '#4FC3F7',
        borderRadius: 8,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
      },
      orderButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
      },
});

export default OrderReview;
