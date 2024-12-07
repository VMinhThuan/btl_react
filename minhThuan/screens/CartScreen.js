import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useCart } from '../contexts/CartContext';

const CartScreen = ({ navigation }) => {
    const { cartItems, calculateTotalCartPrice } = useCart();
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Order details</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RestaurantDetails')}>
            <Text style={styles.addMoreText}>Add more</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={cartItems}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image source={item.image} style={styles.cartItemImage} />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemDetails}>
                  Size: {item.selectedSize} {'\n'}
                  Topping: {item.selectedToppings.join(', ')} {'\n'}
                  Spiciness: {item.selectedSpiciness || 'Not specified'}
                </Text>
                <Text style={styles.cartItemPrice}>${item.price}</Text>
              </View>
              <View style={styles.cartItemActions}>
                <TouchableOpacity onPress={() => decrementQuantity(item)}>
                  <Icon name="remove-circle-outline" size={24} color="#FF3D00" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => incrementQuantity(item)}>
                  <Icon name="add-circle-outline" size={24} color="#FF3D00" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={() => (
            <View style={styles.cartFooter}>
              <Text style={styles.totalText}>Total: ${calculateTotalCartPrice()}</Text>
              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    addMoreText: { fontSize: 16, color: '#007BFF' },
  
    cartItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
    },
    cartItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 16 },
    cartItemInfo: { flex: 1 },
    cartItemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cartItemDetails: { fontSize: 14, color: '#888', marginVertical: 4 },
    cartItemPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF3D00' },
    cartItemActions: { alignItems: 'center' },
    quantityText: { fontSize: 16, marginHorizontal: 8 },
  
    cartFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#EEE',
    },
    totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    checkoutButton: {
      backgroundColor: '#FF3D00',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    checkoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  });
  
  export default CartScreen;