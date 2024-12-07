import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, ImageBackground, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  
  // State lưu trữ dữ liệu từ backend
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [userName, setUserName] = useState('');
  const [showLogoutButton, setShowLogoutButton] = useState(false); 



  useEffect(() => {
    // Fetch categories
    axios.get('http://192.168.1.67:7777/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    // Fetch promotions
    axios.get('http://192.168.1.67:7777/promotions')
      .then(response => {
        setPromotions(response.data);
      })
      .catch(error => {
        console.error('Error fetching promotions:', error);
      });

    // Fetch recommended items
    axios.get('http://192.168.1.67:7777/recommended')
      .then(response => {
        setRecommendedItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching recommended items:', error);
      });

    // Fetch sale items
    axios.get('http://192.168.1.67:7777/sales')
      .then(response => {
        setSaleItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching sale items:', error);
      });
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (userId) {
          const response = await axios.get(`http://192.168.1.67:7777/users/${userId}`);
          setUserName(response.data.name); // Assuming the response contains the user's name
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    fetchUserName();
  }, []);

  // Function to navigate to CategoryDetails with category name
  const navigateToCategoryDetails = (categoryName) => {
    navigation.navigate('CategoryDetails', { category: categoryName });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Xóa dữ liệu người dùng khỏi AsyncStorage
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.replace('LoginScreen'); // Điều hướng về màn hình đăng nhập
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="location-outline" size={20} color="white" />
              <Text style={styles.headerTitle}>Home</Text>
            </View>
            {userName && (
             <TouchableOpacity
             style={styles.userGreetingContainer}
             onPress={() => setShowLogoutButton(!showLogoutButton)} // Toggle hiển thị nút Log Out
           >
             <Text style={styles.userGreeting}>Hello, {userName}!</Text>
           </TouchableOpacity>
            )}
            <Icon name="notifications-outline" size={24} color="white" />
        </View>       

        {showLogoutButton && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        )}

        {/* Search Bar within Header */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="gray" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search" 
            placeholderTextColor="gray" 
            style={styles.searchInput} 
            onFocus={() => navigation.navigate('SearchResults')} // Navigate on focus
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promotional Banner */}
        {promotions.map((promotion, index) => (
          <View key={index} style={styles.bannerContainer}>
            <ImageBackground
              source={{ uri: promotion.image_url }} // Sử dụng URL hình ảnh từ backend
              style={styles.bannerImage}
              imageStyle={styles.bannerImageRadius}
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{promotion.title}</Text>
                <Text style={styles.bannerPrice}>{promotion.price}</Text>
                <TouchableOpacity style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>{promotion.button_text}</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ))}

        {/* Categories (Horizontal Scroll) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category) => (
            <CategoryIcon
              key={category.id}
              name={category.name}
              icon={category.icon}
              backgroundColor={category.background_color}
              onPress={() => navigateToCategoryDetails(category.name)}
            />
          ))}
        </ScrollView>

        {/* Voucher Notification */}
        <View style={styles.voucherContainer}>
          <Icon name="gift-outline" size={18} color="#007AFF" />
          <Text style={styles.voucherText}>You have 5 vouchers here</Text>
          <Icon name="chevron-forward-outline" size={18} color="#007AFF" style={styles.voucherArrow} />
        </View>

        {/* Collections (2 Items Per Row) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collections</Text>    
        </View>
        <View style={styles.collectionGrid}>
          <CollectionButton title="FREESHIP" imageSource={require('../assets/image/hinh1_tachnen.png')} />
          <CollectionButton title="DEAL $1" imageSource={require('../assets/image/hinh2.png')} />
          <CollectionButton title="NEAR YOU" imageSource={require('../assets/image/hinh3.png')} />
          <CollectionButton title="POPULAR" imageSource={require('../assets/image/hinh4_tachnen.png')} />
        </View>

        {/* Recommended for You Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <HorizontalScrollList items={recommendedItems} />

        {/* Sale Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sale up to 50%</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <HorizontalScrollList items={saleItems} />
      </ScrollView>

      {/* Bottom Navigation (Footer) */}
      {/* Bottom Navigation (Footer) */}
      <View style={styles.bottomNavigation}>
        <NavIcon name="home" label="Home" />
        <NavIcon name="list-outline" label="My Order" />
        <NavIcon name="heart-outline" label="Favorites" />
        <NavIcon name="chatbox-ellipses-outline" label="Inbox" />
        <NavIcon name="person-outline" label="Account" onPress={() => navigation.navigate('AccountScreen')} />
      </View>
    </SafeAreaView>
  );
};

// Reusable Components
const CategoryIcon = ({ name, icon, backgroundColor, onPress }) => (
  <TouchableOpacity style={[styles.categoryIconContainer, { backgroundColor }]} onPress={onPress}>
    <Icon name={icon} size={28} color="black" />
    <Text style={styles.categoryText}>{name}</Text>
  </TouchableOpacity>
);

// Collection Button Component
const CollectionButton = ({ title, imageSource }) => (
  <TouchableOpacity style={styles.collectionButton}>
    <Image source={imageSource} style={styles.collectionImage} />
    <Text style={styles.collectionText}>{title}</Text>
  </TouchableOpacity>
);

const HorizontalScrollList = ({ items }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
    {items.map((item, index) => (
      <TouchableOpacity key={index} style={styles.itemCard}>
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        <Text style={styles.itemTitle}>{item.name}</Text>
        <View style={styles.itemDetailsContainer}>
          <Text style={styles.itemDetails}>{item.details}</Text>
          <Icon name="star" size={12} color="#FFD700" style={styles.starIcon} />
        </View>

        <View style={styles.itemTagsContainer}>
          {item.tags.split(',').map((tag, i) => (
            <Text key={i} style={styles.itemTag}>{tag.trim()}</Text>
          ))}
        </View>
        {item.discount && <Text style={styles.discountLabel}>{item.discount}</Text>}
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const NavIcon = ({ name, label, onPress }) => (
  <TouchableOpacity style={styles.navIcon} onPress={onPress}>
    <Icon name={name} size={24} color="black" />
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  
  // Combined Header and Search Container
  headerContainer: { backgroundColor: '#00C2FF', paddingBottom: 10, paddingHorizontal: 16},
  
  header: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#00C2FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  userGreetingContainer: {
    backgroundColor: '#FFFFFF', // White background for contrast
    borderRadius: 20, // Rounded edges
    paddingVertical: 5, // Vertical padding
    paddingHorizontal: 15, // Horizontal padding
    alignSelf: 'center', // Align it in the center vertically
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
    elevation: 3, // Shadow for Android
  },
  userGreeting: {
    color: '#00C2FF', // Text color matching the theme
    fontSize: 14,
    fontWeight: 'bold',
  },

  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  // Search Bar
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    marginTop: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  searchIcon: { marginRight: 8 },
  searchInput: { fontSize: 16, flex: 1, color: 'gray' },

  bannerContainer: { 
    marginHorizontal: 16, 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginTop: 16 
  },
  bannerImage: { 
    width: '100%', 
    height: 180, 
    justifyContent: 'center', 
  },
  bannerImageRadius: { 
    borderRadius: 12 
  },
  bannerOverlay: { 
    flex: 1, 
    marginLeft: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8,
    position: 'absolute',
    alignItems: 'flex-start', // Align content to the left
    justifyContent: 'center', 
    paddingLeft: 16 // Add padding to align with the left margin
  },
  bannerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  bannerPrice: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginVertical: 4 
  },
  bannerButton: { 
    backgroundColor: '#00C2FF', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginTop: 8 
  },
  bannerButtonText: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },

  categoryContainer: { 
    flexDirection: 'row', 
    paddingLeft: 16, 
    marginTop: 16, 
    marginBottom: 8 
  },
  categoryIconContainer: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  categoryText: { 
    marginTop: 4, 
    fontSize: 12, 
    color: '#3D3D3D', 
    textAlign: 'center' 
  },

  voucherContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E0F7FA', 
    padding: 10, 
    marginHorizontal: 16, 
    borderRadius: 8, 
    marginTop: 16 
  },
  voucherText: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14, 
    color: '#007AFF' 
  },
  voucherArrow: { 
    marginLeft: 8 
  },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    marginTop: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#3D3D3D' 
  },

  collectionGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    paddingHorizontal: 16, 
    marginTop: 8 
  },
  collectionButton: { 
    width: '45%', 
    marginVertical: 8, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    alignItems: 'center', 
    padding: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 2 
  },
  collectionImage: { 
    width: '50%', 
    height: 60, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  collectionText: { 
    fontSize: 12, 
    color: '#3D3D3D' 
  },

  horizontalScroll: { paddingLeft: 16, marginVertical: 16 },
  itemCard: { width: 140, marginRight: 16, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
  itemImage: { width: '100%', height: 100, borderRadius: 8 },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: '#3D3D3D', marginTop: 8 },
  itemDetails: { fontSize: 12, color: 'gray', marginTop: 4},
  itemDetailsContainer: {
    flexDirection: 'row', // Hiển thị các phần tử theo hàng ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
  },
  
  starIcon: {
    marginLeft: 5, // Khoảng cách giữa text và icon
  },

  itemTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  itemTag: { fontSize: 10, color: '#007AFF', backgroundColor: '#E0F0FF', padding: 4, borderRadius: 4, marginRight: 4 },
  discountLabel: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF5252', color: 'white', paddingHorizontal: 4, paddingVertical: 2, fontSize: 10, fontWeight: 'bold', borderRadius: 4 },

  bottomNavigation: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  navIcon: { alignItems: 'center' },
  navLabel: { fontSize: 10, color: 'gray', marginTop: 4 },
});

export default HomeScreen;
