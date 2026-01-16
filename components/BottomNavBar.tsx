import { StyleSheet } from "react-native";

export default function BottomNavBar({ activeTab }) {
  return (
    <View style={styles.bottomNav}>
      <NavButton label="Dining" icon="restaurant" route="/table" />
      <NavButton label="Take Away" icon="cafe" route="/takeaway" />
      <NavButton label="Delivery" icon="car" route="/delivery" />
      <NavButton label="Quick" icon="menu" route="/customproduct" />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
