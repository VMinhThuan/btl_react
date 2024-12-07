import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const LookingForDriver = ({ navigation, route }) => {
  const [orderStep, setOrderStep] = useState(0);

  const { deliveryTime, deliveryAddress } = route.params;

  useEffect(() => {
    const interval = setInterval(() => {
      setOrderStep((prevStep) => (prevStep < 4 ? prevStep + 1 : prevStep));
    }, 2000);

    if (orderStep === 4) {
      clearInterval(interval);
      navigation.navigate("OrderTracking", {
        deliveryTime,
        deliveryAddress,
      });
    }

    return () => clearInterval(interval);
  }, [orderStep]);

  const steps = ["Confirm Order", "Looking For Driver", "Prepare Food", "Deliver", "Tracking Driver"];

  return (
    <View style={styles.container}>
      <Icon name="checkmark-circle-outline" size={50} color="#00C2FF" />
      <Text style={styles.statusTitle}>
        {orderStep < 4 ? steps[orderStep] : "Arrived"}
      </Text>

      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.stepDot,
                orderStep >= index && styles.stepDotActive,
              ]}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  orderStep > index && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <View style={styles.stepsLabelContainer}>
        {steps.map((step, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              orderStep === index && styles.stepLabelActive,
            ]}
          >
            {step}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpText}>Need help?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E0E0E0",
  },
  stepDotActive: {
    backgroundColor: "#00C2FF",
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: "#E0E0E0",
  },
  stepLineActive: {
    backgroundColor: "#00C2FF",
  },
  stepsLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  stepLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
    flex: 1,
  },
  stepLabelActive: {
    color: "#00C2FF",
    fontWeight: "bold",
  },
  helpButton: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#00C2FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  helpText: {
    color: "#00C2FF",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 20,
  },
  cancelText: {
    color: "#9E9E9E",
    fontSize: 14,
  },
});

export default LookingForDriver;
