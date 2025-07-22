import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const TABLE_DATA = Array.from({ length: 30 }, (_, i) => ({
    id: `${i + 1}`,
    label: `T0${(i % 3) + 1}`,
    amount: [8500, 15000, ''][i % 3],
    code: ['PCW40', 'PCW45', 'PCW30'][i % 3],
    color: ['#555', '#f57c00', '#ddd'][i % 3],
}));

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const boxSize = screenWidth / numColumns - 24;

const TableScreen = () => {
    const [modalVisible, setModalVisible] = useState(false); // side menu
    const [quickMenuVisible, setQuickMenuVisible] = useState(false); // quick menu modal

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => router.push('/steward')}
            style={[styles.tableBox, { backgroundColor: item.color, width: boxSize, height: boxSize }]}
        >
            <Text style={styles.amount}>{item.amount}</Text>
            <Text style={styles.tableId}>{item.label}</Text>
            <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{item.code}</Text>
            </View>
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
                data={TABLE_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
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
        </View>
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

export default TableScreen;

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
    tableBox: {
        borderRadius: 12,
        margin: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        width: 100,
    },
    amount: {
        fontSize: 20,
        color: '#fff',
        marginTop: 20,
        fontWeight: 'bold',
    },
    tableId: {
        color: '#fff',
        position: 'absolute',
        top: 6,
        right: 10,
        fontWeight: '600',
    },
    tagContainer: {
        backgroundColor: '#222',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 25,
        marginBottom: -15,
        left: 25,
    },
    tagText: {
        color: '#fff',
        fontSize: 10,
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
});
