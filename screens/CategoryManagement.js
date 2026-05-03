import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import BeanSceneLogo from './images/BeanSceneLogo.jpg';

const COLORS = {
  beanDarkBlue: '#083944',
  beanMidBlue: '#2F6672',
  beanLightBlue: '#4AA1B5',
  white: '#FFFFFF',
  errorRed: '#D32F2F',
  statusOnline: '#2E7D32',
  statusOffline: '#C62828',
  lightGrey: '#F5F5F5',
};

export default function CategoryManagementScreen({ isOnline = true, onBack }) {
  const username = 'Yingyi';
  const role = 'manager';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [categories, setCategories] = useState([
    'Entrées',
    'Mains',
    'Desserts',
    'Drinks',
    'Sides',
    'Specials',
    'Gluten-Free',
    'Vegan',
  ]);

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenUpdateCategory = (cat) => {
    Alert.alert('Navigation', `Opening Update Category Screen for: ${cat}`);
  };

  const handleCreateCategory = () => {
    Alert.alert('Navigation', 'Opening Create New Category Screen...');
  };

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
      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.screenTitle}>Category Management</Text>

        {/* ERROR BOX */}
        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* SEARCH BAR */}
        <TextInput
          style={[styles.searchBar, isTablet && styles.searchBarTablet]}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* CREATE NEW CATEGORY BUTTON */}
        <TouchableOpacity
          style={[styles.createBtn, isTablet && styles.createBtnTablet]}
          onPress={handleCreateCategory}
        >
          <Text style={styles.createBtnText}>＋ Create New Category</Text>
        </TouchableOpacity>

        {/* CATEGORY LIST */}
        <Text style={styles.hintText}>Tap to edit/delete</Text>
        <View style={[styles.categoryList, isTablet && styles.categoryListTablet]}>
          {filteredCategories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, isTablet && styles.categoryCardTablet]}
              onPress={() => handleOpenUpdateCategory(cat)}
            >
              <Text style={styles.categoryName}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back to Menu Management</Text>
        </TouchableOpacity>
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

  mainContent: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: '#083944', marginBottom: 20 },

  errorBox: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginBottom: 15,
  },
  errorText: { color: '#D32F2F', fontWeight: 'bold' },

  searchBar: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 15,
  },
  searchBarTablet: {
    padding: 16,
    fontSize: 18,
  },

  createBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createBtnTablet: {
    padding: 18,
  },
  createBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  /* CATEGORY LIST */
  categoryList: {
    flexDirection: 'column',
  },
  categoryListTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },

  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  categoryCardTablet: {
    width: '45%',
    padding: 20,
  },

  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.beanDarkBlue,
    marginBottom: 6,
  },

  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },

  backButton: { marginTop: 30, alignItems: 'center' },
  backButtonText: { color: '#666', fontSize: 14 },
});
