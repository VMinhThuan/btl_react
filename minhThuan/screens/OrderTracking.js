import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

const OrderTracking = ({ route }) => {
  const { deliveryTime, deliveryAddress } = route.params;

  const safeDeliveryAddress = deliveryAddress || { latitude: 0, longitude: 0, address: "Unknown" };

  const [driverLocation, setDriverLocation] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
  });
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Get user's current location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const simulateDriverMovement = () => {
        const points = [
            { latitude: 10.7769, longitude: 106.7009 },
    { latitude: 10.7775, longitude: 106.7012 },
    { latitude: 10.7780, longitude: 106.7015 },
    { latitude: 10.7785, longitude: 106.7018 },
    { latitude: 10.7790, longitude: 106.7022 },
    { latitude: 10.7795, longitude: 106.7026 },
    { latitude: 10.7800, longitude: 106.7030 },
    { latitude: 10.7805, longitude: 106.7035 },
    { latitude: 10.7810, longitude: 106.7040 },
    { latitude: 10.7815, longitude: 106.7045 },
    { latitude: 10.7820, longitude: 106.7050 },
    { latitude: 10.7825, longitude: 106.7055 },
    { latitude: 10.7830, longitude: 106.7060 },
    { latitude: 10.7835, longitude: 106.7065 },
    { latitude: 10.7840, longitude: 106.7070 },
    { latitude: 10.7845, longitude: 106.7075 },
    { latitude: 10.7850, longitude: 106.7080 },
    { latitude: 10.7855, longitude: 106.7085 },
    { latitude: 10.7860, longitude: 106.7090 },
    { latitude: 10.7865, longitude: 106.7095 },
    { latitude: 10.7870, longitude: 106.7100 },
            ...(safeDeliveryAddress.latitude && safeDeliveryAddress.longitude
              ? [{ latitude: safeDeliveryAddress.latitude, longitude: safeDeliveryAddress.longitude }]
              : []),
          ];

      let index = 0;

      const interval = setInterval(() => {
        if (index >= points.length) {
          clearInterval(interval);
          Alert.alert("Driver has arrived at the destination!");
          return;
        }

        setDriverLocation(points[index]);
        setRouteCoordinates((prev) => [...prev, points[index]]);
        index++;
      }, 2000);
    };

    simulateDriverMovement();
  }, [safeDeliveryAddress]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || driverLocation.latitude,
          longitude: currentLocation?.longitude || driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor="green"
          />
        )}
        {driverLocation.latitude && driverLocation.longitude && (
          <Marker
            coordinate={driverLocation}
            title="Driver's Location"
            description="Your order is on the way"
          />
        )}
        {safeDeliveryAddress.latitude && safeDeliveryAddress.longitude && (
          <Marker
            coordinate={{
              latitude: safeDeliveryAddress.latitude,
              longitude: safeDeliveryAddress.longitude,
            }}
            title="Delivery Address"
            pinColor="blue"
          />
        )}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#00C2FF"
            strokeWidth={5}
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>Delivery Tracking</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Delivery time: {deliveryTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Delivery Address: {safeDeliveryAddress.address}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  map: { flex: 1 },
  infoContainer: { padding: 20, backgroundColor: "#FFF" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { fontSize: 16, marginLeft: 10 },
});

export default OrderTracking;
