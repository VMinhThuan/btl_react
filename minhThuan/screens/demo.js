import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const RestaurantDetails = ({ route }) => {
  const { restaurant } = route.params;
  const [visibleCount, setVisibleCount] = useState(2);
  const navigation = useNavigation();

  const { getTotalQuantity, calculateTotalCartPrice, cartItems, setCartItems } = useCart();
  const totalItems = getTotalQuantity();
  const totalCartPrice = calculateTotalCartPrice();
  const [modalVisible, setModalVisible] = useState(false);
  
  // State to hold data fetched from API
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [forYouItems, setForYouItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comboItems, setComboItems] = useState([]);

  const getRestaurantCartItems = (restaurantId) => cartItems[restaurantId] || [];

const setRestaurantCartItems = (restaurantId, items) => {
  setCartItems((prev) => ({
    ...prev,
    [restaurantId]: items,
  }));
};




  // Fetch data from the backend
  useEffect(() => {
    // Fetch menu items from backend

    axios.get(`http://192.168.1.67:7777/restaurants/${restaurant.id}`)
    .then(response => {
      setRestaurantDetails(response.data);
    })
    .catch(error => {
      console.error('Error fetching restaurant details:', error);
    });

    axios.get(`http://192.168.1.67:7777/restaurants/${restaurant.id}/menu`)
      .then(response => {
        setMenuItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
      });

    // Fetch "For You" items
    axios.get(`http://192.168.1.67:7777/restaurants/${restaurant.id}/recommendedforyo`)
      .then(response => {
        setForYouItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching recommended items:', error);
      });

    // Fetch reviews
    axios.get(`http://192.168.1.67:7777/restaurants/${restaurant.id}/reviews`)
      .then(response => {
        setReviews(response.data);
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
      });

    // Fetch combo items
    axios.get(`http://192.168.1.67:7777/restaurants/${restaurant.id}/combos`)
      .then(response => {
        setComboItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching combo items:', error);
      });
  }, [restaurant.id]);

  const toggleVisibility = () => {
    setVisibleCount(visibleCount === menuItems.length ? 2 : menuItems.length);
  };

  const renderComboItem = ({ item }) => (
    <View style={styles.menuItem}>
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{item.name}</Text>
        {item.description && <Text style={styles.menuDescription}>{item.description}</Text>}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>
            <Icon name="star" size={12} color="#FFD700" /> 
            {item.rating} ({item.reviews})
          </Text>
          <Text style={styles.forYouPrice}>{item.price}$</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('FoodDetails', { food: item })}
        >
          <Icon name="add-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>{item.user_name}</Text>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.reviewTime}>{item.review_time}</Text>
        <Text style={styles.reviewText}>{item.review_text}</Text>
      </View>
    </View>
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <View style={styles.ratingContainer}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <Icon key={index} name="star" size={16} color="#FFD700" />
        ))}
        {hasHalfStar && <Icon name="star-half" size={16} color="#FFD700" />}
        {Array.from({ length: 5 - Math.ceil(rating) }).map((_, index) => (
          <Icon key={index} name="star-outline" size={16} color="#FFD700" />
        ))}
      </View>
    );
  };

  

  // Render cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemOptions}>
          {item.size}, {item.toppings.join(', ')}, {item.spiciness || 'Not specified'}
        </Text>
        {item.specialNote ? (
          <Text style={styles.cartItemNote}>
            <Icon name="clipboard-outline" size={14} color="#888" /> {item.specialNote}
          </Text>
        ) : (
          <Text style={styles.cartItemNotePlaceholder}>Thêm ghi chú...</Text>
        )}
        <Text style={styles.cartItemPrice}>{item.totalPrice}$</Text>
      </View>
      <View style={styles.cartItemQuantity}>
        <TouchableOpacity onPress={() => decrementQuantity(item)}>
          <Icon name="remove-circle-outline" size={24} color="#FF3D00" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => incrementQuantity(item)}>
          <Icon name="add-circle-outline" size={24} color="#FF3D00" />
        </TouchableOpacity>
      </View>
    </View>
  );

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


  const handleDelivery = () => {
    navigation.navigate('OrderReview', { menuItems });
  };

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 60 }}
        ListHeaderComponent={
          <>
            {restaurantDetails && (
              <>
                <Image source={{ uri: restaurantDetails.image_path}} style={styles.bannerImage} />
                <View style={styles.header}>
                  <View style={styles.headerTags}>
                      {Array.isArray(restaurantDetails.tags) && restaurantDetails.tags.map((tag, i) => (
                      <Text key={i} style={styles.tag}>{tag}</Text>
                    ))}
                  </View>
                  
                  

                  <Text style={styles.headerTitle}>{restaurantDetails.name}</Text>
                  <View style={styles.headerInfo}>
                    <Icon name="time-outline" size={14} color="#0000FF" />
                    <Text style={styles.headerText}>{restaurantDetails.open_time}am - {restaurantDetails.close_time}pm</Text>
                    <Icon name="location-outline" size={14} color="#0000FF" style={styles.headerIcon} />
                    <Text style={styles.headerText}>{restaurantDetails.distance}</Text>
                    <Icon name="pricetag-outline" size={14} color="#0000FF" style={styles.headerIcon} />
                    <Text style={styles.headerText}>${restaurantDetails.min_price} - ${restaurantDetails.max_price}</Text>
                  </View>
                  <View style={styles.headerStats}>
                    <View style={styles.statItem}>
                      <Icon name="star" size={18} color="#FFD700" />
                      <Text style={styles.statText}>{restaurantDetails.rating} ({restaurantDetails.review_count} reviews)</Text>
                      <Icon name="chevron-forward-outline" size={20} color="#8E8E8E" style={styles.arrowIcon} />
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statItem}>
                      <Icon name="pricetag-outline" size={18} color="#8E8E8E" />
                      <Text style={styles.statText}>{restaurantDetails.voucher_count} discount vouchers for restaurant</Text>
                      <Icon name="chevron-forward-outline" size={20} color="#8E8E8E" style={styles.arrowIcon} />
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.statItem}>
                      <Icon name="bicycle-outline" size={18} color="#8E8E8E" />
                      <Text style={styles.statText}>Delivery on {restaurantDetails.time}</Text>
                      <Icon name="chevron-forward-outline" size={20} color="#8E8E8E" style={styles.arrowIcon} />
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Section For You */}
            <View style={styles.section}>
              <View style={styles.forYouHeader}>
                <Text style={styles.sectionTitle}>For you</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={forYouItems}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.forYouCard} 
                    onPress={() => navigation.navigate('FoodDetails', { food: item })}
                  >
                    <Image source={{ uri: item.image }} style={styles.forYouImage} />
                    <View style={styles.forYouContent}>
                      <Text style={styles.forYouTitle}>{item.name}</Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('FoodDetails', { food: item })}
                      >
                        <Icon name="add-circle-outline" size={24} color="#333" />
                      </TouchableOpacity>
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingText}>
                          <Icon name="star" size={12} color="#FFD700" /> 
                          {item.rating} ({item.reviews})
                        </Text>
                        <Text style={styles.forYouPrice}>{item.price}$</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
            
            {/* Section Menu */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Menu</Text>
              {menuItems.slice(0, visibleCount).map((item, index) => (
                <View key={index} style={styles.menuItem}>
                  <Image source={{ uri: item.image }} style={styles.menuImage} />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuTitle}>{item.name}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('FoodDetails', { food: item })}
                    >
                      <Icon name="add-circle-outline" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.menuRightSection}>
                    <Text style={styles.menuPrice}>{item.price}$</Text>
                    <View style={styles.menuRating}>
                      <Icon name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.seeAllButton} onPress={toggleVisibility}>
                <Text style={styles.seeAllText}>{visibleCount === menuItems.length ? 'Show less' : 'See all'}</Text>
              </TouchableOpacity>
            </View>

            {/* Section Reviews */}
            <View style={styles.section}>
              <View style={styles.forYouHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </>
        }

        ListFooterComponent={
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Combo</Text>
              <FlatList
                data={comboItems}
                renderItem={renderComboItem}
                keyExtractor={(item, index) => `combo-${index}`}
              />
            </View>
          </>
        }
      />

      {/* Các thành phần khác */}
      <View style={styles.bottomNavigation}>
        <NavIcon name="home" label="Home" />
        <NavIcon name="list-outline" label="My Order" />
        <NavIcon name="heart-outline" label="Favorites" />
        <NavIcon name="chatbox-ellipses-outline" label="Inbox" />
        <NavIcon name="person-outline" label="Account" />
     </View>

     {/* Cart Icon and Modal Trigger */}
     {totalItems > 0 && (
        <View style={styles.cartSummaryBar}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.cartIconContainer}>
          <Icon name="basket" size={24} color="#FF3D00" />
          {totalItems > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
          </TouchableOpacity>
          <Text style={styles.cartTotal}>{totalCartPrice.toFixed(2)}$</Text>
          <TouchableOpacity onPress={handleDelivery} style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>Giao hàng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Giỏ hàng</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.cartList}
              
            />
            <Text style={styles.cartNote}>Giá món đã bao gồm thuế, nhưng chưa bao gồm phí giao hàng và các phí khác.</Text>
            <View style={styles.modalFooter}>
              <Text style={styles.totalPriceText}>Total: {totalCartPrice.toFixed(2)}S</Text>
              <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('OrderReview')}>
                <Text style={styles.checkoutButtonText}>Giao hàng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

  );
};
const NavIcon = ({ name, label }) => (
  <TouchableOpacity style={styles.navIcon}>
    <Icon name={name} size={24} color="black" />
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  bannerImage: { width: '100%', height: 200 },
  header: {
    paddingVertical: 16, // Reduced padding to make it smaller
    paddingHorizontal: 12, // Less horizontal padding
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, // Add side margins to reduce width
    marginTop: -30,
    borderRadius: 16, // Make border radius uniform
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 }, // Reduced font size for better fit
  headerTags: { flexDirection: 'row', marginBottom: 8 },
  tag: {
    backgroundColor: '#E0F7FA',
    color: '#007AFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  headerText: { fontSize: 16, color: '#000000', marginRight: 12, marginLeft: 6},
  headerIcon: { marginHorizontal: 4 },

  headerStats: { marginTop: 8 },
  statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', 
      paddingVertical: 10,
},
  statText: { fontSize: 19, color: '#333', marginLeft: 8, flexShrink: 1, paddingRight: 40}, // Added flexShrink to ensure the text doesn't overflow
  arrowIcon: { marginLeft: 'auto' },
  separator: { height: 1, backgroundColor: '#E0E0E0', marginHorizontal: -12 },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  forYouHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  viewAllText: { fontSize: 18, color: '#333' },

  forYouCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      overflow: 'hidden',
      width: '45%',
      margin: '2.5%',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    forYouImage: { width: '100%', height: 120 }, // Increased height
  forYouContent: { padding: 8 },
  forYouTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }, // Adjusted font size
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'space-between' },
  ratingText: { fontSize: 14, fontWeight: 'bold',color: '#000000', marginLeft: 4 }, // Increased font size

  forYouPrice: { fontSize: 16, fontWeight: 'bold', color: '#333', alignSelf: 'flex-end' }, // Adjusted font size for clarity
    
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    menuImage: {
      width: 120,
      height: 120,
      borderRadius: 8,
      marginRight: 12,
    },
    menuInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    menuTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    menuDescription: {
      marginBottom: 4,
      fontSize: 14,
      color: '#8E8E8E',
    },
    menuRightSection: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    menuPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    menuRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    reviewCard: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 12,
      marginTop: 10,
      marginRight: 12,
      width: 260,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    avatar: { width: 45, height: 45, borderRadius: 20, marginRight: 10 },
    reviewContent: { flex: 1, justifyContent: 'center' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    ratingContainer: { flexDirection: 'row' },
    reviewTime: { fontSize: 12, color: '#8E8E8E', marginVertical: 4 },
    reviewText: {
      fontSize: 14,
      color: '#555',
      lineHeight: 20,
      flexWrap: 'wrap',
    },
    seeAllButton: {
      alignItems: 'center',
      backgroundColor: '#E0F7FA',
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    seeAllText: {
      fontSize: 14,
      color: '#007AFF',
    },
    bottomNavigation: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
    navIcon: { alignItems: 'center' },
    navLabel: { fontSize: 10, color: 'gray', marginTop: 4 },

    cartSummaryBar: {
      position: 'absolute',
      bottom: 70, // Adjust this value to place the cart bar just above the footer
      left: 0,
      right: 0,
      backgroundColor: '#FFF',
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#DDD',
      elevation: 3,
    },
    cartItemNote: {
      fontSize: 14,
      color: '#888',
      marginTop: 4,
    },
    cartItemNotePlaceholder: {
      fontSize: 14,
      color: '#888',
      marginTop: 4,
      fontStyle: 'italic',
    },
    
    
    cartQuantity: { fontSize: 14, color: '#FF3D00', marginLeft: 8 },
    cartTotal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    checkoutButton: { backgroundColor: '#FF3D00', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
    checkoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    cartIconContainer: {
      position: 'relative',
    },
    badgeContainer: {
      position: 'absolute',
      top: -5,
      right: -10,
      backgroundColor: 'red',
      borderRadius: 10,
      paddingHorizontal: 5,
      paddingVertical: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#FFF',
      borderRadius: 10,
      padding: 16,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    cartList: { marginBottom: 10 },
    cartItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderColor: '#EEE',
    },
    cartItemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
    cartItemInfo: { flex: 1 },
    cartItemName: { fontSize: 16, fontWeight: 'bold' },
    cartItemOptions: { fontSize: 14, color: '#888' },
    cartItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#FF3D00' },
    cartItemQuantity: { flexDirection: 'row', alignItems: 'center' },
    quantityText: { fontSize: 16, marginHorizontal: 8 },
  
    cartNote: { fontSize: 12, color: '#888', textAlign: 'center', marginVertical: 10 },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: '#DDD',
    },
    totalPriceText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    checkoutButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
export default RestaurantDetails;
