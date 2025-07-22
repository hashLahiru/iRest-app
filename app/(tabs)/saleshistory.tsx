import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SalesHistoryScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
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
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.sideMenu}>
          {[
            ['🏠 Home', '/table'],
            ['📝 Task Manager', '/taskmanager'],
            ['➕ Add Product', '/addproduct'],
            ['👨‍🌾 Farmer', '/farmer'],
            ['👤 User', '/user'],
            ['🚪 Logout', '/logout'],
          ].map(([label, route]) => (
            <TouchableOpacity
              key={label}
              onPress={() => {
                setModalVisible(false);
                router.push(route);
              }}
              style={styles.menuItemTouchable}
            >
              <Text style={styles.menuItem}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Scrollable Sales Table */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tableHeader}>
          {['No', 'Date', 'Time', 'Type', 'Status', 'Value'].map((title) => (
            <Text key={title} style={styles.headerCell}>{title}</Text>
          ))}
        </View>

        {Array.from({ length: 15 }).map((_, index) => {
          const status = ['Done', 'Inv', 'Pend'][index % 3];
          const statusStyles = {
            Done: { backgroundColor: '#7ac142', text: 'Done' },
            Inv: { backgroundColor: '#9e9e9e', text: 'Inv' },
            Pend: { backgroundColor: '#ffa726', text: 'Pend' },
          };

          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>01</Text>
              <Text style={styles.cell}>10.07</Text>
              <Text style={styles.cell}>8.30</Text>
              <Text style={styles.cell}>Dining</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyles[status].backgroundColor }]}>
                <Text style={styles.statusText}>{statusStyles[status].text}</Text>
              </View>
              <Text style={styles.cell}>1500.00</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavButton label="Dining" icon="restaurant" route="/table" />
        <NavButton label="Take Away" icon="cafe" route="/takeaway" />
        <NavButton label="Delivery" icon="car" route="/delivery" />
        <NavButton label="Quick" icon="menu" route="/quick" />
      </View>
    </View>
  );
}

const NavButton = ({ label, icon, route, active = false }) => (
  <TouchableOpacity
    style={styles.navItemContainer}
    onPress={() => router.push(route)}
  >
    <Ionicons name={icon} size={24} color={active ? '#f57c00' : '#ccc'} />
    <Text style={[styles.navText, active && { color: '#f57c00' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1c',
    right: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 5,
  },
  menuItemTouchable: {
    paddingVertical: 12,
  },
  menuItem: {
    fontSize: 18,
    color: '#333',
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0dfdd',
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 6,
  },
  headerCell: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 6,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'center',
    width: 60,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItemContainer: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
});
