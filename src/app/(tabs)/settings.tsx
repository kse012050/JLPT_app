import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return <SafeAreaView style={styles.screen} edges={['top']}>
    <View style={styles.content}>
      <Text style={styles.eyebrow}>내 정보</Text>
      <Text style={styles.title}>설정</Text>
      <Text style={styles.description}>학습 방식과 계정 연결을 관리하세요.</Text>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>계정</Text>
        <Text style={styles.cardTitle}>로그인 없이 이용 중</Text>
        <Text style={styles.cardDescription}>계정 연결은 준비 중입니다. 연결 기능이 열리면 이곳에서 로그인할 수 있어요.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')} accessibilityRole="button">
          <Text style={styles.buttonText}>로그인 화면 보기  →</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>학습 설정</Text>
        <Text style={styles.cardDescription}>목표 시험일, 한글 발음 표시 방식, 학습 알림을 이곳에서 설정할 예정입니다.</Text>
      </View>

      <Pressable style={styles.previewButton} onPress={() => router.push('/onboarding-preview')} accessibilityRole="button">
        <Text style={styles.previewText}>첫 화면 다시 보기  →</Text>
      </Pressable>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFDFC' },
  content: { padding: 24, paddingTop: 34, gap: 18 },
  eyebrow: { color: '#B90538', fontSize: 12, fontFamily: 'NotoSansKR_700Bold' },
  title: { color: '#29252A', fontSize: 28, fontFamily: 'NotoSansKR_700Bold', marginTop: -10 },
  description: { color: '#89848A', fontSize: 14, lineHeight: 23, fontFamily: 'NotoSansKR_400Regular', marginTop: -13 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E2E3', borderRadius: 18, padding: 18, gap: 9 },
  cardEyebrow: { color: '#B90538', fontSize: 11, fontFamily: 'NotoSansKR_700Bold' },
  cardTitle: { color: '#29252A', fontSize: 18, fontFamily: 'NotoSansKR_700Bold' },
  cardDescription: { color: '#756F74', fontSize: 12, lineHeight: 19, fontFamily: 'NotoSansKR_400Regular' },
  button: { alignSelf: 'flex-start', backgroundColor: '#B90538', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11, marginTop: 6 },
  buttonText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'NotoSansKR_700Bold' },
  previewButton: { alignSelf: 'flex-start', paddingVertical: 10 },
  previewText: { color: '#B90538', fontSize: 12, fontFamily: 'NotoSansKR_700Bold' },
});
