import React, { useState } from 'react';
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
  Switch,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';

import BeanSceneLogo from '../images/BeanSceneLogo.jpg';
import { API_BASE } from '../constants/apibase';
import { COLORS } from '../constants/colors';
import * as SecureStore from 'expo-secure-store';

export default function CreateCategoryScreen({ navigation, route }) {
  const { username, role, isOnline = true } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // SUBMIT NEW CATEGORY
  // -----------------------------
  const handleSubmit = async () => {
    if (!isOnline) {
      setErrorMessage('❌ Cannot Submit: System is OFFLINE');
      setSuccessMessage('');
      return;
    }
    if (!categoryName.trim()) {
      setErrorMessage('❌ Error: Category name is required');
      setSuccessMessage('');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const token = await SecureStore.getItemAsync('jwt');

      const payload = {
        categoryName: categoryName.trim(),
        description: description.trim(),
        isActive,
      };

      const response = await fetch(`${API_BASE}/api/category/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to create category');
      }

      // ⭐ SUCCESS FEEDBACK
      setSuccessMessage('✔ Category created successfully!');
      setErrorMessage('');

      // Navigate back after brief confirmation
      setTimeout(() => {
        navigation.navigate('CategoryManagement', {
          username,
          role,
          isOnline,
        });
      }, 800);

    } catch (err) {
      setErrorMessage('❌ ' + err.message);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.navigate('CategoryManagement', {
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
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
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
        <Text style={styles.screenTitle}>Create New Category</Text>

        {/* SUCCESS BOX */}
        {successMessage !== '' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* ERROR BOX */}
        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator
            size="large"
            color={COLORS.beanMidBlue}
            style={{ marginBottom: 20 }}
          />
        )}

        {/* TABLET LAYOUT */}
        <View style={isTablet ? styles.tabletCenterWrapper : null}>
          <View style={styles.tabletContent}>

            {/* CATEGORY NAME */}
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              placeholder="e.g. Desserts"
              value={categoryName}
              onChangeText={setCategoryName}
            />

            {/* DESCRIPTION */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.inputField,
                { height: 100, textAlignVertical: 'top' },
                isTablet && styles.inputFieldTablet,
              ]}
              placeholder="Describe this category..."
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* ACTIVE SWITCH */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Category Active?</Text>
              <Switch
                trackColor={{ false: '#767577', true: COLORS.beanLightBlue }}
                thumbColor="#f4f3f4"
                value={isActive}
                onValueChange={setIsActive}
              />
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>SUBMIT CATEGORY</Text>
            </TouchableOpacity>
          </View>
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

  /* SUCCESS BOX */
  successBox: {
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#66BB6A',
    marginBottom: 15,
  },
  successText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },

  /* ERROR BOX */
  errorBox: {
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: 'bold' },

  tabletCenterWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  tabletContent: {
    width: '100%',
    maxWidth: 700,
  },

  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },

  inputField: {
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
  },
  inputFieldTablet: {
    padding: 16,
    fontSize: 18,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    marginBottom: 20,
  },

  submitBtn: {
    backgroundColor: COLORS.beanMidBlue,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});
