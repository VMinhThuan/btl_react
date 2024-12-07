import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const SelectLocation = ({ navigation, route }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [locationType, setLocationType] = useState('Home');

  // Hàm mở bản đồ trên trình duyệt
  const openMapInBrowser = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  // Hàm xử lý khi người dùng xác nhận chọn địa chỉ
  const handleConfirm = () => {
    // Cập nhật địa chỉ trong OrderReview và quay lại màn hình đó
    navigation.navigate('NewAddress', { selectedAddress: address });
  };

  // Lấy quyền truy cập vị trí và vị trí hiện tại của người dùng
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Gọi hàm để lấy địa chỉ từ tọa độ hiện tại
      getAddressFromCoordinates(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);

  // Hàm để lấy địa chỉ từ tọa độ (sử dụng Google Geocoding API)
  const getAddressFromCoordinates = (latitude, longitude) => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBK_SIh05rvoksosatoWNlneTDHHwYo4SY`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Thêm log để kiểm tra phản hồi từ API
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          setAddress(data.results[0].formatted_address);
        } else {
          console.error('Geocoding failed:', data.status); // Log thêm thông tin lỗi từ phía API
          setAddress('Address not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
        setAddress('Address not found');
      });
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          onRegionChangeComplete={(region) => {
            setLocation(region);
            getAddressFromCoordinates(region.latitude, region.longitude);
          }}
        >
          <Marker coordinate={location} />
        </MapView>
      )}
      <View style={styles.bottomContainer}>
        <Text style={styles.label}>Select location</Text>
        <TextInput
          style={styles.addressInput}
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity onPress={() => openMapInBrowser(location.latitude, location.longitude)}>
          <Text style={{ color: 'blue', marginBottom: 15 }}>Open Map in Chrome</Text>
        </TouchableOpacity>
        <View style={styles.radioContainer}>
          <TouchableOpacity onPress={() => setLocationType('Home')}>
            <Text style={locationType === 'Home' ? styles.radioSelected : styles.radio}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLocationType('Work')}>
            <Text style={locationType === 'Work' ? styles.radioSelected : styles.radio}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLocationType('Other')}>
            <Text style={locationType === 'Other' ? styles.radioSelected : styles.radio}>Other</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  addressInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  radio: { fontSize: 16, color: '#888' },
  radioSelected: { fontSize: 16, color: '#007AFF' },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default SelectLocation;
