import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DeliveryAddress = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const isFocused = useIsFocused();

  // Khi màn hình được focus, gọi API để lấy danh sách địa chỉ từ server
  useEffect(() => {
    if (isFocused) {
      fetchAddresses();
    }
  }, [isFocused]);
  
  const fetchAddresses = async () => {
    try {
      // Retrieve user ID from AsyncStorage
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        alert('User not found. Please log in again.');
        return;
      }
  
      // Parse userId to integer and log for debugging
      const parsedUserId = parseInt(userId, 10);
      console.log('Fetching addresses for user ID:', parsedUserId);
  
      // Fetch addresses from the server
      const response = await axios.get(`http://192.168.1.67:7777/addresses/${parsedUserId}`);
      
      if (response.status === 200) {
        setAddresses(response.data);
      } else if (response.status === 404) {
        setAddresses([]); // Set empty if no addresses found
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setAddresses([]); // Handle 404 specifically
      } else {
        console.error('Error fetching addresses:', error);
        alert('An error occurred while fetching addresses. Please try again.');
      }
    }
  };
  

  const handleSelectAddress = (selectedAddress) => {
    navigation.navigate('OrderReview', {
      selectedAddress: {
        id: selectedAddress.id,
        label: selectedAddress.label,
        address: selectedAddress.address,
        note: selectedAddress.note,
        name: selectedAddress.name,
        phone: selectedAddress.phone_number,
      },
    });
  };

  const handleAddNewAddress = () => {
    navigation.navigate('NewAddress');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm vị trí"
        placeholderTextColor="#999"
      />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Địa chỉ đã lưu</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.addressItem}
            onPress={() => handleSelectAddress(item)}
          >
            <View style={styles.addressDetails}>
              <Text style={styles.addressLabel}>{item.label}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
              <Text style={styles.addressText}>
                {item.name} | {item.phone_number}
              </Text>
            </View>
            <Text style={styles.editText}>Sửa</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có địa chỉ nào được lưu.</Text>
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles giữ nguyên từ phiên bản trước
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  editText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4FC3F7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 20,
  },
});

export default DeliveryAddress;
