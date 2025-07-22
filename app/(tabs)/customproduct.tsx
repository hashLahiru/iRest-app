import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const CustomProductScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [salesRate, setSalesRate] = useState('');
  const [qty, setQty] = useState('');

  const handleCancel = () => {
    router.back();
  };

  const handleOK = () => {
    console.log({ productName, salesRate, qty });
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/mainbilling')}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Custom Product</Text>
          <View style={styles.headerRight}>
            <Text style={styles.logoText}>
              <Text style={{ color: '#f60' }}>i</Text>POS
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="menu" size={24} color="#555" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Side Menu */}
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
                >
                  <Text style={styles.menuItem}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Form Container */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={styles.label}>Sales Rate (LKR)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter sales rate"
              keyboardType="numeric"
              value={salesRate}
              onChangeText={setSalesRate}
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={qty}
              onChangeText={setQty}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.okBtn} onPress={handleOK}>
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <NavButton label="Dining" icon="restaurant" route="/table" />
          <NavButton label="Take Away" icon="cafe" route="/takeaway" />
          <NavButton label="Delivery" icon="car" route="/delivery" />
          <NavButton label="Quick" icon="menu" route="/quick" />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CustomProductScreen;

// Bottom Nav Button
const NavButton = ({ label, icon, route, active = false }) => (
  <TouchableOpacity style={styles.navItemContainer} onPress={() => router.push(route)}>
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
    paddingHorizontal: 16,
    paddingBottom: 30,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    right: 30,
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
    elevation: 5,
  },
  menuItem: {
    fontSize: 18,
    marginVertical: 12,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 15,
    marginBottom: 0,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 235,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#aaa',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  okBtn: {
    flex: 1,
    backgroundColor: '#f57c00',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  okText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  navItemContainer: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
    fontWeight: '500',
  },
});
