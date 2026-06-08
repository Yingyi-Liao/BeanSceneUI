import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

import BeanSceneLogo from '../images/BeanSceneLogo.jpg';
import { API_BASE } from '../constants/apibase';
import { COLORS } from '../constants/colors';

export default function CategoryManagementScreen({ navigation, route }) {
  const { username, role, isOnline = true } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);

  // -----------------------------
  // FETCH CATEGORIES FROM BACKEND
  // -----------------------------
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE}/api/category`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to load categories');
      }

      // Keep full objects
      setCategories(json.data || []);
    } catch (err) {
      setErrorMessage('Failed to load categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // -----------------------------
  // FILTERED LIST
  // -----------------------------
  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -----------------------------
  // NAVIGATION HANDLERS
  // -----------------------------
  const handleOpenUpdateCategory = (categoryObj) => {
    navigation.navigate('UpdateDeleteCategory', {
      category: categoryObj,
      username,
      role,
      isOnline,
    });
  };

  const handleCreateCategory = () => {
    navigation.navigate('CreateCategory', {
      username,
      role,
      isOnline,
    });
  };

  const handleBackToMenuManagement = () => {
    navigation.navigate('MenuManagement', {
      username,
      role,
      isOnline,
    });
  };

  const handleLogout = async () => {
      await SecureStore.deleteItemAsync('jwt');
      navigation.replace('Login');
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

      {/* HEADER WITH BACK BUTTON */}
      <View style={[styles.headerContainer, isTablet && styles.headerContainerTablet]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={handleBackToMenuManagement}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>

        <Image source={BeanSceneLogo} style={styles.logo} resizeMode="contain" />

        <View style={[styles.userProfile, isTablet && styles.userProfileTablet]}>
          <View style={{ marginRight: 10 }}>
            <Text style={styles.userNameText}>{username}</Text>
            <Text style={styles.userRoleText}>{role?.toUpperCase()}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtnSmall}
            onPress={handleLogout}
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

        {/* LOADING */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={COLORS.beanMidBlue}
            style={{ marginTop: 20 }}
          />
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
          {filteredCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, isTablet && styles.categoryCardTablet]}
              onPress={() => handleOpenUpdateCategory(cat)}
            >
              <Text style={styles.categoryName}>{cat.categoryName}</Text>
              <Text style={styles.categoryDescription}>
                {cat.description || 'No description'}
              </Text>
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
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
  },
  headerContainerTablet: {
    paddingHorizontal: 40,
    paddingVertical: 25,
  },

  headerBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 6,
    marginRight: 10,
  },
  headerBackText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.beanDarkBlue,
  },

  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: 'row', alignItems: 'center' },
  userProfileTablet: { gap: 20 },

  logoutBtnSmall: {
    backgroundColor: COLORS.errorBg,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  logoutTextSmall: { fontSize: 12, color: COLORS.errorRed, fontWeight: 'bold' },

  mainContent: { flex: 1, padding: 20 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.beanDarkBlue, marginBottom: 20 },

  errorBox: {
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: 'bold' },

  searchBar: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
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
  createBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },

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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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

  categoryDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  hintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 10,
  },
});
