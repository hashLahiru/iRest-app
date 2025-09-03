// components/SideMenuModal.tsx
import { router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SideMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

const SideMenuModal: React.FC<SideMenuModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View style={styles.sideMenu}>
          <Text style={styles.menuTitle}>Menu</Text>

          {[
            ['Profile', '/profile'],
            ['Summary', '/daysummary'],
            ['History', '/saleshistory'],
            ['Logout', '/login'],
          ].map(([label, path]) => (
            <TouchableOpacity key={label} onPress={() => { onClose(); router.push(path); }}>
              <Text style={styles.menuItem}>{label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.menuFooter}>
            <Text style={styles.logoText}>
              <Text style={styles.logoOrange}>i</Text>POS
            </Text>
            <Text style={styles.footerText}>Powered by introps IT</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SideMenuModal;

const styles = StyleSheet.create({
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
  menuItem: {
    fontSize: 16,
    marginVertical: 12,
    color: '#333',
    left: 15,
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
});
