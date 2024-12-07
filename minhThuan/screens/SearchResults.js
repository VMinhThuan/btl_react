import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SearchResults = () => {
  const [visibleCount, setVisibleCount] = useState(2);
  const [sortOrder, setSortOrder] = useState('desc');
  const navigation = useNavigation();
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExactSearch, setIsExactSearch] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  // Fetch restaurant data
  useEffect(() => {
    axios
      .get('http://192.168.1.67:7777/restaurants') // Adjust API endpoint
      .then((response) => {
        setRestaurants(response.data);
      })
      .catch((error) => {
        console.error('Error fetching restaurants:', error);
      });
  }, []);

  const toggleSearchMode = () => {
    setIsExactSearch(!isExactSearch);
  };

  // Filtered and sorted restaurants based on search query and selected tags
  const filteredRestaurants = restaurants
    .filter((restaurant) => {
      const matchesSearch = isExactSearch
        ? restaurant.name.toLowerCase() === searchQuery.toLowerCase()
        : restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => restaurant.tags.includes(tag));
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => (sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating));

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const resultsCount = filteredRestaurants.length;

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'desc' ? 'asc' : 'desc'));
  };

  const renderHeader = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortAndFilterContainer}
      >
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <Text style={styles.sortText}>
            Sort by{' '}
            {sortOrder === 'desc' ? (
              <Icon name="chevron-down-outline" size={16} color="#00C2FF" />
            ) : (
              <Icon name="chevron-up-outline" size={16} color="#00C2FF" />
            )}
          </Text>
        </TouchableOpacity>
        {['Freeship', 'Favorite', 'Near you', 'Partner'].map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterTag,
              selectedTags.includes(tag) && styles.selectedFilterTag,
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={styles.filterTagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {searchQuery ? (
        <Text style={styles.resultsCountText}>
          {resultsCount} results for "{searchQuery}"
        </Text>
      ) : null}
    </View>
  );

  const renderFooter = () => (
    <View style={{ marginBottom: 16 }}>
      {visibleCount < filteredRestaurants.length ? (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => setVisibleCount(filteredRestaurants.length)}
        >
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => setVisibleCount(3)}
        >
          <Text style={styles.seeAllText}>Show less</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search bar and filters */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <TextInput
            onChangeText={(text) => setSearchQuery(text)}
            placeholder="Search by restaurant name"
            style={styles.searchInput}
            value={searchQuery}
          />
          <Icon
            name="close"
            size={20}
            color="gray"
            style={styles.closeIcon}
            onPress={() => setSearchQuery('')}
          />
        </View>
        <Icon name="filter" size={24} color="#00C2FF" style={styles.filterIcon} />
        <TouchableOpacity onPress={toggleSearchMode} style={styles.searchModeButton}>
          <Text style={styles.searchModeText}>
            {isExactSearch ? 'Exact' : 'Relative'}
          </Text>
        </TouchableOpacity>
      </View>

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
                {item.tags.map((tag, i) => (
                  <Text key={i} style={styles.tag}>
                    {tag}
                  </Text>
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
  

  searchHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8F8F8' },
  searchBar: { flexDirection: 'row', flex: 1, backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 16, color: 'gray' },
  closeIcon: { marginLeft: 8 },
  filterIcon: { marginLeft: 8 },

  searchModeButton: { marginLeft: 8, padding: 4, backgroundColor: '#E0F7FA', borderRadius: 8 },
  searchModeText: { color: '#007AFF', fontSize: 14 },
  
  resultsCountText: {marginTop: 8,padding: 16, fontSize: 18, color: '#333', fontWeight: '200' },
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

  menuItem: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  menuItemImage: { width: 50, height: 50, borderRadius: 4, marginRight: 8 },
  menuItemName: { fontSize: 14, color: '#333' },
  menuItemPrice: { fontSize: 14, color: '#333', marginTop: 2 },
  
  
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C4C4C4', marginHorizontal: 4 },

  

  

  seeAllButton: { alignItems: 'center', backgroundColor: '#E0F7FA', padding: 12, borderRadius: 8, marginHorizontal: 16, marginTop: 16 },
  seeAllText: { fontSize: 14, color: '#007AFF' },

  bottomNavigation: {flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  navIcon: { alignItems: 'center' },
  navLabel: { fontSize: 10, color: 'gray', marginTop: 4 },
});

export default SearchResults;