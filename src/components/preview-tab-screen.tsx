import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PreviewTabScreen({ eyebrow, title, description }: {
  eyebrow: string; title: string; description: string;
}) {
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.content}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.description}>{description}</Text>
        <Pressable style={s.button} onPress={() => router.replace('/')}>
          <Text style={s.buttonText}>학습 홈으로 돌아가기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFDFC' },
  content: { padding: 24, paddingTop: 50 },
  eyebrow: { color: '#EF3863', fontSize: 12, fontWeight: '800' },
  title: { color: '#29252A', fontSize: 28, fontWeight: '800', marginTop: 10 },
  description: { color: '#89848A', fontSize: 14, lineHeight: 23, marginTop: 12 },
  button: { alignSelf: 'flex-start', backgroundColor: '#EF3863', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 13, marginTop: 24 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
