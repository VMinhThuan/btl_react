import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useVoucher } from '../contexts/VoucherContext';

const SelectOffers = ({ navigation }) => {
  const { updateVoucher } = useVoucher();
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('http://192.168.1.67:7777/vouchers');
      if (response.status === 200) {
        setVouchers(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách voucher:', error);
    }
  };

  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVoucher = (voucher) => {
    setSelectedVoucher(voucher);
  };

  const handleUseVoucher = () => {
    if (selectedVoucher) {
      updateVoucher(selectedVoucher.name, selectedVoucher.value, selectedVoucher.voucher_id);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Voucher</Text>

      {/* Search Input */}
      <TextInput
        style={styles.input}
        placeholder="Search for voucher"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredVouchers}
        keyExtractor={(item) => item.voucher_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.voucherItem,
              selectedVoucher?.voucher_id === item.voucher_id && styles.selectedVoucher,
            ]}
            onPress={() => handleSelectVoucher(item)}
          >
            <Icon name={item.icon} size={24} color={selectedVoucher?.voucher_id === item.voucher_id ? '#4A90E2' : '#333'} />
            <Text style={styles.voucherText}>{item.name}</Text>
            {selectedVoucher?.voucher_id === item.voucher_id && (
              <Icon name="checkmark-circle" size={24} color="#4A90E2" />
            )}
          </TouchableOpacity>
        )}
      />

      {/* Use Now Button */}
      <TouchableOpacity style={styles.useNowButton} onPress={handleUseVoucher}>
        <Text style={styles.useButtonText}>Use now</Text>
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
  input: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    color: '#666',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedVoucher: {
    borderColor: '#4A90E2',
  },
  voucherText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  useNowButton: {
    backgroundColor: '#4FC3F7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  useButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectOffers;
