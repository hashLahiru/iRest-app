import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

import NavBar from '@/components/NavButton';
import SideMenuModal from '@/components/SideMenuModal';

const screenWidth = Dimensions.get('window').width;
const boxSize = screenWidth / 2 - 24;

export default function TakeAwayScreen() {
  const [modalVisible, setModalVisible] = useState(false); const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();

      if (params?.isRefresh === 'true') {
        router.setParams({ isRefresh: undefined });
        fetchOrders();
      }
    }, [params?.isRefresh])
  );

  const fetchOrders = async () => {
    const login_token = await AsyncStorage.getItem('login_token');
    try {
      setLoading(true);
      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: "get_take_away_orders",
          data: {
            login_token: login_token
          }
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setOrders(data.data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    if (index === 0) {
      return (
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/mainbillingTakeAway',
            params: { tableId: "-1", orderStatus: "taway_new" },
          })}
          style={[styles.orderBox, { backgroundColor: '#999999', width: boxSize }]}
        >
          <Ionicons name="add" size={32} color="#fff" />
          <Text style={[styles.orderLabel, { color: '#fff' }]}>New Order</Text>
        </TouchableOpacity>
      );
    }

    // Adjust index since we added the New Order card
    const orderItem = orders[index - 1];

    return (
      <TouchableOpacity
        // onPress={() => console.log(orderItem.ts_id)}
        onPress={() => router.push({ pathname: '/payment', params: { orderId: orderItem.ts_id, orderStatus: "taway_hold" } })}
        style={[styles.orderBox, { backgroundColor: '#f57c00', width: boxSize }]}
      >
        <Text style={styles.orderLabel}>Order#{orderItem.ts_id}</Text>
        <Text style={styles.orderValue}>${parseFloat(orderItem.otot).toFixed(2)}</Text>
        <Text style={styles.orderStatus}>Hold</Text>
      </TouchableOpacity>
    );
  };

  // Add New Order card as first item
  const data = [{ id: 'new-order' }, ...orders];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#f57c00" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1c1c1c', '#d76400']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Take Away</Text>
        <Text style={styles.logo}>
          <Text style={styles.logoOrange}>i</Text>POS
        </Text>
      </LinearGradient>

      {/* Side Menu Modal */}
      <SideMenuModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Orders List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.ts_id ? `order-${item.ts_id}` : `new-${index}`}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchOrders}
      />

      <NavBar activeRoute="Take Away" onQuickMenuPress={() => setQuickMenuVisible(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f2',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomRightRadius: 40,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    right: 100,
  },
  logo: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoOrange: {
    color: '#f57c00',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 100,
  },
  orderBox: {
    borderRadius: 12,
    margin: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  orderStatus: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sideMenu: {
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#666666',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuItem: {
    fontSize: 16,
    marginVertical: 12,
    color: '#333',
    left: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f57c00',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
