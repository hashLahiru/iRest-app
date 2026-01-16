import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliveryScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/table')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Orders</Text>
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

      {/* Rider Image + Buttons */}
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/rider.png')}
          style={styles.riderImage}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/deliverydetails')}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#999' }]}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <NavButton label="Dining" icon="restaurant" route="/table" />
        <NavButton label="Take Away" icon="cafe" route="/takeaway" />
        <NavButton label="Delivery" icon="car" route="/delivery" active />
        <NavButton label="Quick" icon="menu" route="/customproduct" />
      </View>
    </SafeAreaView>

  );
}

// Bottom Navigation Button
const NavButton = ({ label, icon, route, active = false }) => (
  <TouchableOpacity
    style={styles.navItemContainer}
    onPress={() => router.push(route)}
  >
    <Ionicons name={icon} size={24} color={active ? '#f57c00' : '#ccc'} />
    <Text style={[styles.navText, active && { color: '#f57c00' }]}>{label}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f2',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1c',
    right: 50,
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

  logoOrange: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'ff6600',
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  riderImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 100,
  },
  actionButton: {
    backgroundColor: '#f57c00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
    fontWeight: '500',
  },
});
