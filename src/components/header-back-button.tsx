import { Pressable, StyleSheet, View } from 'react-native';

export function HeaderBackButton({ onPress, color = '#201F24' }: { onPress: () => void; color?: string }) {
  return <Pressable onPress={onPress} style={styles.button} accessibilityRole="button" accessibilityLabel="뒤로 가기">
    <View style={[styles.chevron, { borderColor: color }]} />
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chevron: { width: 11, height: 11, borderLeftWidth: 2, borderBottomWidth: 2, transform: [{ rotate: '45deg' }] },
});
