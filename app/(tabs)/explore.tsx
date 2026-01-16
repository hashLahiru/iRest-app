import { KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';


export default function TabTwoScreen() {
  return (
    <KeyboardAvoidingView>
      <View>
        <Text>Introps</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
