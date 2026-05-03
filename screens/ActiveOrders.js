import React, {useState} from 'react';
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

import BeanSceneLogo from './images/BeanSceneLogo.jpg';

// --- MOCK DATA: ACTIVE ORDERS ---
const MOCK_ACTIVE_ORDERS = [
  {
    id: 'ORD-101',
    table: 'T12',
    timestamp: '10:15 AM',
    person: 'Yingyi',
    items: ['Garlic Bread', 'Spaghetti'],
    status: 'In-Progress',
  },
  {
    id: 'ORD-102',
    table: 'T05',
    timestamp: '10:20 AM',
    person: 'Rui Chen',
    items: ['Cheesecake', 'Coke'],
    status: 'Completed',
  },
  {
    id: 'ORD-103',
    table: 'T08',
    timestamp: '10:25 AM',
    person: 'Yingyi',
    items: ['Grilled Steak'],
    status: 'In-Progress',
  },
];

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

export default function ActiveOrdersScreen({ isOnline = true, onBack }) {
  const username = 'Yingyi';
  const role = 'staff';

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // --- FILTERING LOGIC ---
  const filteredOrders = MOCK_ACTIVE_ORDERS.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // --- ADD PLACEHOLDER FOR TABLET GRID ---
  const ordersForDisplay = [...filteredOrders];
  if (isTablet && ordersForDisplay.length % 2 !== 0) {
    ordersForDisplay.push({ id: 'placeholder', isPlaceholder: true });
  }

  const handleUpdateToServed = (orderId) => {
    Alert.alert('Order Updated', 'Order has been marked as Served!');
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

        {/* TABLET WRAPPER FOR MAX WIDTH */}
        <View style={isTablet && styles.tabletListWrapper}>
          <FlatList
            key={isTablet ? 'tablet' : 'mobile'}
            data={ordersForDisplay}
            numColumns={isTablet ? 2 : 1}
            columnWrapperStyle={isTablet ? { gap: 20 } : null}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.isPlaceholder) {
                return <View style={styles.placeholderCard} />;
              }

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
                      <Text key={index} style={styles.itemText}>• {orderItem}</Text>
                    ))}
                  </View>

                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status === 'Completed'
                              ? COLORS.beanLightBlue
                              : COLORS.beanMidBlue,
                        },
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>{item.status}</Text>
                    </View>

                    {item.status === 'Completed' && (
                      <TouchableOpacity
                        style={styles.serveBtn}
                        onPress={() => handleUpdateToServed(item.id)}
                      >
                        <Text style={styles.serveBtnText}>Mark Served</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
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
  mainContentTablet: { paddingHorizontal: 40 },

  screenTitle: { fontSize: 26, fontWeight: 'bold', color: '#083944', marginBottom: 15 },

  searchContainer: { marginBottom: 15 },
  searchContainerTablet: { marginBottom: 25 },

  searchBar: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchBarTablet: {
    padding: 16,
    fontSize: 18,
  },

  errorBox: {
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    marginBottom: 15,
  },
  errorText: { color: '#D32F2F', fontWeight: 'bold' },

  tabletListWrapper: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },

  placeholderCard: {
    width: '48%',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },

  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  orderCardTablet: {
    width: '48%',
  },

  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderIdText: { fontSize: 18, fontWeight: 'bold', color: '#083944' },
  orderTimeText: { fontSize: 12, color: '#666' },

  orderBody: { marginBottom: 10 },
  tableText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  personText: { fontSize: 14, color: '#666' },

  itemsContainer: { marginBottom: 10 },
  itemText: { fontSize: 14, color: '#555' },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },

  serveBtn: {
    backgroundColor: '#083944',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  serveBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  backButton: { marginTop: 20, padding: 10, alignItems: 'center' },
  backButtonText: { color: '#083944', fontWeight: 'bold', fontSize: 16 },
});
