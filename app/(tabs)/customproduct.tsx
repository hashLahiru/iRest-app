import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NavBar from '@/components/NavButton';
import SideMenuModal from '@/components/SideMenuModal';

const CustomProductScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
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
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#1c1c1c', '#d76400']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery</Text>
          <Text style={styles.logo}>
            <Text style={styles.logoOrange}>i</Text>POS
          </Text>
        </LinearGradient>

        {/* Side Menu */}
        <SideMenuModal visible={modalVisible} onClose={() => setModalVisible(false)} />

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
        <NavBar activeRoute="Quick" onQuickMenuPress={() => setQuickMenuVisible(true)} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default CustomProductScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2', },
  header: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomRightRadius: 40, },
  headerTitle: { fontSize: 18, color: '#fff', fontWeight: '500', right: 100, },
  logo: { fontSize: 20, color: '#fff', fontWeight: 'bold', },
  logoOrange: { color: '#f57c00', },
  headerRight: { flexDirection: 'row', alignItems: 'center', },
  logoText: { fontSize: 20, fontWeight: '700', color: '#222', },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'row', },
  sideMenu: { width: 250, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20, elevation: 5, },
  menuItem: { fontSize: 18, marginVertical: 12, color: '#333', },
  scrollContent: { paddingBottom: 100, },
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, margin: 15, marginBottom: 0, elevation: 3, },
  label: { fontSize: 14, marginBottom: 6, color: '#333', fontWeight: '500', },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, fontSize: 14, borderWidth: 1, borderColor: '#ddd', },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 235, gap: 10, },
  cancelBtn: { flex: 1, backgroundColor: '#aaa', borderRadius: 8, alignItems: 'center', paddingVertical: 14, },
  okBtn: { flex: 1, backgroundColor: '#f57c00', borderRadius: 8, alignItems: 'center', paddingVertical: 14, },
  cancelText: { color: '#fff', fontWeight: '600', fontSize: 16, },
  okText: { color: '#fff', fontWeight: '600', fontSize: 16, },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#ccc', paddingVertical: 10, },
  navItemContainer: { alignItems: 'center', },
  navText: { fontSize: 12, color: '#ccc', marginTop: 4, fontWeight: '500', },
});
