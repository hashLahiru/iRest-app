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

export default function SalesHistoryScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeMap = {
    table: 'Dine-in',
    taway: 'Taway',
    delivery: 'Delivery',
  };

  const statusStyles = {
    act: { backgroundColor: '#29b6f6', text: 'Act' },
    hold: { backgroundColor: '#ffb300', text: 'Hold' },
    pending: { backgroundColor: '#ffa726', text: 'Pend' },
    inv: { backgroundColor: '#9e9e9e', text: 'Inv' },
    done: { backgroundColor: '#7ac142', text: 'Done' },
  };

  const formatMonthDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatHourMinute = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    return `${hour}:${minute}`;
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: 'get_Sales_list',
          data: { login_token: '7052a96181afc816d280f15197b588cd' },
        }),
      });

      const json = await res.json();
      if (json.status === 'success') {
        setSalesList(json.sale_list);
      } else {
        setSalesList([]);
      }
    } catch (err) {
      console.error('Error fetching sales list:', err);
      setSalesList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/table')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sale History</Text>

        <View style={styles.headerRight}>
          <Text style={styles.logoText}>
            <Text style={{ color: '#f60' }}>i</Text>POS
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="menu" size={24} color="#555" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Side Menu Modal */}
      <SideMenuModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Scrollable Sales Table */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tableHeader}>
          {['No', 'Date', 'Time', 'Type', 'Status', 'Value'].map((title) => (
            <Text key={title} style={styles.headerCell}>{title}</Text>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#f60" style={{ marginTop: 20 }} />
        ) : salesList.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#777' }}>
            No sales found
          </Text>
        ) : (
          salesList.map((sale, index) => {
            const statusData = statusStyles[sale.status] || { backgroundColor: '#ccc', text: sale.status };
            return (
              <View key={sale.order_id} style={styles.tableRow}>
                <Text style={styles.cell}>{sale.order_id}</Text>
                <Text style={styles.cell}>{formatMonthDate(sale.date)}</Text>
                <Text style={styles.cell}>{formatHourMinute(sale.time)}</Text>
                <Text style={styles.cell}>{typeMap[sale.type] || sale.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusData.backgroundColor }]}>
                  <Text style={styles.statusText}>{statusData.text}</Text>
                </View>
                <Text style={styles.cell}>{parseFloat(sale.value).toFixed(2)}</Text>
              </View>
            );
          })

        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 30, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', justifyContent: 'space-between', },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1c1c1c', right: 60 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#222' },
  content: { padding: 16, paddingBottom: 100 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e0dfdd', paddingVertical: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginBottom: 6, },
  headerCell: { flex: 1, fontWeight: '600', fontSize: 14, color: '#333', textAlign: 'center' },
  tableRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, marginBottom: 6, borderRadius: 8, alignItems: 'center', shadowOpacity: 0, elevation: 0, },
  cell: { flex: 1, fontSize: 14, color: '#333', textAlign: 'center' },
  statusBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'center', width: 60 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center', paddingVertical: 2 },
});
