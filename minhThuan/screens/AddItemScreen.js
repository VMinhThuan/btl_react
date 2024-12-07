import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCart } from '../contexts/CartContext';

const AddItemScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
    size: 'M', // Kích cỡ mặc định
    toppings: [],
    note: ''
  });

  

  const toggleTopping = (topping) => {
    setSelectedOptions((prev) => ({
      ...prev,
      toppings: prev.toppings.includes(topping)
        ? prev.toppings.filter((t) => t !== topping)
        : [...prev.toppings, topping]
    }));
  };

  const handleAddToCart = () => {
    addToCart({ ...item, quantity, options: selectedOptions });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hình ảnh và thông tin sản phẩm */}
      <View style={styles.headerContainer}>
        <Image source={item.image} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price}đ</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </View>

      {/* Điều chỉnh số lượng */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
          <Icon name="remove-circle-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
          <Icon name="add-circle-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Lựa chọn kích cỡ */}
      <Text style={styles.sectionTitle}>Size</Text>
      <View style={styles.optionContainer}>
        {['S', 'M', 'L'].map((size) => (
          <TouchableOpacity
            key={size}
            style={[styles.optionButton, selectedOptions.size === size && styles.selectedOption]}
            onPress={() => setSelectedOptions({ ...selectedOptions, size })}
          >
            <Text style={styles.optionText}>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lựa chọn topping */}
      <Text style={styles.sectionTitle}>Toppings</Text>
      {['Cheese', 'Bacon', 'Mushroom'].map((topping) => (
        <TouchableOpacity
          key={topping}
          style={styles.toppingOption}
          onPress={() => toggleTopping(topping)}
        >
          <Text style={styles.toppingText}>{topping}</Text>
          <Icon
            name={selectedOptions.toppings.includes(topping) ? "checkbox-outline" : "square-outline"}
            size={24}
            color={selectedOptions.toppings.includes(topping) ? "#00C2FF" : "#888"}
          />
        </TouchableOpacity>
      ))}

      {/* Ghi chú đặc biệt */}
      <Text style={styles.sectionTitle}>Special Instructions</Text>
      <TextInput
        placeholder="Add any notes for the restaurant"
        style={styles.noteInput}
        onChangeText={(text) => setSelectedOptions({ ...selectedOptions, note: text })}
        value={selectedOptions.note}
      />

      {/* Nút thêm vào giỏ hàng */}
      <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
        <Text style={styles.addToCartButtonText}>Add to Cart - {quantity * parseInt(item.price, 10)}đ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerContainer: { flexDirection: 'row', marginBottom: 16 },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 16, color: '#888', marginBottom: 4 },
  itemDescription: { fontSize: 14, color: '#888' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, justifyContent: 'center' },
  quantityText: { fontSize: 18, marginHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  optionContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  optionButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', width: '30%' },
  selectedOption: { backgroundColor: '#E0F7FA', borderColor: '#00C2FF' },
  optionText: { fontSize: 16 },
  toppingOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  toppingText: { fontSize: 16 },
  noteInput: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginTop: 8 },
  addToCartButton: { backgroundColor: '#00C2FF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addToCartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddItemScreen;
