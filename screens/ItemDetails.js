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
  useWindowDimensions
} from 'react-native';

import BeanSceneLogo from './images/BeanSceneLogo.jpg';

// --- MOCK ITEM DATA ---
const MOCK_ITEM_DETAIL = {
  id: '1',
  name: 'Garlic Bread',
  category: 'Entrées',
  price: 6.00,
  description: 'Freshly baked bread with garlic butter, herbs, and melted parmesan cheese.',
  image: require('./images/GarlicBread.jpg')
};

const COLORS = {
  beanDarkBlue: '#083944',
  beanMidBlue: '#2F6672',
  beanLightBlue: '#4AA1B5',
  white: '#FFFFFF',
  errorRed: '#D32F2F',
  statusOnline: '#2E7D32',
  statusOffline: '#C62828',
  lightGrey: '#F5F5F5'
};

export default function ItemDetailScreen({ isOnline = true, onBack }) {
  const username = 'Yingyi';
  const role = 'staff';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [quantity, setQuantity] = useState(1);
  const [specialRequirement, setSpecialRequirement] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = (MOCK_ITEM_DETAIL.price * quantity).toFixed(2);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
    setErrorMessage('');
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
    setErrorMessage('');
  };

  const handleAddToOrder = () => {
    if (!isOnline) {
      setErrorMessage('❌ Cannot Add: System is OFFLINE');
      return;
    }

    Alert.alert(
      'Success',
      `Added ${quantity} x ${MOCK_ITEM_DETAIL.name} to your order!`,
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

        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* TABLET LAYOUT WRAPPER */}
        <View style={isTablet ? styles.tabletRow : null}>

          {/* LEFT COLUMN (Tablet Only) */}
          {isTablet && (
            <View style={styles.tabletLeft}>
              <Image source={MOCK_ITEM_DETAIL.image} style={styles.itemImageTablet} />
            </View>
          )}

          {/* RIGHT COLUMN */}
          <View style={isTablet ? styles.tabletRight : null}>

            {/* MOBILE IMAGE */}
            {!isTablet && (
              <Image source={MOCK_ITEM_DETAIL.image} style={styles.itemImage} />
            )}

            {/* ITEM INFO */}
            <View style={styles.infoSection}>
              <Text style={styles.itemName}>{MOCK_ITEM_DETAIL.name}</Text>
              <Text style={styles.itemCategory}>{MOCK_ITEM_DETAIL.category}</Text>
              <Text style={styles.itemPrice}>${MOCK_ITEM_DETAIL.price.toFixed(2)} / unit</Text>

              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{MOCK_ITEM_DETAIL.description}</Text>
            </View>

            {/* QUANTITY */}
            <View style={styles.quantityContainer}>
              <Text style={styles.label}>Quantity</Text>

              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={handleDecrement}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={quantity.toString()}
                  onChangeText={(val) => setQuantity(Number(val) || 1)}
                />

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={handleIncrement}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SUBTOTAL */}
            <View style={styles.subtotalContainer}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalAmount}>${subtotal}</Text>
            </View>

            {/* SPECIAL REQUIREMENTS */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Special Requirements</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g. No onions, extra spicy..."
                multiline
                numberOfLines={3}
                value={specialRequirement}
                onChangeText={setSpecialRequirement}
              />
            </View>

            {/* ADD TO ORDER */}
            <TouchableOpacity style={styles.addOrderBtn} onPress={handleAddToOrder}>
              <Text style={styles.addOrderBtnText}>ADD TO ORDER</Text>
            </TouchableOpacity>

            {/* BACK BUTTON */}
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back to Menu</Text>
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

  errorBox: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginBottom: 15
  },
  errorText: { color: '#D32F2F', fontWeight: 'bold' },

  // TABLET LAYOUT
  tabletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 30,
  },
  tabletLeft: {
    flex: 1,
  },
  tabletRight: {
    flex: 1,
  },

  itemImageTablet: {
    width: '100%',
    height: 350,
    borderRadius: 16,
    marginBottom: 20,
  },

  // MOBILE IMAGE
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },

  infoSection: { marginBottom: 20 },
  itemName: { fontSize: 26, fontWeight: 'bold', color: '#083944' },
  itemCategory: { fontSize: 14, color: '#666', marginBottom: 5 },
  itemPrice: { fontSize: 20, fontWeight: 'bold', color: '#4AA1B5' },
  descriptionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  descriptionText: { fontSize: 14, color: '#555', lineHeight: 20 },

  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20
  },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333' },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden'
  },
  qtyBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0'
  },
  qtyBtnText: { fontSize: 20, fontWeight: 'bold', color: '#083944' },

  qtyInput: {
    textAlign: 'center',
    fontSize: 18,
    width: 50,
    borderWidth: 0,
    padding: 0
  },

  subtotalContainer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  subtotalLabel: { fontSize: 18, fontWeight: 'bold' },
  subtotalAmount: { fontSize: 22, fontWeight: 'bold', color: '#4AA1B5' },

  inputSection: { marginTop: 20 },
  textArea: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 8,
    height: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9'
  },

  addOrderBtn: {
    backgroundColor: '#083944',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30
  },
  addOrderBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  backButton: { marginTop: 20, alignItems: 'center' },
  backButtonText: { color: '#666', fontSize: 14 },
});
