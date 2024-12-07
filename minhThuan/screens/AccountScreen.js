import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const AccountScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Image source={{uri: 'https://static.vecteezy.com/system/resources/previews/011/405/724/non_2x/call-food-logo-design-food-delivery-service-logo-concept-free-vector.jpg'}} style={styles.image} />
            <Text style={styles.title}>Thuan Food Delivery</Text>
            <Text style={styles.subtitle}>Explore the Food, Touch the Soul!</Text>
            <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f7f9fc',
    },
    image: {
        width: 350,
        height: 250,
        marginBottom: 30,
        borderRadius: 125,
        borderWidth: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    signUpButton: {
        backgroundColor: '#00bfff', // Màu nền cho nút Sign Up
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
    },
    loginButton: {
        backgroundColor: '#32cd32', // Màu nền cho nút Login (màu xanh lá)
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AccountScreen;
