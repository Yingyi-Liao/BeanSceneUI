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
  Switch,
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

export default function CreateItemScreen({ isOnline = true, onBack }) {
  const username = 'Yingyi';
  const role = 'manager';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // --- FORM STATE ---
  const [itemName, setItemName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!isOnline) {
      setErrorMessage('❌ Cannot Submit: System is OFFLINE');
      return;
    }
    if (!itemName || selectedCategories.length === 0 || !price) {
      setErrorMessage('❌ Error: Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Success',
      `Item "${itemName}" has been created successfully!`,
      [{ text: 'OK', onPress: onBack }]
    );
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
        <Text style={styles.screenTitle}>Create New Item</Text>

        {/* ERROR BOX */}
        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* TABLET LAYOUT */}
        <View style={isTablet ? styles.tabletRow : null}>

          {/* LEFT COLUMN */}
          <View style={isTablet ? styles.tabletLeft : null}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              placeholder="e.g. Chocolate Cake"
              value={itemName}
              onChangeText={setItemName}
            />

            {/* CATEGORY SELECTOR */}
            <Text style={styles.label}>Categories</Text>

            <View style={styles.categoryRow}>
              {/* Dropdown mock */}
              <TouchableOpacity
                style={[styles.selectBox, isTablet && styles.selectBoxTablet]}
                onPress={() => {}}
              >
                <Text style={styles.selectBoxText}>Select category...</Text>
              </TouchableOpacity>

              {/* Add Category button */}
              <TouchableOpacity
                style={[styles.addCategoryBtn, isTablet && styles.addCategoryBtnTablet]}
                onPress={() => {}}
              >
                <Text style={styles.addCategoryBtnText}>＋ Add</Text>
              </TouchableOpacity>
            </View>

            {/* MULTI-CATEGORY TAGS WITH REMOVE BUTTON */}
            <View style={styles.tagContainer}>
              {selectedCategories.map((cat, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{cat}</Text>

                  <TouchableOpacity
                    style={styles.removeTagBtn}
                    onPress={() => {}}
                  >
                    <Text style={styles.removeTagText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={[styles.inputField, isTablet && styles.inputFieldTablet]}
              placeholder="e.g. 5.50"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* RIGHT COLUMN */}
          <View style={isTablet ? styles.tabletRight : null}>

            <Text style={styles.label}>Item Image</Text>
            <TouchableOpacity style={styles.imageUploadBox} onPress={() => {}}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : (
                <Text style={styles.imageUploadText}>Tap to upload image</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.inputField,
                { height: 100, textAlignVertical: 'top' },
                isTablet && styles.inputFieldTablet,
              ]}
              placeholder="Enter item description..."
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Item Active?</Text>
              <Switch
                trackColor={{ false: '#767577', true: COLORS.beanLightBlue }}
                thumbColor="#f4f3f4"
                value={isActive}
                onValueChange={setIsActive}
              />
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>SUBMIT ITEM</Text>
            </TouchableOpacity>
          </View>
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

  /* TABLET LAYOUT */
  tabletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 30,
  },
  tabletLeft: { flex: 1 },
  tabletRight: { flex: 1 },

  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },

  inputField: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  inputFieldTablet: {
    padding: 16,
    fontSize: 18,
  },

  /* CATEGORY SELECTOR */
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  selectBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  selectBoxTablet: {
    padding: 16,
  },
  selectBoxText: {
    fontSize: 16,
    color: '#333',
  },

  addCategoryBtn: {
    backgroundColor: COLORS.beanLightBlue,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addCategoryBtnTablet: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  addCategoryBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  /* CATEGORY TAGS */
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beanLightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 6,
  },

  removeTagBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTagText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: -1,
  },

  /* IMAGE UPLOAD MOCK */
  imageUploadBox: {
    height: 150,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUploadText: {
    color: '#666',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 20,
  },

  submitBtn: {
    backgroundColor: '#083944',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  backButton: { marginTop: 30, alignItems: 'center' },
  backButtonText: { color: '#666', fontSize: 14 },
});
