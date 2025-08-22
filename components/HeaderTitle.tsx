import { useThemeColor } from '@/hooks/useThemeColor';
import { Platform, StyleSheet, Text, View } from 'react-native';

export function HeaderTitle() {
  const color = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color }, Platform.OS === 'ios' && styles.iosText]}>
        iSkate
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Lalezar',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  iosText: {
    marginTop: -18,
  },
});