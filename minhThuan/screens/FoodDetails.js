import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../contexts/CartContext';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FoodDetails = ({ route, navigation }) => {
  const { food } = route.params;
  const { addToCart, getTotalQuantity, calculateTotalCartPrice } = useCart();
 
  const [selectedSize, setSelectedSize] = useState('L'); // Default size
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedSpiciness, setSelectedSpiciness] = useState('No');
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  const sizes = [
    { label: 'S', price: 0 },
    { label: 'M', price: 5 },
    { label: 'L', price: 10 },
  ];

  const toppings = [
    { label: 'Corn', price: 2 },
    { label: 'Cheese Cheddar', price: 5 },
    { label: 'Salted egg', price: 10 },
  ];

  const spicinessOptions = ['No', 'Hot', 'Very hot'];

  const handleAddToCart = async () => {
    try {
      // Lấy user_id từ AsyncStorage
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        alert('User not found. Please log in again.');
        return;
      }
  
      // Tạo item với userId lấy từ AsyncStorage
      const item = {
        userId: parseInt(userId, 10), // Chuyển thành số
        menuItemId: food.id,
        size: selectedSize,
        toppings: selectedToppings,
        spiciness: selectedSpiciness,
        quantity,
        specialNote,
        totalPrice: calculateTotalPrice(),
        name: food.name,
        image: food.image,
        price: food.total_price,
      };
  
      // Gửi item lên server
      axios
        .post('http://192.168.1.67:7777/cart', item)
        .then(response => {
          addToCart(item); // Cập nhật giỏ hàng trong Context sau khi thêm thành công
          alert(`Added to cart with total: $${item.totalPrice}`);
        })
        .catch(error => {
          console.error('Error adding item to cart:', error);
        });
    } catch (error) {
      console.error('Error handling cart:', error);
      alert('Something went wrong, please try again.');
    }
  };
  

  const toggleTopping = (topping) => {
    setSelectedToppings(prev =>
      prev.includes(topping) ? prev.filter(t => t !== topping) : [...prev, topping]
    );
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(food.price) || 0;
    const sizePrice = sizes.find(size => size.label === selectedSize)?.price || 0;
    const toppingsPrice = selectedToppings.reduce(
      (sum, topping) => sum + (toppings.find(t => t.label === topping)?.price || 0),
      0
    );
    return (basePrice + sizePrice + toppingsPrice) * quantity;
  };

  const totalItems = getTotalQuantity();
  const totalCartPrice = calculateTotalCartPrice();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: food.image }} style={styles.foodImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Icon name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.foodInfoContainer}>
          <View style={styles.foodInfoRow}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodPrice}>{food.price}</Text>
          </View>
          <View style={styles.foodDescriptionRow}>
            <Text style={styles.foodDescription}>{food.description}</Text>
            <Text style={styles.basePriceText}>Base price</Text>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitleText}>Size</Text> 
          <Text style={styles.sectionTitleSubtext}>(Pick 1)</Text> 
          <Icon name="checkmark-circle-outline" size={28} color="#00C2FF" style={styles.sectionTitleIcon}/>
        </View>
        {sizes.map(size => (
          <TouchableOpacity
            key={size.label}
            style={styles.optionRow}
            onPress={() => setSelectedSize(size.label)}
          >
            <View style={styles.sizeLabel}>
              <View style={styles.sizeRadioButton}>
                {selectedSize === size.label && <View style={styles.selectedSizeRadioButton} />}
              </View>
              <Text style={styles.optionLabel}>{size.label}</Text>
            </View>
            <Text style={styles.sizePrice}>+${size.price}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitleText}>Topping</Text>
          <Text style={styles.sectionTitleSubtext}>(Optional)</Text>
        </View>
        {toppings.map(topping => (
          <TouchableOpacity
            key={topping.label}
            style={styles.optionRowTopping}
            onPress={() => toggleTopping(topping.label)}
          >
            <View style={styles.sizeLabel}>
              <Icon 
                name={selectedToppings.includes(topping.label) ? "checkbox-outline" : "square-outline"} 
                size={20} 
                color={selectedToppings.includes(topping.label) ? "#00C2FF" : "#888"} 
                style={{ marginRight: 10 }} 
              />
            </View>
            <Text style={styles.optionLabel}>{topping.label}</Text>
            <Text style={styles.optionPrice}>+${topping.price}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitleText}>Spiciness</Text>
          <Text style={styles.sectionTitleSubtext}>(Pick 1)</Text>
          <Icon name="checkmark-circle-outline" size={28} color="#00C2FF" style={styles.sectionTitleIcon}/>
        </View>
        {spicinessOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={styles.optionRow}
            onPress={() => setSelectedSpiciness(option)}
          >
            <View style={styles.sizeLabel}>
              <View style={styles.sizeRadioButton}>
                {selectedSpiciness === option && <View style={styles.selectedSizeRadioButton} />}
              </View>
              <Text style={styles.optionLabel}>{option}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitleText}>Note for restaurant</Text>
        </View>
        <TextInput
          placeholder="Special note"
          style={styles.noteInput}
          value={specialNote}
          onChangeText={setSpecialNote}
        />

        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Icon name="remove-circle-outline" size={30} color="#00C2FF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
            <Icon name="add-circle-outline" size={30} color="#00C2FF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>Add to cart (${calculateTotalPrice()})</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF'},
  imageContainer: { position: 'relative' },
  closeButton: {
    backgroundColor: '#b4b4bc',
    borderRadius: 15,
    position: 'absolute', 
    top: 10, 
    left: 10, 
    zIndex: 1
  },
  scrollContainer: { paddingBottom: 20 },
  foodImage: { width: '100%', height: 200, marginBottom: 16 },
  
  foodInfoContainer:{
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.9,
    borderBottomColor: '#DDD',
  },
  foodInfoRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodName:{
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  foodPrice:{
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  foodDescriptionRow:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  foodDescription:{
    fontSize: 14,
    color: '#888',
  },
  basePriceText:{
    fontSize: 14,
    color: '#888',
  },
  sectionTitleContainer:{
    paddingHorizontal: 16,
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 16, 
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitleSubtext: {
    fontSize: 16,
    color: '#888',
    marginLeft: 4,
  },
  sectionTitleIcon:{
    marginLeft: 'auto',
  },

  sizeLabel: {
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  sizePrice: { 
    fontSize: 16, 
    color: '#00C2FF' 
  },
  sizeRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00C2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedSizeRadioButton: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00C2FF',
  },

  optionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderBottomWidth: 0.9, 
    borderBottomColor: '#DDD', 
    width: '100%',
  },
  optionRowTopping: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderBottomWidth: 0.9, 
    borderBottomColor: '#DDD', 
    width: '100%',
  },

  cartBar: {
    position: 'absolute',
    bottom: 0,
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
  },
  cartIconContainer: { flexDirection: 'row', alignItems: 'center' },
  cartQuantity: { fontSize: 14, color: '#FF3D00', marginLeft: 8 },
  cartTotal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  checkoutButton: { backgroundColor: '#FF3D00', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  checkoutText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  optionLabel: { fontSize: 16, color: '#333' },
  optionPrice: { fontSize: 16, color: '#00C2FF' },
  noteInput: { height: 100, borderColor: '#DDD', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, marginTop: 8 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  quantityText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginHorizontal: 16 },
  addToCartButton: { backgroundColor: '#00C2FF', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addToCartButtonText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
});
export default FoodDetails;
