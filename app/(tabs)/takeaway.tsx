import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const TAKEAWAY_DATA = Array.from({ length: 15 }, (_, i) => ({
  id: `${i + 1}`,
  label: `Order #${1000 + i}`,
  status: ['Ready', 'Pending'][i % 2],
  color: ['#f57c00','#999999'][i % 2],
}));

const screenWidth = Dimensions.get('window').width;
const boxSize = screenWidth / 2 - 24;

export default function TakeAwayScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push('/orderdetails')}
      style={[styles.orderBox, { backgroundColor: item.color, width: boxSize }]}
    >
      <Text style={styles.orderLabel}>{item.label}</Text>
      <Text style={styles.orderStatus}>{item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Take Away</Text>
        <Text style={styles.logo}>
          <Text style={styles.logoOrange}>i</Text>POS
        </Text>
      </LinearGradient>

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

      {/* Orders List */}
      <FlatList
        data={TAKEAWAY_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <NavButton label="Dining" icon="restaurant" route="/table" />
        <NavButton label="Take Away" icon="cafe" route="/takeaway" active />
        <NavButton label="Delivery" icon="car" route="/delivery" />
        <NavButton label="Quick" icon="menu" route="/quick" />
      </View>
    </View>
  );
}

const NavButton = ({ label, icon, route, active = false }) => (
  <TouchableOpacity style={styles.navItem} onPress={() => router.push(route)}>
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomRightRadius: 40,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    right: 100,
  },
  logo: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoOrange: {
    color: '#f57c00',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingTop: 15,
    paddingBottom: 100,
  },
  orderBox: {
    borderRadius: 12,
    margin: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  orderStatus: {
    fontSize: 14,
    color: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
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
});
