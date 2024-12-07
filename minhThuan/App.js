import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CategoryDetails from './screens/CategoryDetails';
import RestaurantDetails from './screens/RestaurantDetails';
import SearchResults from './screens/SearchResults';
import FoodDetails from './screens/FoodDetails';
import { CartProvider } from './contexts/CartContext';
import CartScreen from './screens/CartScreen';
import AddItemScreen from './screens/AddItemScreen'
import OrderReview from './screens/OrderReview';
import SelectLocation from './screens/SelectLocation';
import SelectOffers from './screens/SelectOffers';
import { VoucherProvider } from './contexts/VoucherContext';
import SelectDeliveryTime from './screens/SelectDeliveryTime';
import DeliveryAddress from './screens/DeliveryAddress';
import NewAddress from './screens/NewAddress';
import PaymentMethodSelection from './screens/PaymentMethodSelection';
import AccountScreen from './screens/AccountScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LookingForDriver from './screens/LookingForDriver';
import OrderTracking from './screens/OrderTracking';
const Stack = createStackNavigator();

export default function App() {
  
  return (
  <CartProvider>
    <VoucherProvider>
     <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CategoryDetails" component={CategoryDetails} options={({ route }) => ({ title: route.params.category })} />
        <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} options={({ route }) => ({ title: route.params.category })} />
        <Stack.Screen name="SearchResults" component={SearchResults}/>
        <Stack.Screen name="FoodDetails" component={FoodDetails}/>
        <Stack.Screen name="CartScreen" component={CartScreen}/>
        <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add Item' }} />
        <Stack.Screen name="OrderReview" component={OrderReview} />
        <Stack.Screen name="SelectLocation" component={SelectLocation} />
        <Stack.Screen name="SelectOffers" component={SelectOffers} />
        <Stack.Screen name="SelectDeliveryTime" component={SelectDeliveryTime}/>
        <Stack.Screen name="DeliveryAddress" component={DeliveryAddress} />
        <Stack.Screen name="NewAddress" component={NewAddress} />
        <Stack.Screen name="PaymentMethodSelection" component={PaymentMethodSelection} />
        <Stack.Screen name="AccountScreen" component={AccountScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LookingForDriver" component={LookingForDriver} />
        <Stack.Screen name="OrderTracking" component={OrderTracking} />

        

      </Stack.Navigator>
     </NavigationContainer>
    </VoucherProvider>
  </CartProvider>
    
  );
}