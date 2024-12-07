import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const PaymentMethodSelection = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get('http://192.168.1.67:7777/payment-methods'); // Đổi IP và PORT theo máy của bạn
      if (response.status === 200) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleConfirmPayment = () => {
    if (selectedMethod) {
      navigation.navigate('OrderReview', {
        paymentMethod: selectedMethod,
      });
    } else {
      alert('Vui lòng chọn phương thức thanh toán');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phương thức thanh toán</Text>

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.paymentItem,
              selectedMethod?.id === item.id && styles.selectedItem,
            ]}
            onPress={() => handleSelectMethod(item)}
          >
            <View style={styles.paymentDetails}>
              <Icon name={item.icon} size={24} color="#FF5722" />
              <Text style={styles.paymentText}>{item.name}</Text>
            </View>
            {selectedMethod?.id === item.id && (
              <Icon name="checkmark-circle" size={24} color="#FF5722" />
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'space-between',
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedItem: {
    borderColor: '#FF5722',
  },
  confirmButton: {
    backgroundColor: '#4FC3F7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentMethodSelection;
