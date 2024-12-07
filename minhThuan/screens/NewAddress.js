import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const NewAddress = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  const [label, setLabel] = useState('Home');
  const [note, setNote] = useState('');

  const [userId, setUserId] = useState(null);

  // Lấy userId khi màn hình được focus
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
      setUserId(parseInt(storedUserId, 10));
    } catch (error) {
      console.error('Error fetching userId:', error);
    }
  };

  // Cập nhật địa chỉ nếu người dùng quay lại từ `SelectLocation`
  useEffect(() => {
    if (route.params?.selectedAddress) {
      setAddress(route.params.selectedAddress);
    }
  }, [route.params?.selectedAddress]);

  const handleSaveAddress = () => {
    if (!name || !phone || !address || !city) {
      Alert.alert('Error', 'Please fill in all required fields!');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please log in again.');
      return;
    }

    const newAddress = {
      user_id: userId,
      name,
      phone_number: phone,
      label,
      address,
      city,
      note,
    };

    // Gọi API để lưu địa chỉ
    axios
      .post('http://192.168.1.67:7777/addresses', newAddress)
      .then((response) => {
        if (response.status === 201) {
          Alert.alert('Success', 'Address saved successfully!');
          // Điều hướng trở lại và truyền dữ liệu địa chỉ mới
          navigation.navigate('DeliveryAddress', { newAddress: response.data });
        }
      })
      .catch((error) => {
        console.error('Error saving address:', error);
        Alert.alert('Error', 'Failed to save address. Please try again.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thêm địa chỉ mới</Text>

      {/* Thông báo lỗi */}
      {!name && <Text style={styles.errorText}>Tên là bắt buộc.</Text>}
      <TextInput
        style={styles.input}
        placeholder="Tên (bắt buộc)"
        value={name}
        onChangeText={setName}
      />

      {!phone && <Text style={styles.errorText}>Số điện thoại là bắt buộc.</Text>}
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại (bắt buộc)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {!address && <Text style={styles.errorText}>Địa chỉ là bắt buộc.</Text>}
      <TouchableOpacity onPress={() => navigation.navigate('SelectLocation')}>
        <TextInput
          style={styles.input}
          placeholder="Chọn địa chỉ (bắt buộc)"
          value={address}
          editable={false} // Không cho phép người dùng nhập trực tiếp
        />
      </TouchableOpacity>

      {!city && <Text style={styles.errorText}>Thành phố là bắt buộc.</Text>}
      <TextInput
        style={styles.input}
        placeholder="Thành phố (bắt buộc)"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Nhãn địa chỉ</Text>
      <View style={styles.labelContainer}>
        {['Home', 'Work', 'Other'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.labelButton,
              label === item && styles.labelButtonSelected,
            ]}
            onPress={() => setLabel(item)}
          >
            <Text
              style={[
                styles.labelText,
                label === item && styles.labelTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
    ))}
  </View>

  <TextInput
    style={[styles.input, styles.noteInput]}
    placeholder="Ghi chú cho tài xế (không bắt buộc)"
    value={note}
    onChangeText={setNote}
  />

  <TouchableOpacity
    style={[
      styles.saveButton,
      !(name && phone && address && city) && styles.disabledButton,
    ]}
    onPress={handleSaveAddress}
    disabled={!(name && phone && address && city)}
  >
    <Text style={styles.saveButtonText}>Lưu</Text>
  </TouchableOpacity>
</View>

  );
};

// Styles vẫn giữ nguyên từ phiên bản trước.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  labelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  labelButtonSelected: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  labelText: {
    fontSize: 14,
    color: '#333',
  },
  labelTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
});

export default NewAddress;
