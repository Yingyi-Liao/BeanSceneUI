import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  Alert,
  StatusBar,
  useWindowDimensions,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';
import BeanSceneLogo from '../images/BeanSceneLogo.jpg';
import { API_BASE } from '../constants/apibase';
import { COLORS } from '../constants/colors';

export default function ActiveOrdersScreen({ route, navigation }) {
  const { isOnline = true, username, role } = route.params || {};

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // --- LOAD JWT TOKEN ---
  const loadToken = async () => {
    const token = await SecureStore.getItemAsync('jwt');
    if (!token) {
      Alert.alert('Session Expired', 'Please log in again.');
      navigation.replace('LoginScreen');
      return null;
    }
    return token;
  };

  // --- FETCH ALL ORDERS ---
  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const token = await loadToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/order`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to load orders');
        return;
      }

      const normalized = (data.data || []).map((o) => ({
        ...o,
        status: o.status ? o.status.toLowerCase() : 'pending',
        table: o.tableNumber,
        person: o.createdBy,
        timestamp: o.createdAt?.seconds
          ? new Date(o.createdAt.seconds * 1000).toLocaleTimeString()
          : '',
        items: o.items,
      }));

      // Active = pending + in-progress + completed
      const activeOrders = normalized.filter(
        (o) =>
          o.status === 'pending' ||
          o.status === 'in-progress' ||
          o.status === 'completed'
      );

      setOrders(activeOrders);
    } catch (err) {
      setErrorMessage('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwt');
    navigation.replace('Login');
  };

  // --- SEARCH FILTER ---
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.table.toLowerCase().includes(q) ||
      order.items.map((i) => i.itemName).join(' ').toLowerCase().includes(q)
    );
  });

  // --- TABLET GRID PLACEHOLDER ---
  const ordersForDisplay = [...filteredOrders];
  if (isTablet && ordersForDisplay.length % 2 !== 0) {
    ordersForDisplay.push({ id: 'placeholder', isPlaceholder: true });
  }

  // --- MARK SERVED ---
  const handleUpdateToServed = async (orderId) => {
    try {
      const token = await loadToken();
      if (!token) return;

      const response = await fetch(
        `${API_BASE}/api/order/update/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'served' }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Failed to update order');
        return;
      }

      Alert.alert('Success', `Order ${orderId} marked as Served`);
      fetchActiveOrders();
    } catch (err) {
      Alert.alert('Network Error', err.message);
    }
  };

  // --- CANCEL ORDER ---
  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await loadToken();
              if (!token) return;

              const response = await fetch(
                `${API_BASE}/api/order/update/${orderId}`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ status: 'cancelled' }),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                Alert.alert('Error', data.error || 'Failed to cancel order');
                return;
              }

              Alert.alert('Cancelled', `Order ${orderId} has been cancelled.`);
              fetchActiveOrders();
            } catch (err) {
              Alert.alert('Network Error', err.message);
            }
          },
        },
      ]
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
            <Text style={styles.userRoleText}>{role?.toUpperCase()}</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
            <Text style={styles.logoutTextSmall}>Log Off</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT */}
      <View style={[styles.mainContent, isTablet && styles.mainContentTablet]}>
        <Text style={styles.screenTitle}>Active Orders</Text>

        {/* SEARCH BAR */}
        <View style={[styles.searchContainer, isTablet && styles.searchContainerTablet]}>
          <TextInput
            style={[styles.searchBar, isTablet && styles.searchBarTablet]}
            placeholder="Search by Table or Order ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ERROR BOX */}
        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* LOADING */}
        {loading && (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading orders...</Text>
        )}

        {/* ORDER LIST */}
        {!loading && (
          <View style={isTablet && styles.tabletListWrapper}>
            <FlatList
              key={isTablet ? 'tablet' : 'mobile'}
              data={ordersForDisplay}
              numColumns={isTablet ? 2 : 1}
              columnWrapperStyle={isTablet ? { gap: 20 } : null}
              contentContainerStyle={{ paddingBottom: 40 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                if (item.isPlaceholder) return <View style={styles.placeholderCard} />;

                return (
                  <View style={[styles.orderCard, isTablet && styles.orderCardTablet]}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderIdText}>{item.id}</Text>
                      <Text style={styles.orderTimeText}>{item.timestamp}</Text>
                    </View>

                    <View style={styles.orderBody}>
                      <Text style={styles.tableText}>Table: {item.table}</Text>
                      <Text style={styles.personText}>By: {item.person}</Text>
                    </View>

                    <View style={styles.itemsContainer}>
                      {item.items.map((orderItem, index) => (
                        <Text key={index} style={styles.itemText}>
                          • {orderItem.itemName} x{orderItem.qty} — ${orderItem.price}
                        </Text>
                      ))}
                    </View>

                    <Text style={styles.totalText}>Total: ${item.total}</Text>

                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              item.status === 'completed'
                                ? COLORS.beanLightBlue
                                : COLORS.beanMidBlue,
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>

                      {item.status === 'completed' && (
                        <TouchableOpacity
                          style={styles.serveBtn}
                          onPress={() => handleUpdateToServed(item.id)}
                        >
                          <Text style={styles.serveBtnText}>Mark Served</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancelOrder(item.id)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
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
  headerContainerTablet: { paddingHorizontal: 40, paddingVertical: 25 },

  logo: { width: 120, height: 50 },

  userProfile: { flexDirection: 'row', alignItems: 'center' },
  userProfileTablet: { gap: 20 },

  logoutBtnSmall: {
    backgroundColor: COLORS.errorBg,
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
  },
  logoutTextSmall: { fontSize: 12, color: COLORS.errorRed, fontWeight: 'bold' },

  mainContent: { flex: 1, padding: 20 },
  mainContentTablet: { paddingHorizontal: 40 },

  screenTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.beanDarkBlue, marginBottom: 15 },

  searchContainer: { marginBottom: 15 },
  searchContainerTablet: { marginBottom: 25 },

  searchBar: {
    backgroundColor: COLORS.searchBg,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
  },
  searchBarTablet: { padding: 16, fontSize: 18 },

  errorBox: {
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    marginBottom: 15,
  },
  errorText: { color: COLORS.errorRed, fontWeight: 'bold' },

  tabletListWrapper: { width: '100%', maxWidth: 900, alignSelf: 'center' },

  placeholderCard: { width: '48%', marginBottom: 20, backgroundColor: 'transparent' },

  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  orderCardTablet: { width: '48%' },

  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderIdText: { fontSize: 18, fontWeight: 'bold', color: COLORS.beanDarkBlue },
  orderTimeText: { fontSize: 12, color: COLORS.textMuted },

  orderBody: { marginBottom: 10 },
  tableText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  personText: { fontSize: 14, color: COLORS.textMuted },

  itemsContainer: { marginBottom: 10 },
  itemText: { fontSize: 14, color: COLORS.textMid },

  totalText: { marginTop: 6, fontSize: 16, fontWeight: 'bold', color: COLORS.beanDarkBlue },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 10,
  },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },

  serveBtn: {
    backgroundColor: COLORS.beanDarkBlue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  serveBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

  cancelBtn: {
    backgroundColor: COLORS.errorRed,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

  backButton: { marginTop: 20, padding: 10, alignItems: 'center' },
  backButtonText: { color: COLORS.beanDarkBlue, fontWeight: 'bold', fontSize: 16 },
});
