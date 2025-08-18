import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import SideMenuModal from '@/components/SideMenuModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DaySummaryScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchDaySummary();
  }, []);

  const fetchDaySummary = async () => {
    const login_token = await AsyncStorage.getItem('login_token');
    try {
      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: 'get_day_summary',
          data: {
            login_token: login_token
          }
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSummary(data.response);
      }
    } catch (error) {
      console.error('Error fetching day summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number | string) => {
    const numberValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numberValue)) return '0.00';
    return numberValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const salesModeMap: Record<string, string> = {
    table: 'Dine In',
    taway: 'Take Away',
    delivery: 'Delivery'
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#f57c00" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>No data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/table')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day Summary</Text>
        <View style={styles.headerRight}>
          <Text style={styles.logoText}>
            <Text style={{ color: '#f60' }}>i</Text>POS
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons
              name="menu"
              size={24}
              color="#555"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu Modal */}
      <SideMenuModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Total Sale</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.cardAmount}>{formatCurrency(summary.total_sale)} </Text>
            <Text style={styles.cardAmountPending}>({formatCurrency(summary.pending_sale)})</Text>
          </View>
        </View>

        <View style={styles.salesList}>
          {summary.sales_by_type.map((item: any) => (
            <View key={item.smode} style={styles.salesRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.total_orders}</Text>
              </View>
              <Text style={styles.labelText}>{salesModeMap[item.smode] || item.smode}</Text>
              <Text style={styles.amountTextPending}>
                ({formatCurrency(item.pending_amount)}){' '}
              </Text>
              <Text style={styles.amountText}>{formatCurrency(item.total_amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Opening</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(summary.opening_balance)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>In hand</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(summary.in_hand_value)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Cash</Text>
          <Text style={styles.amountText}>{formatCurrency(summary.total_cash)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Card</Text>
          <Text style={styles.amountText}>{formatCurrency(summary.total_card)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Discount</Text>
          <Text style={styles.amountText}>{formatCurrency(summary.total_discount)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 30, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', justifyContent: 'space-between', },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1c1c1c', right: 60, },
  headerRight: { flexDirection: 'row', alignItems: 'center', },
  logoText: { fontSize: 20, fontWeight: '700', color: '#222', },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row', },
  sideMenu: { width: 250, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20, borderBottomRightRadius: 15, borderTopRightRadius: 15, elevation: 5, },
  menuTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#666666', },
  menuFooter: { position: 'absolute', bottom: 30, right: 20, alignItems: 'flex-end', },
  logoOrange: { color: '#f57c00', },
  footerText: { fontSize: 12, color: '#666', marginTop: 4, },
  menuItem: { fontSize: 16, marginVertical: 12, color: '#333', left: 15, },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', },
  content: { paddingHorizontal: 16, paddingVertical: 20, },
  summaryCard: { backgroundColor: '#2f1e0f', borderRadius: 10, padding: 20, marginBottom: 20, },
  cardTitle: { color: '#fff', fontSize: 16, },
  cardAmount: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 5, },
  cardAmountPending: { color: '#fff', fontSize: 16, fontWeight: '500', marginTop: 5, marginLeft: 4, },
  salesList: { marginBottom: 20, },
  salesRow: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, },
  countBadge: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#f57c00', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginRight: 10, },
  countText: { color: '#f57c00', fontWeight: '600', },
  labelText: { flex: 1, fontSize: 16, color: '#333', },
  amountText: { fontSize: 16, fontWeight: '700', color: '#f57c00', },
  amountTextPending: { fontSize: 12, fontWeight: '400', color: '#444', },
  summaryRow: { backgroundColor: '#2f1e0f', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 10, },
  summaryLabel: { color: '#fff', fontSize: 16, },
  summaryAmount: { color: '#fff', fontSize: 16, fontWeight: '700', },
  infoRow: { backgroundColor: '#f1f1f1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 10, },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, },
  cancelBtn: { flex: 1, backgroundColor: '#aaa', padding: 14, borderRadius: 10, marginRight: 10, alignItems: 'center', },
  saveBtn: { flex: 1, backgroundColor: '#f57c00', padding: 14, borderRadius: 10, marginLeft: 10, alignItems: 'center', },
  btnText: { fontSize: 16, fontWeight: '600', },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', },
  navItemContainer: { alignItems: 'center', },
  navText: { fontSize: 12, color: '#ccc', marginTop: 4, },
});
