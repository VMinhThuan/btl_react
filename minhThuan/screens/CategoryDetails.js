import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const CategoryDetails = () => {
  const [visibleCount, setVisibleCount] = useState(3);
  const [sortOrder, setSortOrder] = useState('desc');
  const [restaurants, setRestaurants] = useState([]);
  const [banners, setBanners] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const navigation = useNavigation();
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    // Fetch restaurants từ backend
    axios.get('http://192.168.1.67:7777/restaurants')
      .then(response => {
        setRestaurants(response.data); // restaurants đã được chuyển đổi `tags` thành mảng ở backend
      })
      .catch(error => console.error('Error fetching restaurants:', error));
  
    // Fetch banners từ backend
    axios.get('http://192.168.1.67:7777/banners')
      .then(response => setBanners(response.data))
      .catch(error => console.error('Error fetching banners:', error));
  
    // Fetch recommended items từ backend
    axios.get('http://192.168.1.67:7777/recommendedforyou')
      .then(response => setRecommendedItems(response.data))
      .catch(error => console.error('Error fetching recommended_for_you:', error));
  }, []);
  

  const sortedRestaurants = [...restaurants].sort((a, b) => 
    sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating
  );

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredRestaurants = sortedRestaurants.filter(restaurant =>
    selectedTags.length === 0 || selectedTags.every(tag => restaurant.tags.includes(tag))
  );

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'desc' ? 'asc' : 'desc'));
  };

  const renderHeader = () => (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortAndFilterContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <Text style={styles.sortText}>
            Sort by {sortOrder === 'desc' ? <Icon name="chevron-down-outline" size={16} color="#00C2FF" /> : <Icon name="chevron-up-outline" size={16} color="#00C2FF" />}
          </Text>
        </TouchableOpacity>
        {['Freeship', 'Favorite', 'Near you', 'Partner'].map((tag, index) => (
          <TouchableOpacity key={index} style={[styles.filterTag, selectedTags.includes(tag) && styles.selectedFilterTag]} onPress={() => toggleTag(tag)}>
            <Text style={styles.filterTagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderBanner = () => (
    <View style={styles.carouselContainer}>
      {banners.length > 0 && (
        <>
          <ImageBackground source={{ uri: banners[bannerIndex].image_path }} style={styles.bannerImage} imageStyle={styles.bannerImageRadius}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerText}>{banners[bannerIndex].title}</Text>
            </View>
          </ImageBackground>
          <View style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setBannerIndex(index)}
                style={[styles.dot, bannerIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={{ marginBottom: 16 }}>
      {visibleCount < restaurants.length ? (
        <TouchableOpacity style={styles.seeAllButton} onPress={() => setVisibleCount(restaurants.length)}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.seeAllButton} onPress={() => setVisibleCount(3)}>
          <Text style={styles.seeAllText}>Show less</Text>
        </TouchableOpacity>
      )}
      {renderBanner()}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recommendedItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.recommendedCard}>
            <Image source={{ uri: item.image_path }} style={styles.recommendedImage} />
            <Text style={styles.recommendedName}>{item.name}</Text>
            <Text style={styles.recommendedDescription}>{item.description}</Text>
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantTime}>{item.time}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.restaurantRating}>{item.rating}</Text>
              <Icon name="star" size={12} color="#FFD700" style={styles.starIcon} />
            </View>
            <View style={styles.tagsContainer}>
                {Array.isArray(item.tags) && item.tags.map((tag, i) => (
                  <Text key={i} style={styles.tag}>{tag}</Text>
                ))}
              </View>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRestaurants.slice(0, visibleCount)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.restaurantContainer}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
          >
            <Image source={{ uri: item.image_path }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text style={styles.restaurantType}>{item.type}</Text>
              <View style={styles.restaurantDetails}>
                <Text style={styles.restaurantTime}>{item.time}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.restaurantRating}>{item.rating}</Text>
                <Icon name="star" size={12} color="#FFD700" style={styles.starIcon} />
              </View>
              <View style={styles.tagsContainer}>
                {Array.isArray(item.tags) && item.tags.map((tag, i) => (
                  <Text key={i} style={styles.tag}>{tag}</Text>
                ))}
              </View>

            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />
      <View style={styles.bottomNavigation}>
        <NavIcon name="home" label="Home" />
        <NavIcon name="list-outline" label="My Order" />
        <NavIcon name="heart-outline" label="Favorites" />
        <NavIcon name="chatbox-ellipses-outline" label="Inbox" />
        <NavIcon name="person-outline" label="Account" />
      </View>
    </View>
  );
};

const NavIcon = ({ name, label }) => (
  <TouchableOpacity style={styles.navIcon}>
    <Icon name={name} size={24} color="black" />
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 8 },
  
  sortAndFilterContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#E0F7FA', marginRight: 10 },
  sortText: { fontSize: 14, color: '#00C2FF', marginRight: 4 },
  filterTag: { backgroundColor: '#F0F0F0', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 },
  selectedFilterTag: { backgroundColor: '#00C2FF' },
  filterTagText: { fontSize: 14, color: '#3D3D3D' },

  restaurantContainer: { flexDirection: 'row', padding: 12, marginHorizontal: 16, marginVertical: 8, backgroundColor: '#FFFFFF', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  restaurantImage: { width: 120, height: 120, borderRadius: 10, marginRight: 12 },
  restaurantInfo: { flex: 1, justifyContent: 'center' },
  restaurantName: { fontSize: 16, fontWeight: '600', color: '#333' },
  restaurantType: { fontSize: 14, color: '#8E8E8E', marginVertical: 2 },
  restaurantDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  restaurantTime: { fontSize: 12, color: '#8E8E8E' },
  dot: { fontSize: 12, color: '#8E8E8E', marginHorizontal: 4 },
  restaurantRating: { fontSize: 12, color: '#8E8E8E' },
  starIcon: { marginLeft: 4 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: { backgroundColor: '#E0F7FA', color: '#007AFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10, marginRight: 4, marginTop: 4 },

  // Carousel Styles
  carouselContainer: { marginTop: 16, paddingHorizontal: 16, alignItems: 'center' },
  bannerImage: { 
    width: '100%', 
    height: 200, 
    borderRadius: 12, 
    overflow: 'hidden', 
    justifyContent: 'center' 
  },
  bannerImageRadius: { 
    borderRadius: 12 
  },
  bannerTextContainer: {
    position: 'absolute',
    left: 16, // Distance from the left edge
    top: '50%', // Center vertically
    transform: [{ translateY: -10 }], // Adjust to center text more precisely
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white background
    borderRadius: 5,
  },
  bannerText: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#007AFF' 
  },
  dotsContainer: { flexDirection: 'row', marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C4C4C4', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#00C2FF' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#3D3D3D' },
  viewAll: { fontSize: 14, color: '#A0A0A0' },

  recommendedCard: { width: 140, marginRight: 16, backgroundColor: '#fff', borderRadius: 8, padding: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  recommendedImage: { width: '100%', height: 100, borderRadius: 8 },
  recommendedName: { fontSize: 14, fontWeight: 'bold', color: '#3D3D3D', marginTop: 8 },
  recommendedDescription: { fontSize: 12, color: '#8E8E8E', marginVertical: 4 },

  seeAllButton: { alignItems: 'center', backgroundColor: '#E0F7FA', padding: 12, borderRadius: 8, marginHorizontal: 16, marginTop: 16 },
  seeAllText: { fontSize: 14, color: '#007AFF' },

  bottomNavigation: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  navIcon: { alignItems: 'center' },
  navLabel: { fontSize: 10, color: 'gray', marginTop: 4 },
});

export default CategoryDetails;
