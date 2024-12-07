import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const SelectDeliveryTime = ({ navigation, route }) => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Hôm nay');
  const [selectedTime, setSelectedTime] = useState('Giao ngay');

  const onChange = (event, selectedValue) => {
    setShow(false);
    if (selectedValue) {
      if (mode === 'date') {
        setSelectedDate(selectedValue.toDateString());
        setMode('time');
        setShow(true);
      } else {
        const currentTime = new Date();
        const selectedDate = new Date(selectedValue);

        // Kiểm tra nếu ngày lớn hơn ngày hiện tại, cho phép chọn giờ bất kỳ
        if (selectedDate.toDateString() > currentTime.toDateString()) {
          setSelectedTime(selectedValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } 
        // Nếu ngày bằng ngày hiện tại, chỉ cho phép chọn giờ lớn hơn giờ hiện tại
        else if (selectedDate.toDateString() === currentTime.toDateString() && selectedValue > currentTime) {
          setSelectedTime(selectedValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } 
        // Nếu không thỏa mãn, báo lỗi
        else {
          Alert.alert('Invalid Time', 'Please select a valid time.');
        }
      }
    }
  };


  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const handleConfirm = () => {
    if (route.params?.onSelectTime) {
      const deliveryTime = `${selectedDate}, ${selectedTime}`;
      route.params.onSelectTime(deliveryTime);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn giờ nhận hàng</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => showMode('date')}
        >
          <Text style={styles.optionTitle}>Ngày</Text>
          <Text style={styles.optionValue}>{selectedDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => showMode('time')}
        >
          <Text style={styles.optionTitle}>Giờ</Text>
          <Text style={styles.optionValue}>{selectedTime}</Text>
        </TouchableOpacity>
      </View>
      {show && (
        <DateTimePicker
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Đồng ý</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  optionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectDeliveryTime;
