import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const boxSize = screenWidth / 2 - 24;

export default function DeliveryOrdersScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    // Simulating API call with dummy data
    setTimeout(() => {
      const dummyOrders = [
        { id: 'd101', amount: 28.5 },
        { id: 'd102', amount: 15.2 },
        { id: 'd103', amount: 42.0 },
      ];
      setOrders(dummyOrders);
      setLoading(false);
    }, 1000);
  };

  const renderItem = ({ item, index }) => {
    if (index === 0) {
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/mainbilling',
              params: {
                tableId: '-2',
                isDelivery: 'true',
                isDeliverySaved: 'false',
              },
            })
          }
          style={[styles.orderBox, { backgroundColor: '#999999', width: boxSize }]}
        >
          <Ionicons name="add" size={32} color="#fff" />
          <Text style={[styles.orderLabel, { color: '#fff' }]}>New Delivery</Text>
        </TouchableOpacity>
      );
    }

    const order = orders[index - 1];

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/payment',
            params: {
              orderId: order.id,
              isDelivery: 'true',
              isDeliverySaved: 'true',
            },
          })
        }
        style={[styles.orderBox, { backgroundColor: '#007aff', width: boxSize }]}
      >
        <Text style={styles.orderLabel}>Order#{order.id}</Text>
        <Text style={styles.orderValue}>${order.amount.toFixed(2)}</Text>
        <Text style={styles.orderStatus}>Pending</Text>
      </TouchableOpacity>
    );
  };

  const data = [{ id: 'new' }, ...orders];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007aff" />
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
      <LinearGradient
        colors={['#1c1c1c', '#007aff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Orders</Text>
        <Text style={styles.logo}>
          <Text style={styles.logoOrange}>i</Text>POS
        </Text>
      </LinearGradient>

      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.sideMenu}>
            <Text style={styles.menuTitle}>Menu</Text>

            <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/profile'); }}>
              <Text style={styles.menuItem}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/summary'); }}>
              <Text style={styles.menuItem}>Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/history'); }}>
              <Text style={styles.menuItem}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/backoffice'); }}>
              <Text style={styles.menuItem}>Back Office</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/settings'); }}>
              <Text style={styles.menuItem}>Setting</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/login'); }}>
              <Text style={styles.menuItem}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.menuFooter}>
              <Text style={styles.logoText}>
                <Text style={styles.logoOrange}>i</Text>POS
              </Text>
              <Text style={styles.footerText}>Powered by introps IT</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id ? `order-${item.id}` : `new-${index}`}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchOrders}
      />

      <View style={styles.bottomNav}>
        <NavButton label="Dining" icon="restaurant" route="/table" />
        <NavButton label="Take Away" icon="cafe" route="/takeaway" />
        <NavButton label="Delivery" icon="car" route="/deliveryOrders" active />
        <NavButton label="Quick" icon="menu" route="/customproduct" />
      </View>
    </SafeAreaView>
  );
}

const NavButton = ({ label, icon, route, active = false }) => (
  <TouchableOpacity style={styles.navItem} onPress={() => router.push(route)}>
    <Ionicons name={icon} size={24} color={active ? '#007aff' : '#ccc'} />
    <Text style={[styles.navText, active && { color: '#007aff' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomRightRadius: 40,
  },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '500', right: 100 },
  logo: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  logoOrange: { color: '#007aff' },
  gridContainer: { paddingHorizontal: 10, paddingTop: 15, paddingBottom: 100 },
  orderBox: {
    borderRadius: 12,
    margin: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  orderLabel: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  orderValue: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  orderStatus: { fontSize: 14, color: '#fff', fontWeight: '500' },
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
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#888', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row' },
  sideMenu: {
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
  },
  menuTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#666666' },
  menuFooter: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
  },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1c1c1c' },
  footerText: { fontSize: 12, color: '#666', marginTop: 4 },
  menuItem: { fontSize: 16, marginVertical: 12, color: '#333', left: 15 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  errorContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', marginBottom: 20, textAlign: 'center' },
  retryButton: { backgroundColor: '#007aff', padding: 10, borderRadius: 5 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
});
