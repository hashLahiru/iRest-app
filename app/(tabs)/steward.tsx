import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import NavBar from '@/components/NavButton';
import QuickMenuModal from '@/components/QuickMenuModal';
import SideMenuModal from '@/components/SideMenuModal';

const StewardScreen = () => {
  // const navigation = useNavigation();
  const params = useGlobalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const [stewards, setStewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableId, setTableId] = useState('');


  useEffect(() => {
    if (params?.tableId) {
      const id = params.tableId.toString();
      setTableId(id);
    }
    fetchStewards();
  }, [params?.tableId]);


  const fetchStewards = async () => {
    const login_token = await AsyncStorage.getItem("login_token")
    try {
      setLoading(true);
      const response = await fetch('https://raiza.digieclipse.com/App_apiv2/app_api', {
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
    console.log("Selected Steward:", steward);
    router.push({
      pathname: '/mainbillingdinein',
      params: {
        stewardId: steward.id,
        tableId: tableId,
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

      <SideMenuModal visible={modalVisible} onClose={() => setModalVisible(false)} />

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

      <NavBar activeRoute="Dining" onQuickMenuPress={() => setQuickMenuVisible(true)} />
      <QuickMenuModal visible={quickMenuVisible} onClose={() => setQuickMenuVisible(false)} />

    </SafeAreaView>
  );
};

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
