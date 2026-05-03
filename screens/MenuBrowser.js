import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

import BeanSceneLogo from './images/BeanSceneLogo.jpg';

const COLORS = {
  beanDarkBlue: '#083944',
  beanMidBlue: '#2F6672',
  beanLightBlue: '#4AA1B5',
  beanLightGrey: '#E0E0E0',
  white: '#FFFFFF',
  errorRed: '#D32F2F',
  statusOnline: '#2E7D32',
  statusOffline: '#C62828',
};

const MOCK_MENU_DATA = [
  {
    id: '1',
    name: 'Garlic Bread',
    category: 'Entrées',
    price: 6.00,
    qty: 0,
    image: require('./images/GarlicBread.jpg')
  },
  {
    id: '2',
    name: 'Caesar Salad',
    category: 'Entrées',
    price: 9.50,
    qty: 0,
    image: require('./images/CaesarSalad.jpg')
  },
  {
    id: '3',
    name: 'Grilled Steak',
    category: 'Mains',
    price: 22.00,
    qty: 0,
    image: require('./images/GrilledSteak.jpg')
  },
  {
    id: '4',
    name: 'Spaghetti Bolognese',
    category: 'Mains',
    price: 18.00,
    qty: 0,
    image: require('./images/SpaghettiBolognese.jpg')
  },
  {
    id: '5',
    name: 'Cheesecake',
    category: 'Desserts',
    price: 8.00,
    qty: 0,
    image: require('./images/Cheesecake.jpg')
  },
  {
    id: '6',
    name: 'Chocolate Brownie',
    category: 'Desserts',
    price: 7.50,
    qty: 0,
    image: require('./images/ChocolateBrownie.jpg')
  },
  {
    id: '7',
    name: 'Coke',
    category: 'Drinks',
    price: 4.00,
    qty: 0,
    image: require('./images/Coke.jpg')
  },
  {
    id: '8',
    name: 'Iced Tea',
    category: 'Drinks',
    price: 4.50,
    qty: 0,
    image: require('./images/IcedTea.jpg')
  },
  {
    id: '9',
    name: 'Fries',
    category: 'Sides',
    price: 5.00,
    qty: 0,
    image: require('./images/Fries.jpg')
  },
  {
    id: '10',
    name: 'Chef’s Special',
    category: 'Specials',
    price: 18.00,
    qty: 0,
    image: require('./images/ChefSpecial.jpg')
  },
];

export default function MenuScreen({ isOnline = true }) {
  const username = 'Yingyi';
  const role = 'staff';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
  'All',
  'Entrées',
  'Mains',
  'Desserts',
  'Drinks',
  'Sides',
  'Specials'
];

  // --- FILTERING LOGIC ---
  const filteredMenu = MOCK_MENU_DATA.filter(item => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* STATUS BAR */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: isOnline ? COLORS.statusOnline : COLORS.statusOffline },
        ]}
      >
        <Text style={styles.statusText}>
          {isOnline ? '● System Online' : '○ System Offline'}
        </Text>
      </View>

      {/* HEADER */}
      <View style={[styles.headerContainer, isTablet && styles.headerContainerTablet]}>
        <Image source={BeanSceneLogo} style={styles.logo} resizeMode="contain" />

        <View style={[styles.userProfile, isTablet && styles.userProfileTablet]}>
          <View style={{ marginRight: 10 }}>
            <Text style={styles.userNameText}>{username}</Text>
            <Text style={styles.userRoleText}>{role.toUpperCase()}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtnSmall}
            onPress={() => Alert.alert('Logout', 'Logged out')}
          >
            <Text style={styles.logoutTextSmall}>Log Off</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Menu Browsing</Text>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search for an item..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* CATEGORY FILTER */}
        <View style={styles.categoryWrapper}>
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.categoryScroll}
            >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryCard,
                  selectedCategory === cat && { backgroundColor: COLORS.beanLightBlue }
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && { color: 'white' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ITEM LIST */}
        <View style={isTablet ? styles.gridTablet : styles.listMobile}>
          {filteredMenu.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.itemCard, isTablet && styles.itemCardTablet]}
              onPress={() => Alert.alert('Detail View', `Navigating to ${item.name} details...`)}
            >
              <Image
                source={
                  typeof item.image === 'string'
                    ? { uri: item.image }
                    : item.image
                }
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>

              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>Qty: {item.qty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  statusBar: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  statusText: { fontSize: 12, fontWeight: 'bold', color: COLORS.white },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  headerContainerTablet: {
    paddingHorizontal: 40,
    paddingVertical: 25,
  },

  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: 'row', alignItems: 'center' },
  userProfileTablet: { gap: 20 },

  logoutBtnSmall: {
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutTextSmall: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  
  userNameText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  userRoleText: { fontSize: 10, color: '#666', marginRight: 10 },

  mainContent: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#083944', marginBottom: 15 },

  searchContainer: { marginBottom: 20 },
  searchBar: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },

  categoryWrapper: { marginBottom: 20 },
  categoryScroll: { paddingVertical: 5 },
  categoryCard: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: { color: '#333', fontWeight: '600' },

  listMobile: { flexDirection: 'column', gap: 15 },
  gridTablet: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15},

  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 3,
  },
  itemCardTablet: {
    width: '48%',
  },

  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#083944' },
  itemCategory: { fontSize: 12, color: '#666' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#4AA1B5' },

  qtyBadge: { backgroundColor: '#F0F0F0', padding: 5, borderRadius: 5, marginLeft: 10 },
  qtyText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
});