import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const boxSize = screenWidth / numColumns - 24;

const TableScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [quickMenuVisible, setQuickMenuVisible] = useState(false);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const { tableId, isRefresh } = useLocalSearchParams();

    useFocusEffect(
        React.useCallback(() => {
            if (isRefresh === 'true') {
                fetchTableData();
            }
        }, [isRefresh])
    );

    useEffect(() => {
        fetchTableData();
    }, []);

    const fetchTableData = async () => {
        const login_token = await AsyncStorage.getItem("login_token");
        try {
            setLoading(true);
            const response = await fetch('http://raiza.digieclipse.com/App_apiv2/app_api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "function": "get_table_list",
                    "data": {
                        "login_token": login_token
                    }
                })
            });

            const data = await response.json();
            if (data.status === "success") {
                setTables(data.table_count);
            } else {
                console.error("Failed to fetch tables");
            }
        } catch (error) {
            console.error("Error fetching tables:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTableColor = (status) => {
        switch (status) {
            case 'act': return '#86C1E9'; // Blue for active
            case 'inv': return '#E67F22';
            default: return '#A9B7B8';    // Grey for other statuses
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                if (item.status === 'done') {
                    router.push({
                        pathname: '/steward',
                        params: { tableId: item.table_id }
                    });
                }
                else if (item.status === 'act') {
                    router.push({
                        pathname: '/billScreen',
                        params: { tableId: item.table_id, isActive: "true" }
                    });
                } else if (item.status === 'inv') {
                    router.push({
                        pathname: '/payment',
                        params: { tableId: item.table_id, isActive: "false", isInvoice: "false", isDone: "true" }
                    });
                }
                else {
                    console.log('Navigating to main billing for table:', item.table_id);
                    router.push({
                        pathname: '/mainbilling',
                        params: { tableId: item.table_id }
                    });
                }
            }}
            style={[styles.tableBox, {
                backgroundColor: getTableColor(item.status),
                width: boxSize,
                height: boxSize
            }]}
        >
            {/* Top-right: Table ID */}
            <Text style={styles.tableId}>T{item.table_id}</Text>

            {/* Amount in center */}
            <Text style={styles.tablePrice}>
                {item.order && item.order !== "0" ? `${item.order}` : '0.00'}
            </Text>

            {/* Bottom overlay with dark transparent background */}
            <View style={styles.bottomOverlay}>
                {/* Bottom-left: Steward ID */}
                <Text style={styles.stewardId}>
                    {item.steward && item.steward !== -1 ? `ST-${item.steward}` : 'N/A'}
                </Text>

                {/* Bottom-right: Empty for now */}
                <Text style={styles.foodCountText}>
                    {item.order_item_count}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#f57c00" />
            </View>
        );
    }

    return (
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
                <Text style={styles.headerTitle}>Dining</Text>
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

            {/* Table Grid */}
            <FlatList
                data={tables}
                renderItem={renderItem}
                keyExtractor={(item) => item.table_id.toString()}
                numColumns={numColumns}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Bottom Menu */}
            <View style={styles.bottomNav}>
                <NavButton label="Dining" icon="restaurant" route="/table" active />
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
        </SafeAreaView>

    );
};

const NavButton = ({ label, icon, route, onPress, active = false }) => (
    <TouchableOpacity
        style={styles.navItem}
        onPress={onPress || (() => router.push(route))}
    >
        <Ionicons
            name={icon}
            size={24}
            color={active ? '#f57c00' : '#ccc'}
        />
        <Text style={[styles.navText, active && { color: '#f57c00' }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f4f2',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
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
    tableBox: {
        borderRadius: 12,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        width: 100,
    },
    tableId: {
        color: '#fff',
        position: 'absolute',
        top: 6,
        right: 10,
        fontWeight: '600',
    },
    tablePrice: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stewardId: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    tagContainer: {
        backgroundColor: '#000',
        borderRadius: 5,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    tagText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
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
    quickMenuModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 20,
        paddingTop: 40
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
    foodCountText: {
        color: '#fff',
    }
});

export default TableScreen;
