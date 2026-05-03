import React, { useState, useMemo, useCallback } from 'react';
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
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';

import BeanSceneLogo from './images/BeanSceneLogo.jpg';

// --- ORIGINAL THEME ---
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

export default function CreateOrderScreen({ isOnline = true, menu = [], onSubmitOrder }) {
  const username = 'Yingyi';
  const role = 'staff';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Add item
  const handleAddRandomItem = useCallback(() => {
    if (!menu.length) {
      setErrorMessage('Menu unavailable.');
      return;
    }
    const randomItem = menu[Math.floor(Math.random() * menu.length)];
    const newItem = {
      id: Date.now().toString(),
      name: randomItem.name,
      qty: 1,
      requirement: 'Standard',
      subtotal: randomItem.price,
    };
    setCart(prev => [...prev, newItem]);
    setErrorMessage('');
  }, [menu]);

  // Remove item
  const handleRemoveItem = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  // Total
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    [cart]
  );

  // Validation
  const validate = useCallback(() => {
    if (!isOnline) {
      setErrorMessage('❌ Cannot Submit: System is OFFLINE');
      return false;
    }
    if (!tableNumber.trim()) {
      setErrorMessage('❌ Error: Table Number is required');
      return false;
    }
    if (cart.length === 0) {
      setErrorMessage('❌ Error: Cart is empty');
      return false;
    }
    setErrorMessage('');
    return true;
  }, [isOnline, tableNumber, cart]);

  // Submit
  const handleSubmitOrder = useCallback(async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        tableNumber: tableNumber.trim(),
        note: note.trim(),
        items: cart,
        total: Number(total),
        createdBy: username,
        createdAt: new Date().toISOString(),
      };

      await onSubmitOrder(payload);

      Alert.alert('Order Submitted', `Order for Table ${payload.tableNumber} has been sent to kitchen!`);

      setTableNumber('');
      setNote('');
      setCart([]);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  }, [validate, tableNumber, note, cart, total, onSubmitOrder]);

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
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={[
          { paddingBottom: 40 },
          isTablet && styles.mainContentTablet,
        ]}
      >
        <Text style={styles.screenTitle}>Create New Order</Text>

        {/* TABLET LAYOUT: TWO COLUMNS */}
        {isTablet ? (
          <View style={styles.tabletRow}>
            {/* LEFT COLUMN */}
            <View style={styles.tabletCol}>
              {/* ERROR BOX */}
              {errorMessage !== '' && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* TABLE NUMBER */}
              <Text style={styles.label}>Table Number</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. T12"
                value={tableNumber}
                onChangeText={setTableNumber}
              />

              {/* NOTES */}
              <Text style={styles.label}>Order Notes</Text>
              <TextInput
                style={[styles.inputField, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Special requests..."
                multiline
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* RIGHT COLUMN */}
            <View style={styles.tabletCol}>
              {/* CART */}
              <View style={styles.cartSection}>
                <Text style={styles.cartTitle}>Order Items ({cart.length})</Text>

                <View style={styles.cartGridTablet}>
                  {cart.length === 0 ? (
                    <Text style={styles.emptyText}>No items added yet.</Text>
                  ) : (
                    cart.map(item => (
                      <View key={item.id} style={styles.cartItemTablet}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemText}>{item.name} (x{item.qty})</Text>
                          <Text style={styles.itemSubText}>{item.requirement}</Text>
                        </View>
                        <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item.id)}
                          style={styles.removeBtn}
                        >
                          <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={handleAddRandomItem}>
                  <Text style={styles.addBtnText}>+ Add Item (Browse Menu)</Text>
                </TouchableOpacity>
              </View>

              {/* TOTAL */}
              <Text style={styles.totalText}>Total: ${total}</Text>

              {/* SUBMIT */}
              <TouchableOpacity
                style={[styles.submitBtn, isTablet && styles.submitBtnTablet]}
                onPress={handleSubmitOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitBtnText}>SUBMIT ORDER</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* MOBILE LAYOUT (unchanged) */}
            {errorMessage !== '' && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <Text style={styles.label}>Table Number</Text>
            <TextInput
              style={styles.inputField}
              placeholder="e.g. T12"
              value={tableNumber}
              onChangeText={setTableNumber}
            />

            <View style={styles.cartSection}>
              <Text style={styles.cartTitle}>Order Items ({cart.length})</Text>

              {cart.length === 0 ? (
                <Text style={styles.emptyText}>No items added yet.</Text>
              ) : (
                cart.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemText}>{item.name} (x{item.qty})</Text>
                      <Text style={styles.itemSubText}>{item.requirement}</Text>
                    </View>
                    <Text style={styles.itemPrice}>${item.subtotal.toFixed(2)}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <TouchableOpacity style={styles.addBtn} onPress={handleAddRandomItem}>
                <Text style={styles.addBtnText}>+ Add Item (Browse Menu)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.totalText}>Total: ${total}</Text>

            <Text style={styles.label}>Order Notes</Text>
            <TextInput
              style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Special requests..."
              multiline
              value={note}
              onChangeText={setNote}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>SUBMIT ORDER</Text>
              )}
            </TouchableOpacity>
          </>
        )}
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

  userNameText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userRoleText: { fontSize: 12, color: '#666', marginRight: 10 },

  logoutBtnSmall: {
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutTextSmall: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },

  mainContent: { flex: 1, padding: 20 },
  mainContentTablet: { paddingHorizontal: 60, paddingTop: 40 },

  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#083944',
    marginBottom: 20,
  },

  errorBox: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginBottom: 15,
  },
  errorText: { color: '#D32F2F', fontWeight: 'bold' },

  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  inputField: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 14,
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },

  tabletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabletCol: {
    flex: 1,
    marginHorizontal: 10,
  },

  cartSection: {
    padding: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cartTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },

  cartGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  cartItemTablet: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },

  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },

  itemText: { fontSize: 16, fontWeight: 'bold' },
  itemSubText: { fontSize: 12, color: '#666' },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },

  removeBtn: { backgroundColor: '#FFEBEE', padding: 5, borderRadius: 4 },
  removeText: { color: '#D32F2F', fontSize: 12, fontWeight: 'bold' },

  addBtn: {
    backgroundColor: '#4AA1B5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addBtnText: { color: 'white', fontWeight: 'bold' },

  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'right',
  },

  submitBtn: {
    backgroundColor: '#083944',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnTablet: {
    paddingVertical: 24,
    borderRadius: 14,
  },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  emptyText: { fontStyle: 'italic', color: '#999' },
});
