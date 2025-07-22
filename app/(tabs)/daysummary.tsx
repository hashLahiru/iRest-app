import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DaySummaryScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
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
      
            {/* Footer */}
            <View style={styles.menuFooter}>
              <Text style={styles.logoText}>
                <Text style={styles.logoOrange}>i</Text>POS
              </Text>
              <Text style={styles.footerText}>Powered by introps IT</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Total Sale</Text>
          <Text style={styles.cardAmount}>158,000.00</Text>
        </View>

        <View style={styles.salesList}>
          {[
            { label: 'Dine In', count: '100', amount: '80,500.00' },
            { label: 'Take Away', count: '50', amount: '39,500.00' },
            { label: 'Delivery', count: '20', amount: '38,000.00' },
          ].map(({ label, count, amount }) => (
            <View key={label} style={styles.salesRow}>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
              <Text style={styles.labelText}>{label}</Text>
              <Text style={styles.amountText}>{amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Opening</Text>
          <Text style={styles.summaryAmount}>8,500.00</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>In hand</Text>
          <Text style={styles.summaryAmount}>158,500.00</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Cash</Text>
          <Text style={styles.amountText}>188,500.00</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Card</Text>
          <Text style={styles.amountText}>88,500.00</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Discount</Text>
          <Text style={styles.amountText}>5,500.00</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={[styles.btnText, { color: '#fff' }]}>Save</Text>
          </TouchableOpacity>
        </View>
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
  container: { flex: 1, backgroundColor: '#f6f4f2' },

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
logoOrange: {
        color: '#f57c00',
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

  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  summaryCard: {
    backgroundColor: '#2f1e0f',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
  },
  cardAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 5,
  },
  salesList: {
    marginBottom: 20,
  },
  salesRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  countBadge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f57c00',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 10,
  },
  countText: {
    color: '#f57c00',
    fontWeight: '600',
  },
  labelText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  summaryRow: {
    backgroundColor: '#2f1e0f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 16,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    backgroundColor: '#f1f1f1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#aaa',
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#f57c00',
    padding: 14,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
