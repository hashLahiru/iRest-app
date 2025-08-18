import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

type QuickMenuModalProps = {
  visible: boolean;
  onClose: () => void;
};

const menuItems = [
  ['Day Summary', 'calendar', '/daysummary'],
  ['Sales History', 'receipt', '/saleshistory'],
  ['Cash Drawer', 'cash', '/cashdrawer'],
  ['Back Office', 'business', '/backoffice'],
  ['Settings', 'settings', '/settings'],
  ['Menu', 'restaurant', '/menu'],
];

const QuickMenuModal = ({ visible, onClose }: QuickMenuModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.quickMenuModal}>
        {menuItems.map(([label, icon, route]) => (
          <TouchableOpacity
            key={label}
            style={styles.menuIconBox}
            onPress={() => {
              onClose();
              router.push(route);
            }}
          >
            <Ionicons name={icon as any} size={28} color="#f57c00" />
            <Text style={styles.menuLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

export default QuickMenuModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  quickMenuModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 40,
  },
  menuIconBox: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
});
