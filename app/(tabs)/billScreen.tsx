import { Ionicons } from '@expo/vector-icons';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillScreen() {
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const params = useGlobalSearchParams();

  console.log(params.cartItems);

  const parsedCartItems = params.cartItems
    ? JSON.parse(decodeURIComponent(params.cartItems))
    : [];

  const initialItems = parsedCartItems.map((item) => ({
    id: item.id,
    name: `${item.name} (${item.variation})`,
    qty: item.quantity,
    rate: item.price
  }));

  const [items, setItems] = useState(initialItems);


  const updateQty = (index, delta) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const total = items.reduce((sum, item) => sum + item.qty * item.rate, 0);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header (Remains Fixed) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/mainbilling')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Main Billing</Text>
        <Ionicons name="menu" size={24} color="#000" />
      </View>

      {/* Table container (NEW container for item list) */}
      <View style={styles.itemsContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
          <Text style={[styles.tableHeaderQty, { flex: 1 }]}>Qty</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rate</Text>
          <Text style={[styles.tableHeaderTotal, { flex: 1 }]}>Total</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{(index + 1).toString().padStart(2, '0')} . {item.name}</Text>
                <Text style={styles.itemCode}>{item.foodItemId}</Text>
              </View>

              <View style={styles.qtyControls}>
                <TouchableOpacity onPress={() => updateQty(index, -1)}>
                  <Ionicons name="remove" size={18} color="#f57c00" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>
                  {item.qty.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity onPress={() => updateQty(index, 1)}>
                  <Ionicons name="add" size={18} color="#f57c00" />
                </TouchableOpacity>
              </View>

              <Text style={styles.rateText}>{item.rate}</Text>
              <Text style={styles.totalText}>{item.qty * item.rate}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Summary box (below white container) */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Total Sale</Text>
          <Text style={styles.amount}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Other Charges</Text>
          <Text style={styles.amount}>00.00</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.grandLabel}>Grand Total</Text>
          <Text style={styles.grandTotal}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.amount}>00.00</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.holdButton}>
            <Text style={styles.holdText}>Hold</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push('/payment')}
          >
            <Text style={styles.payText}>Pay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Tab Navigation */}
      <View style={styles.bottomNav}>
        <NavButton label="Dining" icon="restaurant" route="/table" />
        <NavButton label="Take Away" icon="cafe" route="/takeaway" />
        <NavButton label="Delivery" icon="car" route="/delivery" />
        <NavButton
          label="Quick"
          icon="menu"
          onPress={() => setQuickMenuVisible(true)}
        />
      </View>

      {/* Quick Menu Modal */}
      <Modal
        visible={quickMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuickMenuVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setQuickMenuVisible(false)}
        >
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.quickMenuModal}>
          {[
            ['Day Summary', 'calendar', '/daysummary'],
            ['Sales History', 'receipt', '/saleshistory'],
            ['Cash Drawer', 'cash', '/cashdrawer'],
            ['Back Office', 'business', '/backoffice'],
            ['Settings', 'settings', '/settings'],
            ['Menu', 'restaurant', '/menu'],
          ].map(([label, icon, route]) => (
            <TouchableOpacity
              key={label}
              style={styles.menuIconBox}
              onPress={() => {
                setQuickMenuVisible(false);
                router.push(route);
              }}
            >
              <Ionicons name={icon} size={28} color="#f57c00" />
              <Text style={styles.menuLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Bottom Nav Button
const NavButton = ({ label, icon, route, active = false, onPress }) => (
  <TouchableOpacity
    style={styles.navItemContainer}
    onPress={onPress || (() => router.push(route))}
  >
    <Ionicons name={icon} size={24} color={active ? '#f57c00' : '#ccc'} />
    <Text style={[styles.navText, active && { color: '#f57c00' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingTop: 30, paddingBottom: 16, paddingHorizontal: 20, },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1c1c1c', right: 100, },
  itemsContainer: { backgroundColor: '#fff', borderRadius: 12, paddingBottom: 8, flex: 1, },
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ececec', borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingHorizontal: 15, paddingVertical: 10, },
  tableHeaderText: { fontWeight: '600', fontSize: 13, color: '#1c1c1c', },
  tableHeaderQty: { fontWeight: '600', fontSize: 13, color: '#1c1c1c', right: 15, },
  tableHeaderTotal: { fontWeight: '600', fontSize: 13, left: 15, color: '#1c1c1c', },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomColor: '#eee', borderBottomWidth: 1, },
  itemInfo: { width: '25%' },
  itemName: { fontSize: 13, color: '#222' },
  itemCode: { fontSize: 12, color: '#f57c00' },
  qtyControls: { width: '25%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
  qtyText: { marginHorizontal: 8, fontWeight: '600', color: '#f57c00', },
  rateText: { width: '25%', textAlign: 'center', color: '#333', },
  totalText: { width: '25%', textAlign: 'center', fontWeight: '700', color: '#333', },
  summaryBox: { backgroundColor: '#fff', paddingHorizontal: 30, paddingVertical: 16, },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4, },
  label: { fontSize: 14, color: '#333' },
  amount: { fontSize: 14, color: '#333' },
  grandLabel: { fontSize: 16, fontWeight: '700', color: '#1c1c1c', },
  grandTotal: { fontSize: 16, fontWeight: '700', color: '#1c1c1c', },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, },
  holdButton: { flex: 1, backgroundColor: '#ccc', borderRadius: 8, alignItems: 'center', paddingVertical: 12, marginRight: 10, },
  holdText: { fontWeight: '600', fontSize: 16, color: '#fff' },
  payButton: { flex: 1, backgroundColor: '#f57c00', borderRadius: 8, alignItems: 'center', paddingVertical: 12, },
  payText: { fontWeight: '600', fontSize: 16, color: '#fff' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', },
  navItemContainer: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#888', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.32)', },
  quickMenuModal: { backgroundColor: '#fff', paddingVertical: 20, paddingHorizontal: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', },
  menuIconBox: { width: '30%', alignItems: 'center', marginVertical: 15, },
  menuLabel: { marginTop: 6, fontSize: 13, color: '#333', textAlign: 'center', },
});
