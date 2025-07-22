import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/table')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity onPress={() => setQuickMenuVisible(true)}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <ScrollView contentContainerStyle={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/images/avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>Sunera Introps</Text>
          <Text style={styles.email}>sunera@example.com</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>Admin</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Branch</Text>
          <Text style={styles.infoValue}>Kandy</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}> 
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
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
        <TouchableWithoutFeedback onPress={() => setQuickMenuVisible(false)}>
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
    </View>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1c',
    right: 100,
  },
  profileContent: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#f57c00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  navItemContainer: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#888', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  quickMenuModal: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  menuIconBox: {
    width: '30%',
    alignItems: 'center',
    marginVertical: 15,
  },
  menuLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
});
