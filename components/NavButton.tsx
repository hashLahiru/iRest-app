import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavButtonProps = {
  label: string;
  icon: any;
  route?: string;
  onPress?: () => void;
  active?: boolean;
};

const NavButton = ({ label, icon, route, onPress, active = false }: NavButtonProps) => (
  <TouchableOpacity
    style={styles.navItem}
    onPress={onPress || (() => router.push(route || ''))}
  >
    <Ionicons
      name={icon}
      size={24}
      color={active ? '#f57c00' : '#ccc'}
    />
    <Text style={[styles.navText, active && { color: '#f57c00' }]}>{label}</Text>
  </TouchableOpacity>
);

type NavBarProps = {
  activeRoute: 'Dining' | 'Take Away' | 'Delivery';
  onQuickMenuPress: () => void;
};

const NavBar = ({ activeRoute }: NavBarProps) => {
  return (
    <View style={styles.bottomNav}>
      <NavButton label="Dining" icon="restaurant" route="/table" active={activeRoute === 'Dining'} />
      <NavButton label="Take Away" icon="cafe" route="/takeaway" active={activeRoute === 'Take Away'} />
      <NavButton label="Delivery" icon="car" route="/delivery" active={activeRoute === 'Delivery'} />
      {/* <NavButton label="Quick" icon="menu" route="/customproduct" active={activeRoute === 'Quick'} /> */}
    </View>
  );
};

export default NavBar;

const styles = StyleSheet.create({
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
});
