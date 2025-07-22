import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const boxWidth = screenWidth / numColumns - 24;

const items = Array.from({ length: 10 }, (_, i) => ({
  id: `0${12 + i}`,
  name: 'Schezwan Egg Noodles',
  price: 1200,
  image: require('../../assets/images/noodles.png'),
}));

const filters = ['All', 'Favourite', 'Custom'];

export default function MainBilling() {
  const [quantities, setQuantities] = useState(items.map(() => 1));
  const [selectedTab, setSelectedTab] = useState('All');

  const increment = (index: number) => {
    const newQty = [...quantities];
    newQty[index]++;
    setQuantities(newQty);
  };

  const decrement = (index: number) => {
    const newQty = [...quantities];
    if (newQty[index] > 1) {
      newQty[index]--;
      setQuantities(newQty);
    }
  };

  const total = items.reduce((sum, item, idx) => sum + item.price * quantities[idx], 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.push('/steward')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Main Billing</Text>
        <View style={styles.headerRight}>
          <Text style={styles.logoText}><Text style={{ color: '#f60' }}>i</Text>POS</Text>
          <Ionicons name="menu" size={24} color="#555" style={{ marginLeft: 10 }} />
        </View>
        
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {filters.map(tab => (
  <TouchableOpacity
    key={tab}
    style={[styles.tabButton, selectedTab === tab && styles.tabActive]}
    onPress={() => {
      setSelectedTab(tab);
      if (tab === 'Custom') {
        router.push('/customproduct');
      }
    }}
  >
    <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
      {tab}
    </Text>
  </TouchableOpacity>
))}

      </View>

      {/* Product Grid */}
      <FlatList
  data={items}
  numColumns={2}
  keyExtractor={(_, i) => i.toString()}
  contentContainerStyle={{ paddingHorizontal: 12 }}
  renderItem={({ item, index }) => (
    <View style={[styles.card, { width: boxWidth }]}>
            <Text style={styles.itemCode}>{item.id}</Text>
            <View style={styles.cardRow}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.infoSection}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price} LKR</Text>
              </View>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => decrement(index)}>
                <Text style={styles.qtyIcon}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantities[index]}</Text>
              <TouchableOpacity style={styles.qtyButtonOrange} onPress={() => increment(index)}>
                <Text style={styles.qtyIconWhite}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Total Section */}
      <View style={styles.totalBar}>
  <Text style={styles.totalLabel}>Total</Text>
  <Text style={styles.totalAmount}>{total.toFixed(2)} LKR</Text>
</View>
<TouchableOpacity style={styles.totalBar} onPress={() => router.push('/billScreen')}>
  <Text style={styles.totalLabel}>Total</Text>
  <Text style={styles.totalAmount}>{total.toFixed(2)} LKR</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#222', right: 70 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#222' },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#e2dfdd',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#f57c00',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  grid: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },

  card: {
  backgroundColor: '#fff',
  borderRadius: 12,
  marginBottom: 7,
  marginHorizontal: 5, // horizontal gap between cards
  padding: 10,
  },
  itemCode: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#f57c00',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 12,
    borderRadius: 4,
    zIndex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 10,
    marginTop: 20,
  },
  infoSection: {
    flex: 1,
    paddingTop: 20,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemPrice: {
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#f6f4f2',
    borderRadius:20,
  },
  qtyButton: {
    backgroundColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 30,
  },
  qtyButtonOrange: {
    backgroundColor: '#f57c00',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 30,
  },
  qtyIcon: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  qtyIconWhite: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 8,
    fontWeight: '600',
  },

  totalBar: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
