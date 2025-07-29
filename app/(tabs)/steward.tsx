import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const StewardScreen = () => {
  // const navigation = useNavigation();
  const params = useGlobalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [stewards, setStewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableId, setTableId] = useState('');


  useEffect(() => {
    // Get tableId from route params
    if (params?.tableId) {
      // Ensure tableId is properly formatted with 'T' prefix
      const id = params.tableId.toString();
      setTableId(id.startsWith('T') ? id : `T${id}`);
    }
    fetchStewards();
  }, [params?.tableId]);


  const fetchStewards = async () => {
    const login_token = await AsyncStorage.getItem("login_token")
    try {
      setLoading(true);
      const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "function": "get_available_stewards",
          "data": {
            "login_token": login_token,
          }
        })
      });

      const data = await response.json();
      if (data.status === "success") {
        // Transform the data to match our UI needs
        const transformedStewards = data.stewards.map(steward => ({
          id: steward.user_id,
          name: steward.full_name,
          count: steward.user_id
        }));
        setStewards(transformedStewards);
      } else {
        console.error("Failed to fetch stewards");
      }
    } catch (error) {
      console.error("Error fetching stewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (steward) => {
    router.push({
      pathname: '/mainbilling',
      params: {
        stewardId: steward.id,
        tableId: tableId
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#f57c00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/table')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Steward</Text>
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

      {/* Table No */}
      {tableId && (
        <View style={styles.tableContainer}>
          <Text style={styles.tableText}>{tableId}</Text>
        </View>
      )}

      {/* Steward List */}
      <FlatList
        data={stewards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <Image
              source={require('../../assets/images/user-icon.png')}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <Text style={styles.count}>{item.count}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stewards available</Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavButton label="Dining" icon="restaurant" route="/table" active />
        <NavButton label="Take Away" icon="cafe" route="/takeaway" />
        <NavButton label="Delivery" icon="car" route="/delivery" />
        <NavButton label="Quick" icon="menu" route="/quick" />
      </View>
    </SafeAreaView>
  );
};

// NavButton for Bottom Navigation
const NavButton = ({ label, icon, route, active = false }) => (
  <TouchableOpacity style={styles.navItemContainer} onPress={() => router.push(route)}>
    <Ionicons name={icon} size={24} color={active ? '#f57c00' : '#ccc'} />
    <Text style={[styles.navText, active && { color: '#f57c00' }]}>{label}</Text>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f1ef',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
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
  tableContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignSelf: 'flex-end',
    marginRight: 16,
    paddingHorizontal: 30,
    paddingVertical: 8,
    marginBottom: 10,
  },
  tableText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: '#333',
  },
  id: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
  },
  count: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
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
  // Side menu
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
});

export default StewardScreen;
