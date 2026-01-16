import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useGlobalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const boxWidth = screenWidth / numColumns - 24;

// Types for API response
interface Variation {
  size: string;
  price: number;
  ris_id: string;
}

interface FoodItem {
  id: string;
  name: string;
  category_id: string;
  super_category_id: string;
  image: string;
  variations: Variation[];
}

interface Category {
  id: string;
  name: string;
}

interface FoodListResponse {
  status: string;
  food_list: {
    superCategories: Category[];
    categories: {
      [key: string]: Category[];
    };
    allItems: FoodItem[];
  };
}

interface CartItem {
  id: string;
  foodItemId: string;
  name: string;
  variation: string;
  price: number;
  quantity: number;
  total: number;
  image: any;
}

export default function MainBilling() {
  const [selectedSuperCategory, setSelectedSuperCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [foodData, setFoodData] = useState<FoodListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stewardId, setStewardId] = useState<string | null>(null);
  const params = useGlobalSearchParams();

  useEffect(() => {
    setStewardId(params.stewardId as string || null);

    const fetchFoodData = async () => {
      const login_token = await AsyncStorage.getItem('login_token');
      try {
        const response = await axios.post('https://raiza.digieclipse.com/App_apiv2/app_api', {
          function: "get_food_list",
          data: {
            login_token: login_token,
          }
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.data.status === 'success') {
          setFoodData(response.data);
        } else {
          setError('Failed to fetch food data');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, []);

  // Transform API data to match your existing structure
  const superCategories = foodData?.food_list.superCategories.map(sc => ({
    id: sc.id,
    name: sc.name
  })) || [];

  const categories = foodData?.food_list.categories ?
    Object.keys(foodData.food_list.categories).reduce((acc, superId) => {
      const superCatName = foodData.food_list.superCategories.find(sc => sc.id === superId)?.name || superId;
      acc[superId] = foodData.food_list.categories[superId].map(cat => cat.name);
      return acc;
    }, {} as Record<string, string[]>) : {};

  // Add "All" category that combines all items
  if (foodData?.food_list.categories && superCategories.length > 0) {
    categories['all'] = [];
    Object.values(foodData.food_list.categories).forEach(catList => {
      catList.forEach(cat => {
        if (!categories['all'].includes(cat.name)) {
          categories['all'].push(cat.name);
        }
      });
    });
  }

  const allItems = foodData?.food_list.allItems.map(item => ({
    id: item.id,
    name: item.name,
    category: foodData.food_list.categories[item.super_category_id]?.find(c => c.id === item.category_id)?.name || item.category_id,
    superCategory: item.super_category_id,
    image: { uri: item.image },
    variations: item.variations.map(v => ({
      size: v.size,
      price: v.price,
      ris_id: v.ris_id
    }))
  })) || [];

  const getFilteredItems = () => {
    let items = allItems;

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedItem) {
      return [selectedItem];
    }

    if (selectedCategory) {
      return items.filter(item => item.category === selectedCategory);
    }

    if (selectedSuperCategory !== 'all') {
      return items.filter(item => item.superCategory === selectedSuperCategory);
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  const getCurrentCategories = () => {
    return categories[selectedSuperCategory as keyof typeof categories] || [];
  };

  const currentCategories = getCurrentCategories();

  const increment = (variationKey: string) => {
    setQuantities(prev => ({
      ...prev,
      [variationKey]: (prev[variationKey] || 0) + 1
    }));
  };

  const decrement = (variationKey: string) => {
    setQuantities(prev => {
      const count = prev[variationKey] || 0;
      if (count > 1) return { ...prev, [variationKey]: count - 1 };
      const updated = { ...prev };
      delete updated[variationKey];
      return updated;
    });
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const risSet = new Set((selectedItem.variations || []).map(v => v.ris_id));
    const entries = Object.entries(quantities).filter(
      ([rid, qty]) => risSet.has(rid) && (qty as number) > 0
    );

    if (entries.length === 0) {
      Alert?.alert?.('No size selected', 'Increase quantity for at least one size.');
      return;
    }

    const nextCart = [...cartItems];

    entries.forEach(([rid, qty]) => {
      const variation = selectedItem.variations.find(v => v.ris_id === rid);
      if (!variation) return;

      const quantityNum = Number(qty) || 1;
      const row: CartItem = {
        id: variation.ris_id,
        foodItemId: selectedItem.id,
        name: selectedItem.name,
        variation: variation.size,
        price: variation.price,
        quantity: quantityNum,
        total: variation.price * quantityNum,
        image: selectedItem.image,
      };

      const idx = nextCart.findIndex(ci => ci.id === variation.ris_id);
      if (idx >= 0) {
        nextCart[idx] = row;
      } else {
        nextCart.push(row);
      }
    });

    setCartItems(nextCart);

    setQuantities(prev => {
      const copy = { ...prev };
      risSet.forEach(rid => { delete copy[rid]; });
      return copy;
    });

    setSelectedItem(null);
    setSelectedVariation(null);
  };


  const total = cartItems.reduce((sum, item) => sum + item.total, 0);
  console.log('Full Card:', cartItems);
  console.log('Steward ID:', stewardId);
  console.log('Table ID:', params.tableId);

  const navigateToBillScreen = () => {
    if (params.isTakeAway === "true") {
      router.push({
        pathname: '/billScreen',
        params: {
          cartItems: JSON.stringify(cartItems),
          total: total.toFixed(2),
          tableId: -1,
          stewardId: params.stewardId || '',
          isTakeAway: "true",
        }
      });
    } else {
      router.push({
        pathname: '/billScreen',
        params: {
          cartItems: JSON.stringify(cartItems),
          total: total.toFixed(2),
          tableId: params.tableId || 'Unknown Table',
          stewardId: params.stewardId || '',
          isTakeAway: "false",
        }
      });
    }

  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f60" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setSelectedItem(null);
            setSelectedVariation(null);
            setCartItems([]);
            setQuantities({});
            router.push('/table');
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Main Billing</Text>
          <View style={styles.tableNumberText}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{params.tableId}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.logoText}><Text style={{ color: '#f60' }}>i</Text>POS</Text>
          <Ionicons name="menu" size={24} color="#555" style={{ marginLeft: 10 }} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Super Category Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={superCategories}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.tabs}
          renderItem={({ item: tab }) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, selectedSuperCategory === tab.id && styles.tabActive]}
              onPress={() => {
                setSelectedSuperCategory(tab.id);
                setSelectedCategory(null);
                setSelectedItem(null);
                setSearchQuery(''); // Clear search when changing category
              }}
            >
              <Text style={[styles.tabText, selectedSuperCategory === tab.id && styles.tabTextActive]}>{tab.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Category Cards - Always shown but filtered based on super category */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={currentCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, selectedCategory === item && styles.categoryCardActive]}
              onPress={() => {
                setSelectedCategory(selectedCategory === item ? null : item);
                setSelectedItem(null);
                setSearchQuery(''); // Clear search when changing category
              }}
            >
              <Image source={require('../../assets/images/noodles.png')} style={styles.categoryImage} />
              <Text style={styles.categoryName}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product Grid */}
      <View style={styles.productsContainer}>
        {!selectedItem ? (
          <FlatList
            data={filteredItems}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { width: boxWidth }]}
                onPress={() => setSelectedItem(item)}
              >
                <Text style={styles.itemCode}>{item.id}</Text>
                <View style={styles.cardRow}>
                  <Image source={item.image || require('../../assets/images/noodles.png')} style={styles.image} />
                  <View style={styles.infoSection}>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          // Item detail view when an item is selected
          <View style={styles.itemDetailContainer}>
            <View style={[styles.card, styles.itemDetailCard]}>
              <Text style={styles.itemCode}>{selectedItem.id}</Text>
              <View style={styles.cardRow}>
                <Image source={selectedItem.image || require('../../assets/images/noodles.png')} style={styles.image} />
                <View style={styles.infoSection}>
                  <Text style={styles.itemName}>{selectedItem.name}</Text>
                </View>
              </View>
              {selectedItem?.variations?.map((variation) => {
                const key = variation.ris_id;              // ✅ use ris_id as the key
                return (
                  <View key={key} style={styles.variationOption}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8 }}>
                      <Text style={styles.variationText}>{variation.size}</Text>
                      <Text style={styles.variationText}>{variation.price} LKR</Text>
                    </View>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyButton} onPress={() => decrement(key)}>
                        <Text style={styles.qtyIcon}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{quantities[key] || 0}</Text>
                      <TouchableOpacity
                        style={styles.qtyButtonOrange}
                        onPress={() => {
                          // You no longer need setSelectedVariation here
                          increment(key);                 // ✅ increments by ris_id
                        }}
                      >
                        <Text style={styles.qtyIconWhite}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={addToCart}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Total Section */}

      <TouchableOpacity
        style={styles.totalBar}
        onPress={navigateToBillScreen}
      >
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>{total.toFixed(2)} LKR</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f4f2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 30, paddingBottom: 12, },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#222', right: 60 },
  tableNumberText: { backgroundColor: '#000', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 0, alignSelf: 'center', right: 50 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#222' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 10, padding: 10, borderRadius: 10, },
  searchIcon: { marginRight: 10 },
  searchText: { color: '#888', fontSize: 16 },
  tabsContainer: { marginBottom: 10, },
  tabs: { paddingHorizontal: 10, },
  tabButton: { paddingVertical: 8, paddingHorizontal: 15, height: 35, marginRight: 8, borderRadius: 20, backgroundColor: '#e2dfdd', },
  tabActive: { backgroundColor: '#f57c00' },
  tabText: { fontSize: 14, color: '#333' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  categoriesContainer: { height: 110, marginBottom: 10, },
  categoriesList: { paddingHorizontal: 15, },
  categoryCard: { backgroundColor: '#fff', borderRadius: 10, marginRight: 10, alignItems: 'center', padding: 10, width: 100, height: 90, },
  categoryCardActive: { backgroundColor: '#f6e9e1', borderColor: '#f57c00', borderWidth: 1, },
  categoryImage: { width: 50, height: 50, resizeMode: 'contain', marginBottom: 6, },
  categoryName: { fontSize: 13, fontWeight: '600', textAlign: 'center', },
  productsContainer: { flex: 1, marginBottom: 80, },
  productsList: { paddingHorizontal: 12, },
  itemDetailContainer: { padding: 16, },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 7, marginHorizontal: 5, padding: 10, },
  itemDetailCard: { width: '100%', marginBottom: 16, },
  variationCard: { width: '100%', marginBottom: 16, },
  itemCode: { position: 'absolute', top: 8, right: 8, backgroundColor: '#f57c00', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, fontSize: 12, borderRadius: 4, zIndex: 1, },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, },
  image: { width: 70, height: 70, resizeMode: 'contain', marginRight: 10, marginTop: 20, },
  infoSection: { flex: 1, paddingTop: 20, },
  itemName: { fontSize: 16, fontWeight: '500', color: '#333', },
  itemPrice: { fontWeight: '700', color: '#000', marginTop: 4, },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f4f2', borderRadius: 20, marginTop: 10, },
  qtyButton: { backgroundColor: '#ccc', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 30, },
  qtyButtonOrange: { backgroundColor: '#f57c00', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 30, },
  qtyIcon: { color: '#333', fontSize: 16, fontWeight: '700', },
  qtyIconWhite: { color: '#fff', fontSize: 16, fontWeight: '700', },
  qtyText: { fontSize: 16, marginHorizontal: 8, fontWeight: '600', },
  variationTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, },
  variationOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, },
  variationText: { fontSize: 15, },
  addButton: { backgroundColor: '#f57c00', borderRadius: 10, padding: 15, alignItems: 'center', },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16, },
  totalBar: { position: 'absolute', bottom: 40, left: 16, right: 16, backgroundColor: '#1a1a1a', borderRadius: 10, padding: 16, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', },
  totalLabel: { color: '#fff', fontSize: 18, fontWeight: '600', },
  totalAmount: { color: '#fff', fontSize: 18, fontWeight: '700', },

});
